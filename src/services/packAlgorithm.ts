import { FoodItem, FoodCategory, GUT_RATING_ORDER } from '../types/food';
import { RaceConfig, RacePhase, PhaseType } from '../types/race';
import { PackPlan, PackPhase, PackEntry } from '../types/plan';
import { calculatePhases } from './phaseCalculator';
import { scoreFood, ScoringOptions } from './scoringEngine';
import { calculatePartialFill } from './quantityCalculator';

export interface PackOptions {
  excludedCategories?: FoodCategory[];
  preferredCategories?: FoodCategory[];
}

/** Generate a unique ID without depending on crypto.getRandomValues */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

const FILL_TOLERANCE = 0.90; // 90% of target is acceptable
const OVERFILL_TOLERANCE = 1.15; // Don't exceed 115% of target
const MAX_CAFFEINE_MG = 400;

export function buildPack(
  raceConfig: RaceConfig,
  availableFoods: FoodItem[],
  rejectedIds: string[] = [],
  pinnedIds: string[] = [],
  options?: PackOptions,
  planName: string = '',
): PackPlan {
  // 1. Calculate phases
  const phases = calculatePhases(raceConfig);

  // 2. Filter available foods
  let foodPool = availableFoods.filter(f => !rejectedIds.includes(f.id));

  // Remove excluded categories
  if (options?.excludedCategories?.length) {
    foodPool = foodPool.filter(f => !options.excludedCategories!.includes(f.category));
  }

  // If user pinned specific foods, only use those
  if (pinnedIds.length > 0) {
    foodPool = foodPool.filter(f => pinnedIds.includes(f.id));
  }

  // Exclude freeze-dried for races under 100mi (unless pinned)
  if (raceConfig.distance !== '200mi' && pinnedIds.length === 0) {
    foodPool = foodPool.filter(f => f.category !== 'freeze_dried');
  }

  // 3. Build each phase, threading global volume budget across phases
  const maxVolume = raceConfig.max_volume_ml ?? Infinity;
  let remainingVolumeMl = maxVolume;
  const packPhases: PackPhase[] = [];

  const scoringOptions: ScoringOptions | undefined = options?.preferredCategories?.length
    ? { preferredCategories: options.preferredCategories }
    : undefined;

  // Pre-compute per-phase volume budgets for calorie spreading
  const phaseVolumeBudgets = computePhaseVolumeBudgets(phases, raceConfig);

  let prevPhaseRefill = false;
  let prevWaystationId: string | undefined;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];

    // Reset volume at pack refill points
    if (prevPhaseRefill && raceConfig.waystations) {
      const ws = raceConfig.waystations.find(w => w.id === prevWaystationId);
      remainingVolumeMl = ws?.pack_volume_ml ?? maxVolume;
    }

    // Use per-phase budget if spreading is active, otherwise use remaining global volume
    const volumeForPhase = phaseVolumeBudgets
      ? Math.min(phaseVolumeBudgets[i], remainingVolumeMl)
      : remainingVolumeMl;

    const packPhase = fillPhase(phase, foodPool, availableFoods, volumeForPhase, scoringOptions);
    packPhases.push(packPhase);
    remainingVolumeMl -= packPhase.total_volume_ml;

    prevPhaseRefill = phase.is_pack_refill ?? false;
    prevWaystationId = phase.waystation_id;
  }

  // 4. Caffeine balancing
  balanceCaffeine(packPhases);

  // 5. Calculate totals
  const totalCalories = packPhases.reduce((sum, p) => sum + p.total_calories, 0);
  const totalWeight = packPhases.reduce((sum, p) => sum + p.total_weight_g, 0);
  const totalVolume = packPhases.reduce((sum, p) => sum + p.total_volume_ml, 0);
  const totalItems = packPhases.reduce((sum, p) => sum + p.entries.length, 0);

  return {
    id: generateId(),
    name: planName,
    created_at: new Date().toISOString(),
    race_config: raceConfig,
    phases: packPhases,
    total_calories: totalCalories,
    total_weight_g: totalWeight,
    total_volume_ml: totalVolume,
    total_items: totalItems,
    rejected_food_ids: rejectedIds,
    pinned_food_ids: pinnedIds,
  };
}

