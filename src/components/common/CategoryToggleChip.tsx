import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { FoodCategory, CATEGORY_LABELS } from '@/types/food';
import CategoryIcon from '@/components/illustrations/CategoryIcon';
import { getCategoryColor } from '@/utils/formatters';

interface CategoryToggleChipProps {
  category: FoodCategory;
  active: boolean;
  onToggle: () => void;
  activeColor?: string;
  disabled?: boolean;
}

export function CategoryToggleChip({
  category,
  active,
  onToggle,
  activeColor,
  disabled,
}: CategoryToggleChipProps) {
  const chipColor = activeColor ?? getCategoryColor(category);

  return (
    <Pressable
      style={[
        styles.chip,
        active && { backgroundColor: chipColor, borderColor: chipColor },
        disabled && styles.disabled,
      ]}
      onPress={onToggle}
      disabled={disabled}
    >
      <CategoryIcon category={category} size={14} />
      <Text style={[styles.label, active && styles.labelActive]}>
        {CATEGORY_LABELS[category]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
});
