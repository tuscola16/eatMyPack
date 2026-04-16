import { RaceConfig, RacePhase, PhaseType, RaceDistance, Conditions, Waystation, DISTANCE_TO_MILES } from '../types/race';
import { FoodCategory, GutRating } from '../types/food';
import { RACE_DEFAULTS, CONDITIONS_ADJUSTMENTS, PHASE_TEMPLATES, DURATION_SUGGESTIONS } from '../data/raceDefaults';

function getMidpoint(range: [number, number]): number {
  return (range[0] + range[1]) / 2;
}

export function calculatePhases(config: RaceConfig): RacePhase[] {
  const { distance, expected_duration_hours: duration, conditions } = config;

  // Get base targets
  const distKey = distance === 'custom' ? '50mi' : distance; // default to 50mi targets for custom
  const defaults = RACE_DEFAULTS[distKey as Exclude<RaceDistance, 'custom'>];
  const condAdj = CONDITIONS_ADJUSTMENTS[conditions];

  let baseCal = getMidpoint(defaults.cal_per_hour) * condAdj.cal_mult;
  if (config.cal_per_hour_override != null) {
    baseCal = config.cal_per_hour_override;
  }
  const baseCarb = getMidpoint(defaults.carb_per_hour);
  const baseSodium = getMidpoint(defaults.sodium_per_hour) * condAdj.sodium_mult;

  const phases: RacePhase[] = [];

  if (duration <= 8) {
    // 50K pattern: early (0-30%), mid (30-75%), final (75-100%)
    const earlyEnd = duration * 0.3;
    const midEnd = duration * 0.75;

    phases.push(buildPhase('early', 0, earlyEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('mid', earlyEnd, midEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('final_push', midEnd, duration, baseCal, baseCarb, baseSodium));
  } else if (duration <= 14) {
    // 50mi pattern: early, mid, late, final
    const earlyEnd = Math.min(3, duration * 0.2);
    const midEnd = duration * 0.55;
    const lateEnd = duration * 0.75;

    phases.push(buildPhase('early', 0, earlyEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('mid', earlyEnd, midEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('late', midEnd, lateEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('final_push', lateEnd, duration, baseCal, baseCarb, baseSodium));
  } else if (duration <= 36) {
    // 100K/100mi pattern: all 5 phases
    const earlyEnd = Math.min(3, duration * 0.1);
    const midEnd = duration * 0.35;
    const lateEnd = duration * 0.55;
    const nightEnd = duration * 0.8;

    phases.push(buildPhase('early', 0, earlyEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('mid', earlyEnd, midEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('late', midEnd, lateEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('night', lateEnd, nightEnd, baseCal, baseCarb, baseSodium));
    phases.push(buildPhase('final_push', nightEnd, duration, baseCal, baseCarb, baseSodium));
  } else {
    // 200mi: repeating day/night cycles
    const earlyEnd = 3;
    phases.push(buildPhase('early', 0, earlyEnd, baseCal, baseCarb, baseSodium));

    let current = earlyEnd;
    let dayBlock = 1;
    while (current < duration * 0.8) {
      const blockDuration = Math.min(12, (duration * 0.8 - current));
      const dayEnd = current + blockDuration * 0.6;
      const nightBlockEnd = current + blockDuration;

      if (dayEnd < duration * 0.75) {
        phases.push(buildPhase(dayBlock % 2 === 1 ? 'mid' : 'late', current, Math.min(dayEnd, duration * 0.75), baseCal, baseCarb, baseSodium));
      }
      if (nightBlockEnd <= duration * 0.8 && dayEnd < duration * 0.8) {
        phases.push(buildPhase('night', dayEnd, nightBlockEnd, baseCal, baseCarb, baseSodium));
      }
      current = nightBlockEnd;
      dayBlock++;
    }

    phases.push(buildPhase('final_push', Math.max(current, duration * 0.8), duration, baseCal, baseCarb, baseSodium));
  }

  // Split phases at waystation boundaries if waystations are configured
  if (config.waystations && config.waystations.length > 0) {
    return splitPhasesAtWaystations(phases, config);
  }

  return phases;
}

/**
 * Resolve mile markers to hour markers and split phases at waystation boundaries.
 * A phase ends at a waystation and a new phase begins afterward.
 */
function splitPhasesAtWaystations(phases: RacePhase[], config: RaceConfig): RacePhase[] {
  const duration = config.expected_duration_hours;

  // Resolve total miles for mile-to-hour conversion
  let totalMiles: number | undefined;
  if (config.distance !== 'custom') {
    totalMiles = DISTANCE_TO_MILES[config.distance];
  } else if (config.custom_distance_km) {
    totalMiles = config.custom_distance_km * 0.621371;
  }

  // Resolve waystation hours, sorted
  const waystationHours: { hour: number; ws: Waystation }[] = config.waystations!
    .map(ws => {
      let hour: number;
      if (ws.marker_type === 'mile' && totalMiles) {
        hour = (ws.marker_value / totalMiles) * duration;
      } else {
        hour = ws.estimated_hour ?? ws.marker_value;
      }
      return { hour: Math.round(hour * 10) / 10, ws };
    })
    .sort((a, b) => a.hour - b.hour);

  const result: RacePhase[] = [];
  const MIN_PHASE_DURATION = 0.25; // 15 minutes minimum

  for (const phase of phases) {
    // Find waystations that fall within this phase
    const splits = waystationHours.filter(
      wh => wh.hour > phase.start_hour + MIN_PHASE_DURATION &&
            wh.hour < phase.end_hour - MIN_PHASE_DURATION
    );

    if (splits.length === 0) {
      result.push(phase);
      continue;
    }

    // Split phase at each waystation boundary
    let currentStart = phase.start_hour;
    for (const split of splits) {
      // Sub-phase before the waystation
      const subPhase = buildPhaseFromParent(phase, currentStart, split.hour);
      subPhase.waystation_id = split.ws.id;
      subPhase.is_pack_refill = split.ws.type === 'pack_refill' || split.ws.type === 'both';
      result.push(subPhase);
      currentStart = split.hour;
    }

    // Remaining sub-phase after last waystation
    if (currentStart < phase.end_hour - MIN_PHASE_DURATION) {
      result.push(buildPhaseFromParent(phase, currentStart, phase.end_hour));
    }
  }

  return result;
}

/**
 * Create a sub-phase from a parent phase with adjusted time bounds and targets.
 */
function buildPhaseFromParent(parent: RacePhase, startHour: number, endHour: number): RacePhase {
  const duration = Math.round((endHour - startHour) * 10) / 10;
  return {
    ...parent,
    start_hour: Math.round(startHour * 10) / 10,
    end_hour: Math.round(endHour * 10) / 10,
    duration_hours: duration,
    total_cal_target: Math.round(parent.cal_per_hour_target * duration),
    total_carb_target_g: Math.round(parent.carb_per_hour_target_g * duration),
    waystation_id: undefined,
    is_pack_refill: undefined,
  };
}

function buildPhase(
  type: PhaseType,
  startHour: number,
  endHour: number,
  baseCal: number,
  baseCarb: number,
  baseSodium: number,
): RacePhase {
  const template = PHASE_TEMPLATES[type];
  const duration = endHour - startHour;
  const calPerHour = baseCal * template.cal_multiplier;
  const carbPerHour = baseCarb * template.carb_emphasis;

  return {
    type,
    label: template.label,
    start_hour: Math.round(startHour * 10) / 10,
    end_hour: Math.round(endHour * 10) / 10,
    duration_hours: Math.round(duration * 10) / 10,
    cal_per_hour_target: Math.round(calPerHour),
    carb_per_hour_target_g: Math.round(carbPerHour),
    sodium_per_hour_target_mg: Math.round(baseSodium),
    total_cal_target: Math.round(calPerHour * duration),
    total_carb_target_g: Math.round(carbPerHour * duration),
    preferred_categories: template.preferred_categories,
    min_gut_rating: template.min_gut_rating,
    notes: template.notes,
  };
}
