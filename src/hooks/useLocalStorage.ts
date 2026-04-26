import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';
import { PackPlan, PinnedPhaseEntry } from '../types/plan';
import { CategoryPreferences } from '../types/preferences';
import { migrateWaystationFoods } from '../types/race';

const SAVED_PLANS_KEY = '@eatmypack:saved_plans';
const PANTRY_KEY = '@eatmypack:pantry_food_ids';
const CATEGORY_PREFS_KEY = '@eatmypack:category_prefs';
const PINNED_PHASE_ENTRIES_KEY = '@eatmypack:pinned_phase_entries';

export function useLocalStorage() {
  const { savedPlans, savePlan, pantryFoodIds, categoryPreferences, pinnedPhaseEntries } = useStore();

  // Load all persisted data on mount
  useEffect(() => {
    loadPlans();
    loadPantry();
    loadCategoryPrefs();
    loadPinnedPhaseEntries();
  }, []);

  // Save whenever plans change
  useEffect(() => {
    if (savedPlans.length > 0) {
      persistPlans(savedPlans);
    }
  }, [savedPlans]);

  // Save whenever pantry changes
  useEffect(() => {
    persistPantry(pantryFoodIds);
  }, [pantryFoodIds]);

  // Save whenever category preferences change
  useEffect(() => {
    persistCategoryPrefs(categoryPreferences);
  }, [categoryPreferences]);

  // Save whenever pinned phase entries change
  useEffect(() => {
    persistPinnedPhaseEntries(pinnedPhaseEntries);
  }, [pinnedPhaseEntries]);

  const loadPlans = async () => {
    try {
      const data = await AsyncStorage.getItem(SAVED_PLANS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          console.warn('Corrupted saved plans data, clearing');
          await AsyncStorage.removeItem(SAVED_PLANS_KEY);
          return;
        }
        const plans: PackPlan[] = parsed.filter(
          (p) => p && typeof p === 'object' && typeof p.id === 'string'
        );
        plans.forEach(p => {
          if (!p.name) p.name = '';
          // Migrate old string[] waystation foods to WaystationFoodEntry[]
          if (p.race_config.waystations) {
            p.race_config.waystations = p.race_config.waystations.map((ws) => ({
              ...ws,
              foods: migrateWaystationFoods(ws.foods),
            }));
          }
          savePlan(p);
        });
      }
    } catch (e) {
      console.warn('Failed to load saved plans:', e);
    }
  };

  const persistPlans = async (plans: PackPlan[]) => {
    try {
      await AsyncStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
    } catch (e) {
      console.warn('Failed to save plans:', e);
    }
  };

  const loadPantry = async () => {
    try {
      const data = await AsyncStorage.getItem(PANTRY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          console.warn('Corrupted pantry data, clearing');
          await AsyncStorage.removeItem(PANTRY_KEY);
          return;
        }
        const ids: string[] = parsed.filter((id) => typeof id === 'string');
        ids.forEach(id => {
          if (!useStore.getState().pantryFoodIds.includes(id)) {
            useStore.getState().togglePantryFood(id);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load pantry:', e);
    }
  };

  const persistPantry = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(PANTRY_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn('Failed to save pantry:', e);
    }
  };

  const loadCategoryPrefs = async () => {
    try {
      const data = await AsyncStorage.getItem(CATEGORY_PREFS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !Array.isArray(parsed.excludedCategories) ||
          !Array.isArray(parsed.preferredCategories)
        ) {
          console.warn('Corrupted category preferences data, clearing');
          await AsyncStorage.removeItem(CATEGORY_PREFS_KEY);
          return;
        }
        const prefs: CategoryPreferences = parsed;
        // Set excluded categories
        prefs.excludedCategories.forEach(cat => {
          if (!useStore.getState().categoryPreferences.excludedCategories.includes(cat)) {
            useStore.getState().toggleExcludedCategory(cat);
          }
        });
        // Set preferred categories
        prefs.preferredCategories.forEach(cat => {
          if (!useStore.getState().categoryPreferences.preferredCategories.includes(cat)) {
            useStore.getState().togglePreferredCategory(cat);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load category preferences:', e);
    }
  };

  const persistCategoryPrefs = async (prefs: CategoryPreferences) => {
    try {
      await AsyncStorage.setItem(CATEGORY_PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save category preferences:', e);
    }
  };

  const loadPinnedPhaseEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(PINNED_PHASE_ENTRIES_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) {
          console.warn('Corrupted pinned phase entries data, clearing');
          await AsyncStorage.removeItem(PINNED_PHASE_ENTRIES_KEY);
          return;
        }
        const entries: PinnedPhaseEntry[] = parsed.filter(
          (e) => e && typeof e === 'object' && typeof e.foodId === 'string' && typeof e.phaseType === 'string'
        );
        entries.forEach((entry) => {
          const existing = useStore.getState().pinnedPhaseEntries;
          const alreadyExists = existing.some(
            (p) => p.foodId === entry.foodId && p.phaseType === entry.phaseType,
          );
          if (!alreadyExists) {
            useStore.getState().togglePinnedPhaseEntry(entry);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load pinned phase entries:', e);
    }
  };

  const persistPinnedPhaseEntries = async (entries: PinnedPhaseEntry[]) => {
    try {
      await AsyncStorage.setItem(PINNED_PHASE_ENTRIES_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save pinned phase entries:', e);
    }
  };

  const clearAll = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([SAVED_PLANS_KEY, PANTRY_KEY, CATEGORY_PREFS_KEY, PINNED_PHASE_ENTRIES_KEY]);
    } catch (e) {
      console.warn('Failed to clear data:', e);
    }
  }, []);

  return { clearAll };
}
