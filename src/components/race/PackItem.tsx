import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { PackEntry } from '@/types/plan';
import { formatWeight, formatWeightOz } from '@/utils/formatters';
import { useStore } from '@/store/useStore';
import CategoryIcon from '@/components/illustrations/CategoryIcon';

interface PackItemProps {
  entry: PackEntry;
  phaseIndex: number;
  isLocked: boolean;
  onRemove: (foodId: string) => void;
  onToggleLock: (foodId: string) => void;
  onAdjustServings: (foodId: string, delta: number) => void;
  onPress?: () => void;
}

export default function PackItem({
  entry,
  phaseIndex,
  isLocked,
  onRemove,
  onToggleLock,
  onAdjustServings,
  onPress,
}: PackItemProps) {
  const weightUnit = useStore((s) => s.userPreferences.weightUnit);
  const { food, servings, total_calories, total_weight_g } = entry;

  const info = (
    <View style={styles.infoRow}>
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
        <Text style={styles.weight}>
          {weightUnit === 'oz' ? formatWeightOz(total_weight_g) : formatWeight(total_weight_g)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Food info — tappable to navigate to food detail */}
      {onPress ? (
        <TouchableOpacity style={styles.infoTouchable} onPress={onPress} activeOpacity={0.7}>
          {info}
        </TouchableOpacity>
      ) : (
        <View style={styles.infoTouchable}>{info}</View>
      )}

      {/* Action column: X / lock / +- */}
      <View style={styles.actionCol}>
        {/* Top zone: remove */}
        <TouchableOpacity
          style={styles.actionZone}
          onPress={() => onRemove(food.id)}
          activeOpacity={0.6}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>

        {/* Mid zone: lock */}
        <TouchableOpacity
          style={styles.actionZone}
          onPress={() => onToggleLock(food.id)}
          activeOpacity={0.6}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Text style={[styles.lockText, isLocked && styles.lockTextActive]}>
            {isLocked ? '🔒' : '🔓'}
          </Text>
        </TouchableOpacity>

        {/* Bottom zone: +/- */}
        <View style={[styles.actionZone, styles.adjustRow]}>
          <TouchableOpacity
            onPress={() => onAdjustServings(food.id, -1)}
            activeOpacity={0.6}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={styles.adjustText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onAdjustServings(food.id, 1)}
            activeOpacity={0.6}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={styles.adjustText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    minHeight: 72,
  },
  infoTouchable: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: spacing.sm,
    flex: 1,
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

  // Action column
  actionCol: {
    width: 44,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    flexDirection: 'column',
  },
  actionZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  adjustRow: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    gap: 2,
  },
  removeText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '700',
  },
  lockText: {
    fontSize: 13,
    opacity: 0.4,
  },
  lockTextActive: {
    opacity: 1,
  },
  adjustText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});
