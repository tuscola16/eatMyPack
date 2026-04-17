import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { PackPlan } from '@/types/plan';
import { Conditions } from '@/types/race';
import { formatWeightAuto } from '@/utils/formatters';
import { useStore } from '@/store/useStore';
import { HotIcon, ColdIcon, ModerateIcon } from '@/components/illustrations';

interface PlanCardProps {
  plan: PackPlan;
  onPress: () => void;
  onDelete?: () => void;
}

const CONDITIONS_ICON: Record<Conditions, React.ComponentType<{ width?: number; height?: number }>> = {
  hot: HotIcon,
  moderate: ModerateIcon,
  cool: ColdIcon,
};

export default function PlanCard({ plan, onPress, onDelete }: PlanCardProps) {
  const weightUnit = useStore((s) => s.userPreferences.weightUnit);

  const distanceLabel = plan.race_config.distance === 'custom'
    ? `${plan.race_config.custom_distance_km ?? '?'}km`
    : plan.race_config.distance;

  const createdDate = new Date(plan.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const ConditionIcon = CONDITIONS_ICON[plan.race_config.conditions];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      )}

      {plan.name ? (
        <Text style={styles.title} numberOfLines={1}>{plan.name}</Text>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.distance}>{distanceLabel}</Text>
        <Text style={styles.duration}>
          {plan.race_config.expected_duration_hours}h
        </Text>
        {ConditionIcon ? <ConditionIcon width={18} height={18} /> : null}
      </View>

      <Text style={styles.date}>{createdDate}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{plan.total_calories.toLocaleString()}</Text>
          <Text style={styles.statLabel}>cal</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{plan.total_items}</Text>
          <Text style={styles.statLabel}>items</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatWeightAuto(plan.total_weight_g, weightUnit)}</Text>
          <Text style={styles.statLabel}>weight</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    padding: spacing.xs,
  },
  deleteIcon: {
    fontSize: 14,
    color: colors.error,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  distance: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  duration: {
    ...typography.body,
    color: colors.textSecondary,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statValue: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
