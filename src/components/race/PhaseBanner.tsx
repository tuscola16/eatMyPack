import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { PackPhase } from '@/types/plan';
import { PHASE_COLORS } from '@/types/race';
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

export default function PhaseBanner({ phase, isExpanded, onToggle }: PhaseBannerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const phaseColor = PHASE_COLORS[phase.phase.type] ?? colors.primary;
  const timeRange = `${phase.phase.start_hour}–${phase.phase.end_hour}h`;
  const PhaseIllustration = PHASE_ILLUSTRATIONS[phase.phase.type];

  // Cap illustration at 40% of card width (card ~= screen - 2*padding)
  const cardWidth = screenWidth - spacing.lg * 2;
  const illustrationWidth = Math.min(160, cardWidth * 0.4);
  const illustrationHeight = illustrationWidth * 0.625; // maintain ~160:100 ratio

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: phaseColor }]} />

      {/* Phase illustration — top-right corner, capped at 40% width */}
      {PhaseIllustration && (
        <View style={[styles.illustration, { width: illustrationWidth, height: illustrationHeight }]} pointerEvents="none">
          <PhaseIllustration width={illustrationWidth} height={illustrationHeight} />
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

        <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
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
    opacity: 0.9,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
  },
  left: {
    flex: 1,
    paddingRight: spacing.md,
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
  chevron: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
