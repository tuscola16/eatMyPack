import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { PackPlan } from '@/types/plan';
import { formatWeight } from '@/utils/formatters';

interface PlanCardProps {
  plan: PackPlan;
  onPress: () => void;
  onDelete?: () => void;
}

const CONDITIONS_EMOJI: Record<string, string> = {
  hot: '🔥',
  moderate: '☀️',
  cool: '❄️',
};

export default function PlanCard({ plan, onPress, onDelete }: PlanCardProps) {
  const distanceLabel = plan.race_config.distance === 'custom'
    ? `${plan.race_config.custom_distance_km ?? '?'}km`
    : plan.race_config.distance;

  const createdDate = new Date(plan.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const conditionsEmoji = CONDITIONS_EMOJI[plan.race_config.conditions] ?? '';

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

      <View style={styles.header}>
        <Text style={styles.distance}>{distanceLabel}</Text>
        <Text style={styles.duration}>
          {plan.race_config.expected_duration_hours}h {conditionsEmoji}
        </Text>
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
          <Text style={styles.statValue}>{formatWeight(plan.total_weight_g)}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
    color: colors.primaryLight,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
