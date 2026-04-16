import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { useFoodDatabase } from '@/hooks/useFoodDatabase';
import { useStore } from '@/store/useStore';
import FoodFilterBar from '@/components/food/FoodFilterBar';
import FoodList from '@/components/food/FoodList';
import type { FoodItem } from '@/types';

export default function DatabaseScreen() {
  const router = useRouter();
  const { foods, filteredCount, totalCount } = useFoodDatabase();
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const togglePantryFood = useStore((s) => s.togglePantryFood);

  const handleFoodPress = (food: FoodItem) => {
    router.push({ pathname: '/database/[id]', params: { id: food.id } });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foods</Text>
        {filteredCount < totalCount && (
          <Text style={styles.filterCount}>{filteredCount}/{totalCount}</Text>
        )}
      </View>
      <FoodFilterBar />
      <FoodList
        foods={foods}
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
    alignItems: 'baseline',
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
  filterCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
