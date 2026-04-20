import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { fetchFoods } from '../services/foodsService';

export function useFoods() {
  const setFoods = useStore((s) => s.setFoods);
  useEffect(() => {
    fetchFoods().then(setFoods).catch(console.warn);
  }, []);
}
