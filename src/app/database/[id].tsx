import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useFoodById } from '@/hooks/useFoodDatabase';
import { useStore } from '@/store/useStore';
import FoodDetail from '@/components/food/FoodDetail';
import EmptyState from '@/components/common/EmptyState';

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const food = useFoodById(id ?? '');
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const togglePantryFood = useStore((s) => s.togglePantryFood);
  const isInPantry = food ? pantryFoodIds.includes(food.id) : false;

  if (!food) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Not Found',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
          }}
        />
        <EmptyState title="Food not found" subtitle="This item may have been removed." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: food.name,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerRight: () => (
            <TouchableOpacity onPress={() => togglePantryFood(food.id)} style={styles.pinButton}>
              <Text style={[styles.pinText, isInPantry && styles.pinTextActive]}>
                {isInPantry ? 'In Pantry' : '+ Pantry'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <FoodDetail food={food} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pinButton: {
    marginRight: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  pinText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pinTextActive: {
    color: colors.primary,
  },
});
