export type FoodCategory = 'gel' | 'bar' | 'chew' | 'drink_mix' | 'real_food' | 'nut_butter' | 'freeze_dried';

export type GutRating = 'excellent' | 'very_good' | 'good' | 'moderate' | 'poor';

export type BestFor =
  | 'early_miles'
  | 'mid_race'
  | 'late_race'
  | 'night'
  | 'final_push'
  | 'aid_station'
  | 'high_intensity'
  | 'walking'
  | 'drop_bag'
  | 'hot_conditions';

export interface FoodItem {
  id: string;
  name: string;
  brand: string;
  category: FoodCategory;
  serving_size_g: number;
  serving_size_oz: number;
  volume_ml_per_serving: number;
  calories: number;
  cal_per_g: number;
  cal_per_oz: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  sodium_mg: number;
  caffeine_mg: number;
  gut_friendliness: GutRating;
  best_for: BestFor[];
  label_accuracy_note: string | null;
  is_caffeinated: boolean;
}

export const GUT_RATING_ORDER: Record<GutRating, number> = {
  excellent: 5,
  very_good: 4,
  good: 3,
  moderate: 2,
  poor: 1,
};

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  gel: 'Gels',
  bar: 'Bars',
  chew: 'Chews',
  drink_mix: 'Drink Mix',
  real_food: 'Real Food',
  nut_butter: 'Nut Butter',
  freeze_dried: 'Freeze-Dried',
};

export const CATEGORY_ICONS: Record<FoodCategory, string> = {
  gel: '💧',
  bar: '🍫',
  chew: '🍬',
  drink_mix: '🥤',
  real_food: '🍕',
  nut_butter: '🥜',
  freeze_dried: '🏔️',
};
