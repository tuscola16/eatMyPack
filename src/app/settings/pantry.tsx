import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { useFoodDatabase } from '@/hooks/useFoodDatabase';
import { useStore } from '@/store/useStore';
import FoodFilterBar from '@/components/food/FoodFilterBar';
import FoodList from '@/components/food/FoodList';

export default function PantryScreen() {
  const { foods } = useFoodDatabase();
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const togglePantryFood = useStore((s) => s.togglePantryFood);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Pantry',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerRight: () => (
            <Text style={styles.countBadge}>
              {pantryFoodIds.length} item{pantryFoodIds.length !== 1 ? 's' : ''}
            </Text>
          ),
        }}
      />
      <FoodFilterBar />
      <FoodList
        foods={foods}
        pantryIds={pantryFoodIds}
        onTogglePantry={togglePantryFood}
        emptyMessage="No foods found. Try adjusting your filters."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  countBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.md,
  },
});
