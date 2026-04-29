import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import {
  uploadPlan,
  deletePlanRemote,
  fetchPlans,
  uploadPreferences,
  fetchPreferences,
  uploadPantry,
} from '@/services/cloudSync';
import { PackPlan } from '@/types/plan';
import { Sentry } from '@/services/sentry';

type SyncStatus = 'idle' | 'syncing' | 'error';

export function useCloudSync() {
  const user = useStore((s) => s.user);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-sync savedPlans changes to Firestore when authenticated
  useEffect(() => {
    if (!user) return;

    const unsub = useStore.subscribe(
      (state) => state.savedPlans,
      (plans, prevPlans) => {
        // Debounce to avoid rapid consecutive writes
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          syncPlansToCloud(user.uid, plans, prevPlans);
        }, 1500);
      }
    );

    return () => {
      unsub();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [user]);

  // Auto-sync pinnedFoodIds changes
  useEffect(() => {
    if (!user) return;

    const unsub = useStore.subscribe(
      (state) => state.pinnedFoodIds,
      (pinnedFoodIds) => {
        uploadPreferences(user.uid, pinnedFoodIds).catch((e) =>
          Sentry.captureException(e, { level: 'warning' })
        );
      }
    );

    return unsub;
  }, [user]);

  // Auto-sync pantryFoodIds changes
  useEffect(() => {
    if (!user) return;

    const unsub = useStore.subscribe(
      (state) => state.pantryFoodIds,
      (pantryFoodIds) => {
        uploadPantry(user.uid, pantryFoodIds).catch((e) =>
          Sentry.captureException(e, { level: 'warning' })
        );
      }
    );

    return unsub;
  }, [user]);

  const syncPlansToCloud = async (
    uid: string,
    plans: PackPlan[],
    prevPlans: PackPlan[]
  ) => {
    try {
      // Find deleted plans
      const currentIds = new Set(plans.map((p) => p.id));
      const deleted = prevPlans.filter((p) => !currentIds.has(p.id));

      // Upload all current plans (setDoc is idempotent)
      await Promise.all(plans.map((p) => uploadPlan(uid, p)));

      // Delete removed plans
      await Promise.all(deleted.map((p) => deletePlanRemote(uid, p.id)));
    } catch (e) {
      Sentry.captureException(e, { level: 'warning' });
    }
  };

  const syncFromCloud = useCallback(async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      const [remotePlans, prefs] = await Promise.all([
        fetchPlans(user.uid),
        fetchPreferences(user.uid),
      ]);

      const { savePlan, pinnedFoodIds, pantryFoodIds, togglePantryFood } = useStore.getState();

      // Merge remote plans into local (remote wins for same ID)
      remotePlans.forEach((plan) => savePlan(plan));

      // Merge preferences if remote has data
      if (prefs?.pinnedFoodIds.length) {
        const merged = [...new Set([...pinnedFoodIds, ...prefs.pinnedFoodIds])];
        useStore.setState({ pinnedFoodIds: merged });
      }

      // Merge pantry if remote has data
      if (prefs?.pantryFoodIds.length) {
        const remotePantry = prefs.pantryFoodIds;
        remotePantry.forEach((id) => {
          if (!pantryFoodIds.includes(id)) togglePantryFood(id);
        });
      }

      setSyncStatus('idle');
    } catch (e) {
      Sentry.captureException(e, { level: 'warning' });
      setSyncStatus('error');
    }
  }, [user]);

  const fullSync = useCallback(async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      // Pull remote
      const [remotePlans, prefs] = await Promise.all([
        fetchPlans(user.uid),
        fetchPreferences(user.uid),
      ]);

      const { savedPlans, savePlan, pinnedFoodIds, pantryFoodIds, togglePantryFood } = useStore.getState();

      // Merge: build map by ID, local plans win for same ID (user just saved them)
      const planMap = new Map<string, PackPlan>();
      remotePlans.forEach((p) => planMap.set(p.id, p));
      savedPlans.forEach((p) => planMap.set(p.id, p)); // local overwrites remote

      // Update store with merged plans
      const merged = Array.from(planMap.values());
      merged.forEach((p) => savePlan(p));

      // Push merged set to cloud
      await Promise.all(merged.map((p) => uploadPlan(user.uid, p)));

      // Merge preferences
      const remotePinned = prefs?.pinnedFoodIds ?? [];
      const mergedPinned = [...new Set([...pinnedFoodIds, ...remotePinned])];
      useStore.setState({ pinnedFoodIds: mergedPinned });
      await uploadPreferences(user.uid, mergedPinned);

      // Merge pantry
      const remotePantry = prefs?.pantryFoodIds ?? [];
      remotePantry.forEach((id) => {
        if (!pantryFoodIds.includes(id)) togglePantryFood(id);
      });
      const mergedPantry = useStore.getState().pantryFoodIds;
      await uploadPantry(user.uid, mergedPantry);

      setSyncStatus('idle');
    } catch (e) {
      Sentry.captureException(e, { level: 'warning' });
      setSyncStatus('error');
    }
  }, [user]);

  return { syncFromCloud, fullSync, syncStatus };
}
