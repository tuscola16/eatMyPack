import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useStore } from '@/store/useStore';
import FoodList from '@/components/food/FoodList';
import { FOODS } from '@/data/foods';

export default function PantryScreen() {
  const router = useRouter();
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const togglePantryFood = useStore((s) => s.togglePantryFood);

  const pantryFoods = useMemo(() => {
    return FOODS.filter((f) => pantryFoodIds.includes(f.id));
  }, [pantryFoodIds]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Pantry</Text>
        <Text style={styles.countBadge}>
          {pantryFoodIds.length} item{pantryFoodIds.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <FoodList
        foods={pantryFoods}
        pantryIds={pantryFoodIds}
        onTogglePantry={togglePantryFood}
        onPressFood={(food) =>
          router.push({ pathname: '/database/[id]', params: { id: food.id } })
        }
        emptyMessage="Your pantry is empty. Add foods from the Foods tab."
      />
      <Pressable
        style={styles.addFoodsButton}
        onPress={() => router.push('/database')}
      >
        <Text style={styles.addFoodsText}>+ Add new foods</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    minWidth: 64,
    paddingVertical: spacing.xs,
  },
  headerBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  countBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    minWidth: 64,
    textAlign: 'right',
  },
  addFoodsButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  addFoodsText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
