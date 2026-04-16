import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import CategoryIcon from '@/components/illustrations/CategoryIcon';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { FoodItem } from '@/types/food';

interface PantryCardProps {
  food: FoodItem;
  cardWidth: number;
  cardHeight: number;
  weightUnit: 'oz' | 'g';
  onPress: () => void;
}

export default function PantryCard({ food, cardWidth, cardHeight, weightUnit, onPress }: PantryCardProps) {
  const macros = useMemo(() => {
    if (food.calories <= 0) return { carbs: 0, protein: 0, fat: 0 };
    return {
      carbs: Math.min(Math.round((food.carbs_g * 4) / food.calories * 100), 100),
      protein: Math.min(Math.round((food.protein_g * 4) / food.calories * 100), 100),
      fat: Math.min(Math.round((food.fat_g * 9) / food.calories * 100), 100),
    };
  }, [food.calories, food.carbs_g, food.protein_g, food.fat_g]);

  return (
    <View style={[styles.shadowWrapper, { width: cardWidth + 4, height: cardHeight + 4 }]}>
      <View style={[styles.shadowLayer, { width: cardWidth, height: cardHeight, borderRadius: borderRadius.lg }]} />
      <AnimatedPressable
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
        onPress={onPress}
      >
        <View style={styles.iconContainer}>
          <CategoryIcon category={food.category} size={28} />
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {food.name}
        </Text>

        <Text style={styles.calories}>{food.calories} cal</Text>

        <View style={styles.macroTable}>
          <MacroRow label="Carbs" value={`${food.carbs_g} g`} percent={macros.carbs} />
          <MacroRow label="Protein" value={`${food.protein_g} g`} percent={macros.protein} />
          <MacroRow label="Fat" value={`${food.fat_g} g`} percent={macros.fat} />
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>Sodium</Text>
            <Text style={styles.macroValue}>{food.sodium_mg} mg</Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {Math.round(weightUnit === 'g' ? food.cal_per_g : food.cal_per_oz)} cal/{weightUnit}
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
}

function MacroRow({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <View style={styles.macroRow}>
      <View style={[styles.macroBar, { width: `${percent}%` }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#CAAC86',
  },
  card: {
    marginBottom: 4,
    marginLeft: 4,
    backgroundColor: colors.pantryCardBg,
    borderWidth: 1,
    borderColor: colors.pantryCardBorder,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 0,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
    transform: [{ rotate: '-8deg' }],
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  calories: {
    ...typography.h4,
    fontSize: (typography.h4 as any).fontSize - 2,
    color: '#70462D',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  macroTable: {
    width: '100%',
    gap: 2,
    marginBottom: spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  macroBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.pantryHighlight,
    borderRadius: 2,
  },
  macroLabel: {
    ...typography.small,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  macroValue: {
    ...typography.small,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: '#F5BF79',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#BC6039',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  badgeText: {
    ...typography.small,
    color: colors.pantryBrown,
    fontWeight: '600',
  },
});
