import { FoodCategory } from './food';
import { RaceDistance } from './race';

export interface CategoryPreferences {
  /** Categories the user never wants — hard-filtered from the food pool */
  excludedCategories: FoodCategory[];
  /** Categories the user prefers — scoring boost, not exclusive */
  preferredCategories: FoodCategory[];
}

export const DEFAULT_CATEGORY_PREFERENCES: CategoryPreferences = {
  excludedCategories: [],
  preferredCategories: [],
};

export type TempUnit = 'F' | 'C';
export type WeightUnit = 'oz' | 'g';
export type CaffeineSensitivity = 'low' | 'medium' | 'high';

export interface UserPreferences {
  defaultDistance: RaceDistance | null;
  tempUnit: TempUnit;
  weightUnit: WeightUnit;
  caffeineSensitivity: CaffeineSensitivity;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultDistance: null,
  tempUnit: 'F',
  weightUnit: 'oz',
  caffeineSensitivity: 'medium',
};
