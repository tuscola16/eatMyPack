import { FoodItem, FoodCategory } from '../types/food';
import { RaceConfig, RacePhase, PhaseType } from '../types/race';
import { PackPlan, PackPhase, PackEntry, PinnedPhaseEntry, PhaseRejection } from '../types/plan';
import { calculatePhases } from './phaseCalculator';
import { scoreFood, ScoringOptions } from './scoringEngine';
import { calculatePartialFill } from './quantityCalculator';
import * as Crypto from 'expo-crypto';

export interface PackOptions {
  excludedCategories?: FoodCategory[];
  preferredCategories?: FoodCategory[];
}

function generateId(): string {
  return Crypto.randomUUID();
}

const FILL_TOLERANCE = 0.90; // 90% of target is acceptable
const MAX_CAFFEINE_MG = 400;

function makePackEntry(food: FoodItem, servings: number, phaseType: PhaseType): PackEntry {
  return {
    food,
    servings,
    total_calories: food.calories * servings,
    total_weight_g: food.serving_size_g * servings,
    total_carbs_g: food.carbs_g * servings,
    total_sodium_mg: food.sodium_mg * servings,
    total_volume_ml: food.volume_ml_per_serving * servings,
    assigned_phase: phaseType,
  };
}

function computePlanTotals(phases: PackPhase[]) {
  return {
    total_calories: phases.reduce((s, p) => s + p.total_calories, 0),
    total_weight_g: phases.reduce((s, p) => s + p.total_weight_g, 0),
    total_volume_ml: phases.reduce((s, p) => s + p.total_volume_ml, 0),
    total_items: phases.reduce((s, p) => s + p.entries.length, 0),
  };
}

export function buildPack(
  raceConfig: RaceConfig,
  availableFoods: FoodItem[],
  rejectedIds: string[] = [],
  pinnedIds: string[] = [],
  options?: PackOptions,
  planName: string = '',
  pinnedPhaseEntries: PinnedPhaseEntry[] = [],
): PackPlan {
  // 1. Calculate phases
  const phases = calculatePhases(raceConfig);

  // 2. Filter available foods
  let foodPool = availableFoods.filter(f => !rejectedIds.includes(f.id));

  if (options?.excludedCategories?.length) {
    foodPool = foodPool.filter(f => !options.excludedCategories!.includes(f.category));
  }

  if (pinnedIds.length > 0) {
    foodPool = foodPool.filter(f => pinnedIds.includes(f.id));
  }

  if (raceConfig.distance !== '200mi' && pinnedIds.length === 0) {
    foodPool = foodPool.filter(f => f.category !== 'freeze_dried');
  }

  // 3. Build each phase
  const maxVolume = raceConfig.max_volume_ml ?? Infinity;
  let remainingVolumeMl = maxVolume;
  const packPhases: PackPhase[] = [];

  const scoringOptions: ScoringOptions | undefined = options?.preferredCategories?.length
    ? { preferredCategories: options.preferredCategories }
    : undefined;

  const phaseVolumeBudgets = computePhaseVolumeBudgets(phases, raceConfig);

  let prevPhaseRefill = false;
  let prevWaystationId: string | undefined;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];

    if (prevPhaseRefill && raceConfig.waystations) {
      const ws = raceConfig.waystations.find(w => w.id === prevWaystationId);
      remainingVolumeMl = ws?.pack_volume_ml ?? maxVolume;
    }

    const volumeForPhase = phaseVolumeBudgets
      ? Math.min(phaseVolumeBudgets[i], remainingVolumeMl)
      : remainingVolumeMl;

    // Pre-fill locked entries for this phase
    const prePinned = buildPrePinnedEntries(pinnedPhaseEntries, phase.type, availableFoods);

    const packPhase = fillPhase(phase, foodPool, availableFoods, volumeForPhase, scoringOptions, prePinned);
    packPhases.push(packPhase);
    remainingVolumeMl -= packPhase.total_volume_ml;

    prevPhaseRefill = phase.is_pack_refill ?? false;
    prevWaystationId = phase.waystation_id;
  }

  // 4. Caffeine balancing
  balanceCaffeine(packPhases);

  return {
    id: generateId(),
    name: planName,
    created_at: new Date().toISOString(),
    race_config: raceConfig,
    phases: packPhases,
    ...computePlanTotals(packPhases),
    rejected_food_ids: rejectedIds,
    pinned_food_ids: pinnedIds,
    pinned_phase_entries: pinnedPhaseEntries,
  };
}

