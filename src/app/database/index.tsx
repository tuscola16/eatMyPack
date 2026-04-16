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
  const [pantryOnly, setPantryOnly] = useState(false);

  const displayedFoods = pantryOnly
    ? foods.filter((f) => pantryFoodIds.includes(f.id))
    : foods;

  const handleFoodPress = (food: FoodItem) => {
    router.push({ pathname: '/database/[id]', params: { id: food.id } });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foods</Text>
        <View style={styles.headerRight}>
          {filteredCount < totalCount && !pantryOnly && (
            <Text style={styles.filterCount}>{filteredCount}/{totalCount}</Text>
          )}
          {pantryOnly && (
            <Text style={styles.filterCount}>{displayedFoods.length} in pantry</Text>
          )}
          <Pressable onPress={() => setPantryOnly((v) => !v)} style={styles.pantryToggle}>
            <View style={{ opacity: pantryOnly ? 1 : 0.3 }}>
              <PantryIcon width={28} height={28} />
            </View>
          </Pressable>
        </View>
      </View>
      <FoodFilterBar />
      <FoodList
        foods={displayedFoods}
        onPressFood={handleFoodPress}
        pantryIds={pantryFoodIds}
        onTogglePantry={togglePantryFood}
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
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  pantryToggle: {
    padding: 4,
  },
});
