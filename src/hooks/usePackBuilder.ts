import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { buildPack, rejectAndRebuild, PackOptions } from '../services/packAlgorithm';
import { RaceConfig } from '../types/race';
import { PackPlan } from '../types/plan';

export function usePackBuilder() {
  const {
    currentPlan,
    setCurrentPlan,
    pinnedFoodIds,
    rejectedFoodIds,
    rejectFood,
    clearRejections,
    pantryFoodIds,
    useFromPantry,
    categoryPreferences,
    foods,
  } = useStore();

  const getPackOptions = useCallback((): PackOptions | undefined => {
    const { excludedCategories, preferredCategories } = categoryPreferences;
    if (excludedCategories.length === 0 && preferredCategories.length === 0) return undefined;
    return {
      excludedCategories: excludedCategories.length > 0 ? excludedCategories : undefined,
      preferredCategories: preferredCategories.length > 0 ? preferredCategories : undefined,
    };
  }, [categoryPreferences]);

  const generatePack = useCallback((raceConfig: RaceConfig, planName: string = '') => {
    // Merge pantry into pinned when "Build from Pantry" is on
    let effectivePinnedIds = pinnedFoodIds;
    if (useFromPantry && pantryFoodIds.length > 0) {
      const merged = new Set([...pinnedFoodIds, ...pantryFoodIds]);
      effectivePinnedIds = Array.from(merged);
    }

    const plan = buildPack(
      raceConfig,
      foods,
      rejectedFoodIds,
      effectivePinnedIds,
      getPackOptions(),
      planName,
    );
    setCurrentPlan(plan);
    return plan;
  }, [rejectedFoodIds, pinnedFoodIds, pantryFoodIds, useFromPantry, getPackOptions, setCurrentPlan]);

  const rejectItem = useCallback((foodId: string) => {
    rejectFood(foodId);
    if (currentPlan) {
      const rebuilt = rejectAndRebuild(currentPlan, foodId, foods, getPackOptions());
      const newPlan = {
        ...rebuilt,
        id: currentPlan.id,
        name: currentPlan.name,
        created_at: currentPlan.created_at,
        race_date: currentPlan.race_date,
        start_time: currentPlan.start_time,
      };
      setCurrentPlan(newPlan);
    }
  }, [currentPlan, rejectFood, getPackOptions, setCurrentPlan]);

  const resetPlan = useCallback(() => {
    clearRejections();
    setCurrentPlan(null);
  }, [clearRejections, setCurrentPlan]);

  const rebuildFromConfig = useCallback(
    (updatedConfig: RaceConfig, existingPlan: PackPlan): PackPlan => {
      let effectivePinnedIds = pinnedFoodIds;
      if (useFromPantry && pantryFoodIds.length > 0) {
        effectivePinnedIds = Array.from(new Set([...pinnedFoodIds, ...pantryFoodIds]));
      }
      const generated = buildPack(
        updatedConfig,
        foods,
        rejectedFoodIds,
        effectivePinnedIds,
        getPackOptions(),
        existingPlan.name,
      );
      return {
        ...generated,
        id: existingPlan.id,
        name: existingPlan.name,
        created_at: existingPlan.created_at,
        race_date: existingPlan.race_date,
        start_time: existingPlan.start_time,
      };
    },
    [rejectedFoodIds, pinnedFoodIds, pantryFoodIds, useFromPantry, getPackOptions],
  );

  return {
    currentPlan,
    generatePack,
    rejectItem,
    resetPlan,
    rebuildFromConfig,
  };
}
