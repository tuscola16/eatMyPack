import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { PackPlan } from '@/types/plan';
import { migrateWaystationFoods } from '@/types/race';

export async function uploadPlan(uid: string, plan: PackPlan): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'savedPlans', plan.id), {
    ...plan,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlanRemote(uid: string, planId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'savedPlans', planId));
}

export async function fetchPlans(uid: string): Promise<PackPlan[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'savedPlans'));
  return snap.docs.map((d) => {
    const data = d.data();
    const { updatedAt, ...planData } = data;
    const plan = planData as PackPlan;
    if (plan.race_config.waystations) {
      plan.race_config.waystations = plan.race_config.waystations.map((ws) => ({
        ...ws,
        foods: migrateWaystationFoods(ws.foods),
      }));
    }
    return plan;
  });
}

export async function uploadPreferences(
  uid: string,
  pinnedFoodIds: string[]
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'preferences'),
    { pinnedFoodIds, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function fetchPreferences(
  uid: string
): Promise<{ pinnedFoodIds: string[]; pantryFoodIds: string[] } | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'preferences'));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    pinnedFoodIds: data.pinnedFoodIds ?? [],
    pantryFoodIds: data.pantryFoodIds ?? [],
  };
}

export async function uploadPantry(
  uid: string,
  pantryFoodIds: string[]
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'preferences'),
    { pantryFoodIds, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function fetchPantry(uid: string): Promise<string[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'preferences'));
  if (!snap.exists()) return [];
  return snap.data().pantryFoodIds ?? [];
}
