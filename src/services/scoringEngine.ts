import { FoodItem, GutRating, GUT_RATING_ORDER, FoodCategory, BestFor } from '../types/food';
import { RacePhase, PhaseType } from '../types/race';
import { PackEntry } from '../types/plan';

const PHASE_TO_BESTFOR: Record<PhaseType, BestFor[]> = {
  early: ['early_miles', 'high_intensity'],
  mid: ['mid_race'],
  late: ['late_race', 'aid_station', 'walking'],
  night: ['night', 'aid_station'],
  final_push: ['final_push', 'high_intensity'],
};

export interface ScoringOptions {
  preferredCategories?: FoodCategory[];
}

interface ScoringWeights {
  density: number;
  gut: number;
  phaseFit: number;
  variety: number;
  macro: number;
  preference: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  density: 0.15,
  gut: 0.30,
  phaseFit: 0.20,
  variety: 0.10,
  macro: 0.15,
  preference: 0.10,
};

// Boost gut importance for early and final phases
const PHASE_WEIGHT_OVERRIDES: Partial<Record<PhaseType, Partial<ScoringWeights>>> = {
  early: { gut: 0.35, density: 0.10 },
  final_push: { gut: 0.35, density: 0.10 },
  late: { macro: 0.20, phaseFit: 0.25, gut: 0.20, variety: 0.05 },
  night: { phaseFit: 0.25, gut: 0.20, macro: 0.20, variety: 0.05 },
};

export function scoreFood(
  food: FoodItem,
  phase: RacePhase,
  existingEntries: PackEntry[],
  allFoods: FoodItem[],
  options?: ScoringOptions,
): number {
  const weights = { ...DEFAULT_WEIGHTS, ...(PHASE_WEIGHT_OVERRIDES[phase.type] || {}) };

  // Normalize weights to sum to 1
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach(k => {
    (weights as any)[k] /= totalWeight;
  });

  const dScore = densityScore(food, allFoods);
  const gScore = gutScore(food, phase);
  const pScore = phaseFitScore(food, phase);
  const vScore = varietyScore(food, existingEntries);
  const mScore = macroScore(food, phase);
  const prefScore = preferenceScore(food, options?.preferredCategories);

  return (
    weights.density * dScore +
    weights.gut * gScore +
    weights.phaseFit * pScore +
    weights.variety * vScore +
    weights.macro * mScore +
    weights.preference * prefScore
  );
}

function densityScore(food: FoodItem, allFoods: FoodItem[]): number {
  const densities = allFoods.map(f => f.cal_per_oz);
  const min = Math.min(...densities);
  const max = Math.max(...densities);
  if (max === min) return 50;
  return ((food.cal_per_oz - min) / (max - min)) * 100;
}

function gutScore(food: FoodItem, phase: RacePhase): number {
  const score = GUT_RATING_ORDER[food.gut_friendliness];
  const minRequired = GUT_RATING_ORDER[phase.min_gut_rating];

  // Penalty for being below minimum
  if (score < minRequired) {
    return Math.max(0, (score / 5) * 40); // harsh penalty
  }

  return (score / 5) * 100;
}

function phaseFitScore(food: FoodItem, phase: RacePhase): number {
  const relevantBestFor = PHASE_TO_BESTFOR[phase.type] || [];

  // Check if food's best_for matches this phase
  const directMatch = food.best_for.some(bf => relevantBestFor.includes(bf));
  if (directMatch) return 100;

  // Check if food's category is preferred for this phase
  const categoryMatch = phase.preferred_categories.includes(food.category);
  if (categoryMatch) return 65;

  // Check adjacent phase match
  const adjacentPhases = getAdjacentPhases(phase.type);
  const adjacentBestFor = adjacentPhases.flatMap(p => PHASE_TO_BESTFOR[p] || []);
  const adjacentMatch = food.best_for.some(bf => adjacentBestFor.includes(bf));
  if (adjacentMatch) return 40;

  return 15;
}

function getAdjacentPhases(phase: PhaseType): PhaseType[] {
  const order: PhaseType[] = ['early', 'mid', 'late', 'night', 'final_push'];
  const idx = order.indexOf(phase);
  const adjacent: PhaseType[] = [];
  if (idx > 0) adjacent.push(order[idx - 1]);
  if (idx < order.length - 1) adjacent.push(order[idx + 1]);
  return adjacent;
}

function varietyScore(food: FoodItem, existingEntries: PackEntry[]): number {
  let score = 100;

  // Penalize same category in this phase
  const sameCategoryCount = existingEntries.filter(e => e.food.category === food.category).length;
  score -= sameCategoryCount * 25;

  // Penalize same brand
  const sameBrandCount = existingEntries.filter(e => e.food.brand === food.brand).length;
  score -= sameBrandCount * 15;

  // Penalize exact same food
  const sameFood = existingEntries.some(e => e.food.id === food.id);
  if (sameFood) score -= 40;

  return Math.max(0, score);
}

function preferenceScore(food: FoodItem, preferredCategories?: FoodCategory[]): number {
  if (!preferredCategories || preferredCategories.length === 0) return 50; // neutral
  return preferredCategories.includes(food.category) ? 100 : 25;
}

function macroScore(food: FoodItem, phase: RacePhase): number {
  const totalMacros = food.carbs_g + food.protein_g + food.fat_g;
  if (totalMacros === 0) return 50;

  const carbRatio = food.carbs_g / totalMacros;
  const fatRatio = food.fat_g / totalMacros;

  // Early/final phases want high carb ratio
  if (phase.type === 'early' || phase.type === 'final_push') {
    return carbRatio * 100;
  }

  // Late/night phases want mixed macros
  if (phase.type === 'late' || phase.type === 'night') {
    // Bonus for fat > 20% and some protein
    const mixedScore = (fatRatio > 0.2 ? 40 : fatRatio * 100) +
                       (carbRatio > 0.3 ? 30 : 0) +
                       (food.protein_g > 3 ? 30 : food.protein_g * 10);
    return Math.min(100, mixedScore);
  }

  // Mid race: slight carb preference but balanced is fine
  return carbRatio * 70 + (1 - carbRatio) * 30;
}
