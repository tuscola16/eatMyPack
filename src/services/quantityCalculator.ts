import { FoodItem, FoodCategory } from '../types/food';
import { RacePhase } from '../types/race';

// Maximum servings per item per phase (variety enforcement)
const MAX_SERVINGS_PER_ITEM: Record<FoodCategory, number> = {
  gel: 4,
  chew: 3,
  bar: 2,
  drink_mix: 3,
  real_food: 2,
  nut_butter: 2,
  freeze_dried: 1,
};

export function calculateServings(
  food: FoodItem,
  remainingCalories: number,
  phase: RacePhase,
): number {
  if (food.calories <= 0) return 0;

  // How many servings to fill remaining calories
  const idealServings = remainingCalories / food.calories;

  // Cap by max per item per phase
  const maxForCategory = MAX_SERVINGS_PER_ITEM[food.category] || 2;

  // For shorter phases, reduce max
  const phaseDurationFactor = Math.max(0.5, Math.min(1, phase.duration_hours / 4));
  const adjustedMax = Math.max(1, Math.round(maxForCategory * phaseDurationFactor));

  // Take the minimum of ideal and max, rounded up (at least 1)
  const servings = Math.min(
    Math.ceil(idealServings),
    adjustedMax,
  );

  return Math.max(1, servings);
}

export function calculatePartialFill(
  food: FoodItem,
  remainingCalories: number,
  phase: RacePhase,
): number {
  // Fill partially — don't overshoot too much
  const fullServings = calculateServings(food, remainingCalories, phase);
  const totalCals = fullServings * food.calories;

  // If this would overshoot by more than 30%, reduce by 1
  if (totalCals > remainingCalories * 1.3 && fullServings > 1) {
    return fullServings - 1;
  }

  return fullServings;
}
