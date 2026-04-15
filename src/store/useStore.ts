import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FoodItem, FoodCategory, GutRating } from '../types/food';
import { RaceConfig, RaceDistance, Conditions } from '../types/race';
import { PackPlan } from '../types/plan';
import { AuthUser } from '../types/auth';
import {
  CategoryPreferences,
  DEFAULT_CATEGORY_PREFERENCES,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
} from '../types/preferences';

interface FoodFilters {
  search: string;
  categories: FoodCategory[];
  minGutRating: GutRating | null;
  hasCaffeine: boolean | null;
  minCalPerOz: number | null;
}

interface AppState {
  // Auth
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;

  // Food filters
  filters: FoodFilters;
  setFilters: (filters: Partial<FoodFilters>) => void;
  resetFilters: () => void;

  // Race config
  raceConfig: RaceConfig | null;
  setRaceConfig: (config: RaceConfig | null) => void;

  // Current pack plan
  currentPlan: PackPlan | null;
  setCurrentPlan: (plan: PackPlan | null) => void;

  // Saved plans
  savedPlans: PackPlan[];
  savePlan: (plan: PackPlan) => void;
  deletePlan: (id: string) => void;

  // Pinned foods (user says "I have these")
  pinnedFoodIds: string[];
  togglePinnedFood: (id: string) => void;
  clearPinnedFoods: () => void;

  // Rejected foods for current plan
  rejectedFoodIds: string[];
  rejectFood: (id: string) => void;
  clearRejections: () => void;

  // Pantry (long-lived "I own these foods")
  pantryFoodIds: string[];
  togglePantryFood: (id: string) => void;
  clearPantry: () => void;

  // Category preferences
  categoryPreferences: CategoryPreferences;
  toggleExcludedCategory: (cat: FoodCategory) => void;
  togglePreferredCategory: (cat: FoodCategory) => void;
  resetCategoryPreferences: () => void;

  // User preferences (units, defaults)
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: Partial<UserPreferences>) => void;

  // Build-from-pantry toggle (per-session, not persisted)
  useFromPantry: boolean;
  setUseFromPantry: (val: boolean) => void;
}

const DEFAULT_FILTERS: FoodFilters = {
  search: '',
  categories: [],
  minGutRating: null,
  hasCaffeine: null,
  minCalPerOz: null,
};

export const useStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    // Auth
    user: null,
    setUser: (user) => set({ user }),

    // Food filters
    filters: { ...DEFAULT_FILTERS },
    setFilters: (newFilters) => set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
    resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

    // Race config
    raceConfig: null,
    setRaceConfig: (config) => set({ raceConfig: config }),

    // Current pack plan
    currentPlan: null,
    setCurrentPlan: (plan) => set({ currentPlan: plan }),

    // Saved plans
    savedPlans: [],
    savePlan: (plan) => set((state) => ({
      savedPlans: [plan, ...state.savedPlans.filter(p => p.id !== plan.id)],
    })),
    deletePlan: (id) => set((state) => ({
      savedPlans: state.savedPlans.filter(p => p.id !== id),
    })),

    // Pinned foods
    pinnedFoodIds: [],
    togglePinnedFood: (id) => set((state) => ({
      pinnedFoodIds: state.pinnedFoodIds.includes(id)
        ? state.pinnedFoodIds.filter(fid => fid !== id)
        : [...state.pinnedFoodIds, id],
    })),
    clearPinnedFoods: () => set({ pinnedFoodIds: [] }),

    // Rejected foods
    rejectedFoodIds: [],
    rejectFood: (id) => set((state) => ({
      rejectedFoodIds: [...state.rejectedFoodIds, id],
    })),
    clearRejections: () => set({ rejectedFoodIds: [] }),

    // Pantry
    pantryFoodIds: [],
    togglePantryFood: (id) => set((state) => ({
      pantryFoodIds: state.pantryFoodIds.includes(id)
        ? state.pantryFoodIds.filter(fid => fid !== id)
        : [...state.pantryFoodIds, id],
    })),
    clearPantry: () => set({ pantryFoodIds: [] }),

    // Category preferences
    categoryPreferences: { ...DEFAULT_CATEGORY_PREFERENCES },
    toggleExcludedCategory: (cat) => set((state) => {
      const { excludedCategories, preferredCategories } = state.categoryPreferences;
      const isExcluded = excludedCategories.includes(cat);
      return {
        categoryPreferences: {
          excludedCategories: isExcluded
            ? excludedCategories.filter(c => c !== cat)
            : [...excludedCategories, cat],
          // Auto-remove from preferred if excluding
          preferredCategories: isExcluded
            ? preferredCategories
            : preferredCategories.filter(c => c !== cat),
        },
      };
    }),
    togglePreferredCategory: (cat) => set((state) => {
      const { excludedCategories, preferredCategories } = state.categoryPreferences;
      const isPreferred = preferredCategories.includes(cat);
      return {
        categoryPreferences: {
          preferredCategories: isPreferred
            ? preferredCategories.filter(c => c !== cat)
            : [...preferredCategories, cat],
          // Auto-remove from excluded if preferring
          excludedCategories: isPreferred
            ? excludedCategories
            : excludedCategories.filter(c => c !== cat),
        },
      };
    }),
    resetCategoryPreferences: () => set({ categoryPreferences: { ...DEFAULT_CATEGORY_PREFERENCES } }),

    // User preferences
    userPreferences: { ...DEFAULT_USER_PREFERENCES },
    setUserPreferences: (prefs) => set((state) => ({
      userPreferences: { ...state.userPreferences, ...prefs },
    })),

    // Build-from-pantry toggle
    useFromPantry: false,
    setUseFromPantry: (val) => set({ useFromPantry: val }),
  }))
);
