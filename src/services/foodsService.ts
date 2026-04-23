import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { FOODS as LOCAL_FOODS } from '../data/foods';
import type { FoodItem } from '../types/food';

export async function fetchFoods(): Promise<FoodItem[]> {
  try {
    const snap = await getDocs(collection(db, 'foods'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
    }
  } catch {
    // Network failure — fall through to local fallback
  }

  return LOCAL_FOODS;
}
