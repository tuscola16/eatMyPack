import { RaceConfig, RacePhase, PhaseType, RaceDistance, Conditions } from '../types/race';
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

  return phases;
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
