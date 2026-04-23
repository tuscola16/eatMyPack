import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import {
  buildPack,
  rejectAndRebuild,
  rebuildPhase,
  adjustServingsInPhase,
  PackOptions,
} from '../services/packAlgorithm';
import { RaceConfig } from '../types/race';
import { PackPlan, PinnedPhaseEntry } from '../types/plan';

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
    pinnedPhaseEntries,
    togglePinnedPhaseEntry,
  } = useStore();

  const getPackOptions = useCallback((): PackOptions | undefined => {
    const { excludedCategories, preferredCategories } = categoryPreferences;
    if (excludedCategories.length === 0 && preferredCategories.length === 0) return undefined;
    return {
      excludedCategories: excludedCategories.length > 0 ? excludedCategories : undefined,
      preferredCategories: preferredCategories.length > 0 ? preferredCategories : undefined,
    };
  }, [categoryPreferences]);

  const getEffectivePinnedIds = useCallback(() => {
    if (useFromPantry && pantryFoodIds.length > 0) {
      return Array.from(new Set([...pinnedFoodIds, ...pantryFoodIds]));
    }
    return pinnedFoodIds;
  }, [pinnedFoodIds, pantryFoodIds, useFromPantry]);

  const generatePack = useCallback((raceConfig: RaceConfig, planName: string = '') => {
    const plan = buildPack(
      raceConfig,
      foods,
      rejectedFoodIds,
      getEffectivePinnedIds(),
      getPackOptions(),
      planName,
      pinnedPhaseEntries,
    );
    setCurrentPlan(plan);
    return plan;
  }, [rejectedFoodIds, pinnedPhaseEntries, getEffectivePinnedIds, getPackOptions, setCurrentPlan, foods]);

  /** Global reject — rebuilds entire plan, food excluded from all phases */
  const rejectItem = useCallback((foodId: string) => {
    rejectFood(foodId);
    if (currentPlan) {
      const rebuilt = rejectAndRebuild(currentPlan, foodId, foods, getPackOptions());
      setCurrentPlan({
        ...rebuilt,
        id: currentPlan.id,
        name: currentPlan.name,
        created_at: currentPlan.created_at,
        race_date: currentPlan.race_date,
        start_time: currentPlan.start_time,
      });
    }
  }, [currentPlan, rejectFood, getPackOptions, setCurrentPlan, foods]);

  /** Phase-scoped remove — rebuilds only the affected phase; food stays available in others */
  const rejectFromPhase = useCallback((phaseIndex: number, foodId: string) => {
    if (!currentPlan) return;
    const rebuilt = rebuildPhase(
      currentPlan,
      phaseIndex,
      foods,
      foodId,
      pinnedPhaseEntries,
      getPackOptions(),
    );
    setCurrentPlan({
      ...rebuilt,
      id: currentPlan.id,
      name: currentPlan.name,
      created_at: currentPlan.created_at,
      race_date: currentPlan.race_date,
      start_time: currentPlan.start_time,
    });
  }, [currentPlan, foods, pinnedPhaseEntries, getPackOptions, setCurrentPlan]);

  /** Adjust servings for a food in a phase, then rebuild the rest of that phase */
  const adjustServings = useCallback((phaseIndex: number, foodId: string, delta: number) => {
    if (!currentPlan) return;
    const phase = currentPlan.phases[phaseIndex];
    if (!phase) return;

    const existingEntry = phase.entries.find(e => e.food.id === foodId);
    const currentServings = existingEntry?.servings ?? 1;
    const newServings = Math.max(1, currentServings + delta);

    const rebuilt = adjustServingsInPhase(
      currentPlan,
      phaseIndex,
      foodId,
      newServings,
      foods,
      pinnedPhaseEntries,
      getPackOptions(),
    );
    setCurrentPlan({
      ...rebuilt,
      id: currentPlan.id,
      name: currentPlan.name,
      created_at: currentPlan.created_at,
      race_date: currentPlan.race_date,
      start_time: currentPlan.start_time,
    });
  }, [currentPlan, foods, pinnedPhaseEntries, getPackOptions, setCurrentPlan]);

  /** Toggle the phase-level lock for a food entry */
  const togglePhaseLock = useCallback((foodId: string, phaseType: string, servings: number) => {
    togglePinnedPhaseEntry({
      foodId,
      phaseType: phaseType as PinnedPhaseEntry['phaseType'],
      servings,
    });
  }, [togglePinnedPhaseEntry]);

  const resetPlan = useCallback(() => {
    clearRejections();
    setCurrentPlan(null);
  }, [clearRejections, setCurrentPlan]);

  const rebuildFromConfig = useCallback(
    (updatedConfig: RaceConfig, existingPlan: PackPlan): PackPlan => {
      const generated = buildPack(
        updatedConfig,
        foods,
        rejectedFoodIds,
        getEffectivePinnedIds(),
        getPackOptions(),
        existingPlan.name,
        pinnedPhaseEntries,
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
    [rejectedFoodIds, pinnedPhaseEntries, getEffectivePinnedIds, getPackOptions, foods],
  );

  return {
    currentPlan,
    generatePack,
    rejectItem,
    rejectFromPhase,
    adjustServings,
    togglePhaseLock,
    resetPlan,
    rebuildFromConfig,
  };
}
