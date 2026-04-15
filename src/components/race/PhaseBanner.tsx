import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { PackPhase } from '@/types/plan';
import { PHASE_COLORS } from '@/types/race';
import { formatPercent } from '@/utils/formatters';
import {
  PhaseEarly,
  PhaseMid,
  PhaseLate,
  PhaseNight,
  PhaseFinal,
} from '@/components/illustrations';
import type { PhaseType } from '@/types/race';

const PHASE_ILLUSTRATIONS: Record<PhaseType, React.ComponentType<{ width?: number; height?: number }>> = {
  early:      PhaseEarly,
  mid:        PhaseMid,
  late:       PhaseLate,
  night:      PhaseNight,
  final_push: PhaseFinal,
};

interface PhaseBannerProps {
  phase: PackPhase;
  isExpanded: boolean;
  onToggle: () => void;
}

const RING_SIZE = 40;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function PhaseBanner({ phase, isExpanded, onToggle }: PhaseBannerProps) {
  const phaseColor = PHASE_COLORS[phase.phase.type] ?? colors.primary;
  const pct = Math.min(phase.target_met_pct, 100);
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - pct / 100);
  const timeRange = `${phase.phase.start_hour}–${phase.phase.end_hour}h`;
  const PhaseIllustration = PHASE_ILLUSTRATIONS[phase.phase.type];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: phaseColor }]} />

      {/* Phase illustration — top-right corner */}
      {PhaseIllustration && (
        <View style={styles.illustration} pointerEvents="none">
          <PhaseIllustration width={160} height={100} />
        </View>
      )}

      <View style={styles.inner}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text style={styles.label}>{phase.phase.label}</Text>
            <Text style={styles.timeRange}> · {timeRange}</Text>
          </View>
          <Text style={styles.targets}>
            {Math.round(phase.total_calories)} / {phase.phase.total_cal_target} cal
          </Text>
        </View>

        <View style={styles.right}>
          <View style={styles.ringContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.border}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={phaseColor}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={`${RING_CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <Text style={styles.ringText}>{formatPercent(pct)}</Text>
          </View>

          <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    ...shadows.md,
  },
  accentBar: {
    width: 4,
  },
  illustration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 160,
    height: 100,
    opacity: 0.9,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  left: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  timeRange: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  targets: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
