import { useCallback } from 'react';
import { FOODS } from '../data/foods';
import { useStore } from '../store/useStore';
import { buildPack, rejectAndRebuild, PackOptions } from '../services/packAlgorithm';
import { RaceConfig } from '../types/race';

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
  } = useStore();

  const getPackOptions = useCallback((): PackOptions | undefined => {
    const { excludedCategories, preferredCategories } = categoryPreferences;
    if (excludedCategories.length === 0 && preferredCategories.length === 0) return undefined;
    return {
      excludedCategories: excludedCategories.length > 0 ? excludedCategories : undefined,
      preferredCategories: preferredCategories.length > 0 ? preferredCategories : undefined,
    };
  }, [categoryPreferences]);

  const generatePack = useCallback((raceConfig: RaceConfig) => {
    // Merge pantry into pinned when "Build from Pantry" is on
    let effectivePinnedIds = pinnedFoodIds;
    if (useFromPantry && pantryFoodIds.length > 0) {
      const merged = new Set([...pinnedFoodIds, ...pantryFoodIds]);
      effectivePinnedIds = Array.from(merged);
    }

    const plan = buildPack(
      raceConfig,
      FOODS,
      rejectedFoodIds,
      effectivePinnedIds,
      getPackOptions(),
    );
    setCurrentPlan(plan);
    return plan;
  }, [rejectedFoodIds, pinnedFoodIds, pantryFoodIds, useFromPantry, getPackOptions, setCurrentPlan]);

  const rejectItem = useCallback((foodId: string) => {
    rejectFood(foodId);
    if (currentPlan) {
      const newPlan = rejectAndRebuild(currentPlan, foodId, FOODS, getPackOptions());
      setCurrentPlan(newPlan);
    }
  }, [currentPlan, rejectFood, getPackOptions, setCurrentPlan]);

  const resetPlan = useCallback(() => {
    clearRejections();
    setCurrentPlan(null);
  }, [clearRejections, setCurrentPlan]);

  return {
    currentPlan,
    generatePack,
    rejectItem,
    resetPlan,
  };
}