/**
 * When pack volume is limited, spread the volume budget proportionally across phases
 * (by duration) instead of filling greedily until empty. Returns undefined if no
 * spreading is needed (infinite volume or budget exceeds needs).
 *
 * Handles pack refill points: each segment between refill points gets its own
 * proportional budget from the available volume at that segment's start.
 */
function computePhaseVolumeBudgets(
  phases: RacePhase[],
  config: RaceConfig,
): number[] | undefined {
  if (!config.max_volume_ml) return undefined;

  const waystations = config.waystations ?? [];
  const budgets: number[] = [];

  // Group phases into segments separated by pack refills
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
  // Final segment (after last refill, or entire race if no refills)
  segments.push({
    startIdx: segmentStart,
    endIdx: phases.length - 1,
    volume: segmentStart === 0
      ? config.max_volume_ml
      : (() => {
          // Look up the last refill waystation for volume
          const lastRefillPhase = phases[segmentStart - 1];
          const ws = waystations.find(w => w.id === lastRefillPhase?.waystation_id);
          return ws?.pack_volume_ml ?? config.max_volume_ml;
        })(),
  });

  // Allocate volume within each segment proportionally by duration
  for (const seg of segments) {
    const segPhases = phases.slice(seg.startIdx, seg.endIdx + 1);
    const totalDuration = segPhases.reduce((s, p) => s + p.duration_hours, 0);

    if (totalDuration <= 0) {
      for (let i = seg.startIdx; i <= seg.endIdx; i++) {
        budgets[i] = 0;
      }
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
): PackPhase {
  const entries: PackEntry[] = [];
  let remainingCal = phase.total_cal_target;
  let localRemainingVolume = remainingVolumeMl;
  const usedFoodIds = new Set<string>();

  // Greedy fill loop
  let iterations = 0;
  const maxIterations = 15; // safety valve

  while (remainingCal > phase.total_cal_target * (1 - FILL_TOLERANCE) && iterations < maxIterations) {
    iterations++;

    // Stop if volume budget is exhausted
    if (localRemainingVolume <= 0) break;

    // Score all available foods for this phase
    const scored = foodPool
      .filter(f => !usedFoodIds.has(f.id))
      .map(f => ({
        food: f,
        score: scoreFood(f, phase, entries, allFoods, scoringOptions),
      }))
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) break;

    // Pick top scored food
    const pick = scored[0];
    let servings = calculatePartialFill(pick.food, remainingCal, phase);

    if (servings <= 0) break;

    // Clamp servings by remaining volume budget
    const volumePerServing = pick.food.volume_ml_per_serving;
    if (localRemainingVolume !== Infinity && volumePerServing > 0) {
      const maxServingsByVolume = Math.floor(localRemainingVolume / volumePerServing);
      servings = Math.min(servings, maxServingsByVolume);
      if (servings <= 0) {
        // This food doesn't fit — skip it and try the next one
        usedFoodIds.add(pick.food.id);
        continue;
      }
    }

    const entryVolume = volumePerServing * servings;

    const entry: PackEntry = {
      food: pick.food,
      servings,
      total_calories: pick.food.calories * servings,
      total_weight_g: pick.food.serving_size_g * servings,
      total_carbs_g: pick.food.carbs_g * servings,
      total_sodium_mg: pick.food.sodium_mg * servings,
      total_volume_ml: entryVolume,
      assigned_phase: phase.type,
    };

    entries.push(entry);
    usedFoodIds.add(pick.food.id);
    remainingCal -= entry.total_calories;
    localRemainingVolume -= entryVolume;

    // Stop if we've overfilled
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

  // Move caffeinated items from early phase to night/final
  if (totalCaffeine > MAX_CAFFEINE_MG) {
    // Find early phase caffeinated entries and reduce servings
    for (const pp of packPhases) {
      if (pp.phase.type === 'early' || pp.phase.type === 'mid') {
        pp.entries = pp.entries.map(entry => {
          if (entry.food.is_caffeinated && entry.servings > 1) {
            const reduced = {
              ...entry,
              servings: 1,
              total_calories: entry.food.calories,
              total_weight_g: entry.food.serving_size_g,
              total_carbs_g: entry.food.carbs_g,
              total_sodium_mg: entry.food.sodium_mg,
              total_volume_ml: entry.food.volume_ml_per_serving,
            };
            return reduced;
          }
          return entry;
        });
        // Recalculate phase totals
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

// Re-run algorithm with a rejection added
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
  );
}