/** Build the pre-filled PackEntry array for pinned-phase entries */
function buildPrePinnedEntries(
  pinnedPhaseEntries: PinnedPhaseEntry[],
  phaseType: PhaseType,
  allFoods: FoodItem[],
  excludeFoodId?: string,
): PackEntry[] {
  return pinnedPhaseEntries
    .filter(p => p.phaseType === phaseType && p.foodId !== excludeFoodId)
    .map(pin => {
      const food = allFoods.find(f => f.id === pin.foodId);
      return food ? makePackEntry(food, pin.servings, phaseType) : null;
    })
    .filter((e): e is PackEntry => e !== null);
}

/**
 * Spread the volume budget proportionally across phases (by duration).
 * Returns undefined if no volume limit is set.
 */
function computePhaseVolumeBudgets(
  phases: RacePhase[],
  config: RaceConfig,
): number[] | undefined {
  if (!config.max_volume_ml) return undefined;

  const waystations = config.waystations ?? [];
  const budgets: number[] = [];

  let segmentStart = 0;
  const segments: { startIdx: number; endIdx: number; volume: number }[] = [];

  for (let i = 0; i < phases.length; i++) {
    if (phases[i].is_pack_refill) {
      const ws = waystations.find(w => w.id === phases[i].waystation_id);
      segments.push({
        startIdx: segmentStart,
        endIdx: i,
        volume: segmentStart === 0
          ? config.max_volume_ml
          : (ws?.pack_volume_ml ?? config.max_volume_ml),
      });
      segmentStart = i + 1;
    }
  }
  segments.push({
    startIdx: segmentStart,
    endIdx: phases.length - 1,
    volume: segmentStart === 0
      ? config.max_volume_ml
      : (() => {
          const lastRefillPhase = phases[segmentStart - 1];
          const ws = waystations.find(w => w.id === lastRefillPhase?.waystation_id);
          return ws?.pack_volume_ml ?? config.max_volume_ml;
        })(),
  });

  for (const seg of segments) {
    const segPhases = phases.slice(seg.startIdx, seg.endIdx + 1);
    const totalDuration = segPhases.reduce((s, p) => s + p.duration_hours, 0);

    if (totalDuration <= 0) {
      for (let i = seg.startIdx; i <= seg.endIdx; i++) budgets[i] = 0;
      continue;
    }
    for (let i = seg.startIdx; i <= seg.endIdx; i++) {
      budgets[i] = (phases[i].duration_hours / totalDuration) * seg.volume;
    }
  }

  return budgets;
}

