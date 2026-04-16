import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { PackPlan } from '@/types/plan';
import { formatWeight, formatWeightOz, formatCalPerHour, formatVolume } from '@/utils/formatters';
import { useStore } from '@/store/useStore';

interface PackSummaryProps {
  plan: PackPlan;
}

const CONDITIONS_LABEL: Record<string, string> = {
  hot: 'Hot',
  moderate: 'Moderate',
  cool: 'Cool',
};

// Animated fill bar — width grows from 0 to `pct`% on mount
interface NutritionBarProps {
  label: string;
  value: string;
  pct: number;          // 0–100
  color: string;
  delayMs: number;
}

function NutritionBar({ label, value, pct, color, delayMs }: NutritionBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delayMs,
      withTiming(Math.min(pct, 100), {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.trackWrap}>
        <View style={barStyles.track}>
          <Animated.View style={[barStyles.fill, { backgroundColor: color }, fillStyle]} />
        </View>
      </View>
      <Text style={barStyles.value}>{value}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  label: {
    ...typography.small,
    color: colors.textSecondary,
    width: 40,
  },
  trackWrap: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySubtle,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: borderRadius.full,
  },
  value: {
    ...typography.small,
    color: colors.textMuted,
    width: 56,
    textAlign: 'right',
  },
});

export default function PackSummary({ plan }: PackSummaryProps) {
  const weightUnit = useStore((s) => s.userPreferences.weightUnit);
  const avgCalPerHour = plan.race_config.expected_duration_hours > 0
    ? Math.round(plan.total_calories / plan.race_config.expected_duration_hours)
    : 0;

  const hasVolumeLimit = plan.race_config.max_volume_ml != null && plan.race_config.max_volume_ml > 0;
  const totalVolume = plan.total_volume_ml ?? 0;

  const distanceLabel = plan.race_config.distance === 'custom'
    ? `${plan.race_config.custom_distance_km ?? '?'}km`
    : plan.race_config.distance;

  const configLine = `${distanceLabel} · ${plan.race_config.expected_duration_hours}h · ${CONDITIONS_LABEL[plan.race_config.conditions] ?? plan.race_config.conditions}`;

  // Compute plan-level totals and targets from phases
  const totalCalTarget    = plan.phases.reduce((s, p) => s + p.phase.total_cal_target, 0);
  const totalCarbsG       = plan.phases.reduce((s, p) => s + p.total_carbs_g, 0);
  const totalCarbTarget   = plan.phases.reduce((s, p) => s + p.phase.total_carb_target_g, 0);
  const totalSodiumMg     = plan.phases.reduce((s, p) => s + p.total_sodium_mg, 0);
  const totalSodiumTarget = plan.phases.reduce(
    (s, p) => s + p.phase.sodium_per_hour_target_mg * p.phase.duration_hours,
    0,
  );

  const calPct    = totalCalTarget    > 0 ? (plan.total_calories / totalCalTarget)  * 100 : 0;
  const carbPct   = totalCarbTarget   > 0 ? (totalCarbsG         / totalCarbTarget) * 100 : 0;
  const sodiumPct = totalSodiumTarget > 0 ? (totalSodiumMg       / totalSodiumTarget) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.configLine}>{configLine}</Text>

      {/* Volume progress bar */}
      {hasVolumeLimit && (
        <View style={styles.volumeSection}>
          <View style={styles.volumeHeader}>
            <Text style={styles.volumeLabel}>Volume</Text>
            <Text style={styles.volumeValue}>
              {formatVolume(totalVolume)} / {formatVolume(plan.race_config.max_volume_ml!)}
            </Text>
          </View>
          <View style={styles.volumeTrack}>
            <Animated.View
              style={[
                styles.volumeFill,
                {
                  width: `${Math.min((totalVolume / plan.race_config.max_volume_ml!) * 100, 100)}%`,
                  backgroundColor: totalVolume > plan.race_config.max_volume_ml!
                    ? colors.error
                    : colors.primary,
                },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.calories }]}>
            {plan.total_calories.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Cal</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {weightUnit === 'oz' ? formatWeightOz(plan.total_weight_g) : formatWeight(plan.total_weight_g)}
          </Text>
          <Text style={styles.statLabel}>Weight</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.carbs }]}>
            {formatCalPerHour(avgCalPerHour)}
          </Text>
          <Text style={styles.statLabel}>Cal/hr</Text>
        </View>
      </View>

      {/* Animated macro fill bars */}
      <View style={styles.barsSection}>
        <NutritionBar
          label="Cal"
          value={`${Math.round(calPct)}%`}
          pct={calPct}
          color={colors.calories}
          delayMs={0}
        />
        <NutritionBar
          label="Carbs"
          value={`${Math.round(totalCarbsG)}g`}
          pct={carbPct}
          color={colors.carbs}
          delayMs={80}
        />
        <NutritionBar
          label="Na⁺"
          value={`${Math.round(totalSodiumMg)}mg`}
          pct={sodiumPct}
          color={colors.sodium}
          delayMs={160}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  configLine: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  volumeSection: {
    marginBottom: spacing.md,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  volumeLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  volumeValue: {
    ...typography.small,
    color: colors.textMuted,
  },
  volumeTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySubtle,
    overflow: 'hidden',
  },
  volumeFill: {
    height: 8,
    borderRadius: borderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.borderLight,
  },
  statValue: {
    ...typography.stat,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  barsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
