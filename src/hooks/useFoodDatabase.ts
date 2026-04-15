import { useMemo } from 'react';
import { FoodItem, FoodCategory, GutRating, GUT_RATING_ORDER } from '../types/food';
import { FOODS } from '../data/foods';
import { useStore } from '../store/useStore';

export function useFoodDatabase() {
  const filters = useStore(s => s.filters);

  const filteredFoods = useMemo(() => {
    let result = [...FOODS];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(f => filters.categories.includes(f.category));
    }

    // Gut rating filter
    if (filters.minGutRating) {
      const minScore = GUT_RATING_ORDER[filters.minGutRating];
      result = result.filter(f => GUT_RATING_ORDER[f.gut_friendliness] >= minScore);
    }

    // Caffeine filter
    if (filters.hasCaffeine !== null) {
      result = result.filter(f => f.is_caffeinated === filters.hasCaffeine);
    }

    // Cal/oz filter
    if (filters.minCalPerOz !== null) {
      result = result.filter(f => f.cal_per_oz >= filters.minCalPerOz!);
    }

    return result;
  }, [filters]);

  return {
    foods: filteredFoods,
    allFoods: FOODS,
    totalCount: FOODS.length,
    filteredCount: filteredFoods.length,
  };
}

export function useFoodById(id: string): FoodItem | undefined {
  return FOODS.find(f => f.id === id);
}