function fillPhase(
  phase: RacePhase,
  foodPool: FoodItem[],
  allFoods: FoodItem[],
  remainingVolumeMl: number,
  scoringOptions?: ScoringOptions,
  prePinnedEntries: PackEntry[] = [],
): PackPhase {
  const entries: PackEntry[] = [...prePinnedEntries];

  // Deduct pre-pinned entries from budget
  let remainingCal = phase.total_cal_target
    - prePinnedEntries.reduce((s, e) => s + e.total_calories, 0);
  let localRemainingVolume = remainingVolumeMl
    - prePinnedEntries.reduce((s, e) => s + e.total_volume_ml, 0);

  // Pre-pinned foods are already used
  const usedFoodIds = new Set<string>(prePinnedEntries.map(e => e.food.id));

  let iterations = 0;
  const maxIterations = 15;

  while (remainingCal > phase.total_cal_target * (1 - FILL_TOLERANCE) && iterations < maxIterations) {
    iterations++;

    if (localRemainingVolume <= 0) break;

    const scored = foodPool
      .filter(f => !usedFoodIds.has(f.id))
      .map(f => ({
        food: f,
        score: scoreFood(f, phase, entries, allFoods, scoringOptions),
      }))
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) break;

    const pick = scored[0];
    let servings = calculatePartialFill(pick.food, remainingCal, phase);

    if (servings <= 0) break;

    const volumePerServing = pick.food.volume_ml_per_serving;
    if (localRemainingVolume !== Infinity && volumePerServing > 0) {
      const maxServingsByVolume = Math.floor(localRemainingVolume / volumePerServing);
      servings = Math.min(servings, maxServingsByVolume);
      if (servings <= 0) {
        usedFoodIds.add(pick.food.id);
        continue;
      }
    }

    const entry = makePackEntry(pick.food, servings, phase.type);
    entries.push(entry);
    usedFoodIds.add(pick.food.id);
    remainingCal -= entry.total_calories;
    localRemainingVolume -= entry.total_volume_ml;

    if (remainingCal <= 0) break;
  }

  const totalCal = entries.reduce((sum, e) => sum + e.total_calories, 0);
  const totalCarbs = entries.reduce((sum, e) => sum + e.total_carbs_g, 0);
  const totalSodium = entries.reduce((sum, e) => sum + e.total_sodium_mg, 0);
  const totalWeight = entries.reduce((sum, e) => sum + e.total_weight_g, 0);
  const totalVolume = entries.reduce((sum, e) => sum + e.total_volume_ml, 0);

  return {
    phase,
    entries,
    total_calories: totalCal,
    total_carbs_g: totalCarbs,
    total_sodium_mg: totalSodium,
    total_weight_g: totalWeight,
    total_volume_ml: totalVolume,
    target_met_pct: phase.total_cal_target > 0 ? (totalCal / phase.total_cal_target) * 100 : 100,
  };
}

function balanceCaffeine(packPhases: PackPhase[]): void {
  let totalCaffeine = 0;

  for (const pp of packPhases) {
    for (const entry of pp.entries) {
      totalCaffeine += entry.food.caffeine_mg * entry.servings;
    }
  }

  if (totalCaffeine > MAX_CAFFEINE_MG) {
    for (const pp of packPhases) {
      if (pp.phase.type === 'early' || pp.phase.type === 'mid') {
        pp.entries = pp.entries.map(entry => {
          if (entry.food.is_caffeinated && entry.servings > 1) {
            return makePackEntry(entry.food, 1, entry.assigned_phase);
          }
          return entry;
        });
        pp.total_calories = pp.entries.reduce((s, e) => s + e.total_calories, 0);
        pp.total_carbs_g = pp.entries.reduce((s, e) => s + e.total_carbs_g, 0);
        pp.total_sodium_mg = pp.entries.reduce((s, e) => s + e.total_sodium_mg, 0);
        pp.total_weight_g = pp.entries.reduce((s, e) => s + e.total_weight_g, 0);
        pp.total_volume_ml = pp.entries.reduce((s, e) => s + e.total_volume_ml, 0);
        pp.target_met_pct = pp.phase.total_cal_target > 0 ? (pp.total_calories / pp.phase.total_cal_target) * 100 : 100;
      }
    }
  }
}

/** Re-run algorithm with a rejection added (global reject — rebuilds entire plan) */
export function rejectAndRebuild(
  currentPlan: PackPlan,
  rejectedFoodId: string,
  availableFoods: FoodItem[],
  options?: PackOptions,
): PackPlan {
  const newRejections = [...currentPlan.rejected_food_ids, rejectedFoodId];
  return buildPack(
    currentPlan.race_config,
    availableFoods,
    newRejections,
    currentPlan.pinned_food_ids,
    options,
    currentPlan.name,
    currentPlan.pinned_phase_entries ?? [],
  );
}

