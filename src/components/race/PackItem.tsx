import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { PackEntry } from '@/types/plan';
import { formatWeight } from '@/utils/formatters';
import CategoryIcon from '@/components/illustrations/CategoryIcon';
import SwipeableRow from '@/components/common/SwipeableRow';

interface PackItemProps {
  entry: PackEntry;
  onReject: (foodId: string) => void;
  onPress?: () => void;
}

export default function PackItem({ entry, onReject, onPress }: PackItemProps) {
  const { food, servings, total_calories, total_weight_g } = entry;

  const content = (
    <View style={styles.container}>
      <CategoryIcon category={food.category} size={22} />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={styles.brand} numberOfLines={1}>
          {food.brand}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.servingsBadge}>
          <Text style={styles.servingsText}>×{servings}</Text>
        </View>
        <Text style={styles.calories}>{total_calories} cal</Text>
        <Text style={styles.weight}>{formatWeight(total_weight_g)}</Text>
      </View>
    </View>
  );

  return (
    <SwipeableRow
      onSwipeLeft={() => onReject(food.id)}
      leftLabel="Don't have"
    >
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  brand: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  stats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  servingsBadge: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  servingsText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  calories: {
    ...typography.caption,
    color: colors.calories,
    fontWeight: '600',
  },
  weight: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
