import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { useStore } from '@/store/useStore';
import FoodFilterBar from '@/components/food/FoodFilterBar';
import FoodList from '@/components/food/FoodList';
import type { FoodItem } from '@/types';

export default function FoodPickerScreen() {
  const router = useRouter();
  const allFoods = useStore((s) => s.foods);
  const filters = useStore((s) => s.filters);
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const pendingWaystationFoods = useStore((s) => s.pendingWaystationFoods);
  const togglePendingWaystationFood = useStore((s) => s.togglePendingWaystationFood);
  const setPendingWaystationFoods = useStore((s) => s.setPendingWaystationFoods);
  const [pantryOnly, setPantryOnly] = useState(false);

  const selectedIds = pendingWaystationFoods?.foods.map((e) => e.foodId) ?? [];

  const sortedFoods = useMemo(() => {
    let base = [...allFoods];

    // Apply text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      base = base.filter(
        (f) => f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q),
      );
    }

    const pantry = base.filter((f) => pantryFoodIds.includes(f.id));
    const rest = base.filter((f) => !pantryFoodIds.includes(f.id));
    return pantryOnly ? pantry : [...pantry, ...rest];
  }, [allFoods, filters.search, pantryFoodIds, pantryOnly]);

  const handleFoodPress = (food: FoodItem) => {
    togglePendingWaystationFood(food.id);
  };

  const handleToggleSelected = (foodId: string) => {
    togglePendingWaystationFood(foodId);
  };

  const handleDone = () => {
    if (!pendingWaystationFoods) {
      router.back();
      return;
    }
    setPendingWaystationFoods({ ...pendingWaystationFoods, committed: true });
    router.back();
  };

  const handleCancel = () => {
    setPendingWaystationFoods(null);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerAction}>
          <Text style={styles.headerActionText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {`Select Foods (${selectedIds.length})`}
        </Text>
        <View style={styles.headerRight}>
          <Pressable onPress={handleDone} style={styles.headerAction}>
            <Text style={[styles.headerActionText, styles.headerActionPrimary]}>Done</Text>
          </Pressable>
        </View>
      </View>
      <FoodFilterBar
        showPantryToggle
        pantryOnly={pantryOnly}
        onTogglePantry={() => setPantryOnly((v) => !v)}
      />
      <FoodList
        foods={sortedFoods}
        onPressFood={handleFoodPress}
        selectedIds={selectedIds}
        onToggleSelected={handleToggleSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerActionText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  headerActionPrimary: {
    color: colors.primaryDark,
  },
});
