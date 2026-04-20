import { useMemo } from 'react';
import { FoodItem, FoodCategory, GutRating, GUT_RATING_ORDER } from '../types/food';
import { useStore } from '../store/useStore';

export function useFoodDatabase() {
  const filters = useStore(s => s.filters);
  const allFoods = useStore(s => s.foods);

  const filteredFoods = useMemo(() => {
    let result = [...allFoods];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q)
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter(f => filters.categories.includes(f.category));
    }

    if (filters.minGutRating) {
      const minScore = GUT_RATING_ORDER[filters.minGutRating];
      result = result.filter(f => GUT_RATING_ORDER[f.gut_friendliness] >= minScore);
    }

    if (filters.hasCaffeine !== null) {
      result = result.filter(f => f.is_caffeinated === filters.hasCaffeine);
    }

    if (filters.minCalPerOz !== null) {
      result = result.filter(f => f.cal_per_oz >= filters.minCalPerOz!);
    }

    return result;
  }, [allFoods, filters]);

  return {
    foods: filteredFoods,
    allFoods,
    totalCount: allFoods.length,
    filteredCount: filteredFoods.length,
  };
}

export function useFoodById(id: string): FoodItem | undefined {
  return useStore.getState().foods.find(f => f.id === id);
}
