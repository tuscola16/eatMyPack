import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { FOODS as LOCAL_FOODS } from '../data/foods';
import type { FoodItem } from '../types/food';

const CACHE_KEY = '@eatmypack:foods_cache';
const CACHE_TIMESTAMP_KEY = '@eatmypack:foods_cache_ts';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function fetchFoods(): Promise<FoodItem[]> {
  // 1. Check AsyncStorage cache — return if still fresh
  try {
    const [cached, ts] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TIMESTAMP_KEY),
    ]);
    if (cached && ts) {
      const age = Date.now() - parseInt(ts, 10);
      if (age < CACHE_TTL_MS) {
        return JSON.parse(cached) as FoodItem[];
      }
    }
  } catch {
    // Cache read failure — fall through to network
  }

  // 2. Fetch from Firestore
  try {
    const snap = await getDocs(collection(db, 'foods'));
    if (!snap.empty) {
      const foods = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
      await AsyncStorage.multiSet([
        [CACHE_KEY, JSON.stringify(foods)],
        [CACHE_TIMESTAMP_KEY, String(Date.now())],
      ]);
      return foods;
    }
  } catch {
    // Network failure — fall through to local fallback
  }

  // 3. Fallback: local static food list
  return LOCAL_FOODS;
}