/**
 * Rebuild a single phase, optionally excluding one food from that phase only
 * (phase-scoped removal — does NOT add to global rejections).
 */
export function rebuildPhase(
  plan: PackPlan,
  phaseIndex: number,
  allFoods: FoodItem[],
  excludeFoodIdInPhase?: string,
  pinnedPhaseEntries: PinnedPhaseEntry[] = [],
  options?: PackOptions,
): PackPlan {
  const packPhase = plan.phases[phaseIndex];
  if (!packPhase) return plan;

  const phase = packPhase.phase;

  // Build food pool using the same constraints as the original plan
  let foodPool = allFoods.filter(f => !plan.rejected_food_ids.includes(f.id));

  if (options?.excludedCategories?.length) {
    foodPool = foodPool.filter(f => !options.excludedCategories!.includes(f.category));
  }
  if (plan.pinned_food_ids.length > 0) {
    foodPool = foodPool.filter(f => plan.pinned_food_ids.includes(f.id));
  }
  if (plan.race_config.distance !== '200mi' && plan.pinned_food_ids.length === 0) {
    foodPool = foodPool.filter(f => f.category !== 'freeze_dried');
  }

  // Accumulate phase rejections: add the new one to the existing list
  const existingPhaseRejections = plan.phase_rejections ?? [];
  const newPhaseRejections: PhaseRejection[] = excludeFoodIdInPhase
    ? [
        ...existingPhaseRejections.filter(
          r => !(r.foodId === excludeFoodIdInPhase && r.phaseType === phase.type),
        ),
        { foodId: excludeFoodIdInPhase, phaseType: phase.type },
      ]
    : existingPhaseRejections;

  // Exclude ALL foods ever rejected from this phase
  const phaseRejectedIds = newPhaseRejections
    .filter(r => r.phaseType === phase.type)
    .map(r => r.foodId);
  if (phaseRejectedIds.length > 0) {
    foodPool = foodPool.filter(f => !phaseRejectedIds.includes(f.id));
  }

  const prePinned = buildPrePinnedEntries(pinnedPhaseEntries, phase.type, allFoods, excludeFoodIdInPhase);

  const scoringOptions: ScoringOptions | undefined = options?.preferredCategories?.length
    ? { preferredCategories: options.preferredCategories }
    : undefined;

  const newPackPhase = fillPhase(phase, foodPool, allFoods, Infinity, scoringOptions, prePinned);
  const newPhases = plan.phases.map((p, i) => (i === phaseIndex ? newPackPhase : p));

  return {
    ...plan,
    phases: newPhases,
    ...computePlanTotals(newPhases),
    phase_rejections: newPhaseRejections,
  };
}

/**
 * Adjust the serving count of a specific food in a phase, then rebuild the
 * rest of that phase around the adjusted entry (leaving other phases untouched).
 */
export function adjustServingsInPhase(
  plan: PackPlan,
  phaseIndex: number,
  foodId: string,
  newServings: number,
  allFoods: FoodItem[],
  pinnedPhaseEntries: PinnedPhaseEntry[] = [],
  options?: PackOptions,
): PackPlan {
  const packPhase = plan.phases[phaseIndex];
  if (!packPhase || newServings <= 0) return plan;

  const phaseType = packPhase.phase.type;

  // Treat the adjusted food as a temporary pin for this rebuild only
  const tempPin: PinnedPhaseEntry = { foodId, phaseType, servings: newServings };
  const mergedPins: PinnedPhaseEntry[] = [
    ...pinnedPhaseEntries.filter(p => !(p.foodId === foodId && p.phaseType === phaseType)),
    tempPin,
  ];

  return rebuildPhase(plan, phaseIndex, allFoods, undefined, mergedPins, options);
}
