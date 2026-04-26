import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { useFoodDatabase } from '@/hooks/useFoodDatabase';
import { useStore } from '@/store/useStore';
import FoodFilterBar from '@/components/food/FoodFilterBar';
import FoodList from '@/components/food/FoodList';
import { PantryIcon } from '@/components/illustrations';
import type { FoodItem } from '@/types';

export default function DatabaseScreen() {
  const router = useRouter();
  const { foods, filteredCount, totalCount } = useFoodDatabase();
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const togglePantryFood = useStore((s) => s.togglePantryFood);
  const pendingWaystationFoods = useStore((s) => s.pendingWaystationFoods);
  const togglePendingWaystationFood = useStore((s) => s.togglePendingWaystationFood);
  const setPendingWaystationFoods = useStore((s) => s.setPendingWaystationFoods);
  const [pantryOnly, setPantryOnly] = useState(false);

  const inSelectionMode = !!pendingWaystationFoods && !pendingWaystationFoods.committed;
  const selectedIds = inSelectionMode ? pendingWaystationFoods!.foods.map((e) => e.foodId) : [];

  const displayedFoods = pantryOnly
    ? foods.filter((f) => pantryFoodIds.includes(f.id))
    : foods;

  const handleFoodPress = (food: FoodItem) => {
    router.push({ pathname: '/database/[id]', params: { id: food.id } });
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
        {inSelectionMode && (
          <Pressable
            accessibilityLabel="Cancel food selection"
            accessibilityRole="button"
            onPress={handleCancel}
            style={styles.selectionAction}
          >
            <Text style={styles.selectionActionText}>Cancel</Text>
          </Pressable>
        )}
        <Text style={styles.headerTitle}>
          {inSelectionMode ? `Select Foods (${selectedIds.length})` : 'Foods'}
        </Text>
        <View style={styles.headerRight}>
          {!inSelectionMode && filteredCount < totalCount && !pantryOnly && (
            <Text style={styles.filterCount}>{filteredCount}/{totalCount}</Text>
          )}
          {!inSelectionMode && pantryOnly && (
            <Text style={styles.filterCount}>{displayedFoods.length} in pantry</Text>
          )}
          {!inSelectionMode && (
            <Pressable
              accessibilityLabel={pantryOnly ? 'Show all foods' : 'Show pantry foods only'}
              accessibilityRole="button"
              onPress={() => setPantryOnly((v) => !v)}
              style={styles.pantryToggle}
            >
              <View style={{ opacity: pantryOnly ? 1 : 0.3 }}>
                <PantryIcon width={28} height={28} />
              </View>
            </Pressable>
          )}
          {inSelectionMode && (
            <Pressable
              accessibilityLabel="Confirm food selection"
              accessibilityRole="button"
              onPress={handleDone}
              style={styles.selectionAction}
            >
              <Text style={[styles.selectionActionText, styles.selectionActionPrimary]}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>
      <FoodFilterBar />
      <FoodList
        foods={displayedFoods}
        onPressFood={
          inSelectionMode
            ? (food) => togglePendingWaystationFood(food.id)
            : handleFoodPress
        }
        pinnedIds={inSelectionMode ? selectedIds : undefined}
        onTogglePin={inSelectionMode ? togglePendingWaystationFood : undefined}
        pantryIds={inSelectionMode ? undefined : pantryFoodIds}
        onTogglePantry={inSelectionMode ? undefined : togglePantryFood}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: colors.textPrimary,
    lineHeight: 28,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterCount: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  pantryToggle: {
    padding: 4,
  },
  selectionAction: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  selectionActionText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  selectionActionPrimary: {
    color: colors.primaryDark,
  },
});
