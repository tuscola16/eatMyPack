import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Pressable,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { RaceConfig, RaceDistance, Conditions, SetupMode } from '@/types/race';
import { DURATION_SUGGESTIONS } from '@/data/raceDefaults';
import { useStore } from '@/store/useStore';
import Slider from '@react-native-community/slider';

interface RaceFormProps {
  onSubmit: (config: RaceConfig) => void;
  initialConfig?: Partial<RaceConfig>;
  mode?: SetupMode;
}

const DISTANCES: { value: RaceDistance; label: string }[] = [
  { value: '50K', label: '50K' },
  { value: '50mi', label: '50 mi' },
  { value: '100K', label: '100K' },
  { value: '100mi', label: '100 mi' },
  { value: '200mi', label: '200 mi' },
  { value: 'custom', label: 'Custom' },
];

const CONDITIONS: { value: Conditions; label: string; emoji: string }[] = [
  { value: 'hot', label: 'Hot', emoji: '🔥' },
  { value: 'moderate', label: 'Moderate', emoji: '☀️' },
  { value: 'cool', label: 'Cool', emoji: '❄️' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RaceForm({ onSubmit, initialConfig, mode = 'wizard' }: RaceFormProps) {
  const [distance, setDistance] = useState<RaceDistance | null>(
    initialConfig?.distance ?? null
  );
  const [customDistanceKm, setCustomDistanceKm] = useState<string>(
    initialConfig?.custom_distance_km?.toString() ?? ''
  );
  const [expectedHours, setExpectedHours] = useState<number>(
    initialConfig?.expected_duration_hours ?? 10
  );
  const [conditions, setConditions] = useState<Conditions | null>(
    initialConfig?.conditions ?? null
  );
  const [packVolumeLiters, setPackVolumeLiters] = useState<string>(
    initialConfig?.max_volume_ml ? (initialConfig.max_volume_ml / 1000).toString() : ''
  );
  const [calPerHour, setCalPerHour] = useState<string>(
    initialConfig?.cal_per_hour_override?.toString() ?? ''
  );

  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const useFromPantry = useStore((s) => s.useFromPantry);
  const setUseFromPantry = useStore((s) => s.setUseFromPantry);

  const durationRange = distance && distance !== 'custom'
    ? DURATION_SUGGESTIONS[distance]
    : null;

  useEffect(() => {
    if (distance && durationRange) {
      const mid = Math.round((durationRange[0] + durationRange[1]) / 2);
      setExpectedHours(mid);
    }
  }, [distance]);

  const handleDistanceSelect = (d: RaceDistance) => {
    setDistance(d);
  };

  const handleSubmit = () => {
    if (!distance || !conditions) return;
    const config: RaceConfig = {
      distance,
      expected_duration_hours: expectedHours,
      conditions,
      setup_mode: mode,
    };
    if (distance === 'custom' && customDistanceKm) {
      config.custom_distance_km = parseFloat(customDistanceKm);
    }
    if (packVolumeLiters) {
      const liters = parseFloat(packVolumeLiters);
      if (!isNaN(liters) && liters > 0) {
        config.max_volume_ml = Math.round(liters * 1000);
      }
    }
    if (mode === 'witch' && calPerHour) {
      const cal = parseFloat(calPerHour);
      if (!isNaN(cal) && cal > 0) {
        config.cal_per_hour_override = cal;
      }
    }
    onSubmit(config);
  };

  const formatRange = (range: [number, number] | null) => {
    if (!range) return '';
    return `${range[0]}–${range[1]}h`;
  };

  // Step indicator: step1 always active, step2+3 active once distance selected
  const step2Active = distance !== null;
  const step3Active = distance !== null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Step indicators — circles connected by lines */}
      <View style={styles.stepIndicators}>
        <View style={[styles.stepCircle, styles.stepCircleActive]}>
          <Text style={styles.stepCircleText}>1</Text>
        </View>
        <View style={[styles.stepLine, step2Active && styles.stepLineActive]} />
        <View style={[styles.stepCircle, step2Active && styles.stepCircleActive]}>
          <Text style={[styles.stepCircleText, !step2Active && styles.stepCircleTextInactive]}>2</Text>
        </View>
        <View style={[styles.stepLine, step3Active && styles.stepLineActive]} />
        <View style={[styles.stepCircle, step3Active && styles.stepCircleActive]}>
          <Text style={[styles.stepCircleText, !step3Active && styles.stepCircleTextInactive]}>3</Text>
        </View>
      </View>

      {/* Step 1 — Distance */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Choose Your Distance</Text>
        <Text style={styles.stepSubtitle}>What are you racing?</Text>
        <View style={styles.distanceGrid}>
          {DISTANCES.map((d) => {
            const isSelected = distance === d.value;
            const range = d.value !== 'custom' ? DURATION_SUGGESTIONS[d.value] : null;
            return (
              <Pressable
                key={d.value}
                style={({ pressed }) => [
                  styles.distanceCard,
                  isSelected && styles.distanceCardSelected,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
                onPress={() => handleDistanceSelect(d.value)}
              >
                {isSelected && (
                  <View style={styles.checkmarkBubble}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
                <Text style={[
                  styles.distanceLabel,
                  isSelected && styles.distanceLabelSelected,
                ]}>
                  {d.label}
                </Text>
                {range && (
                  <Text style={styles.distanceRange}>
                    {formatRange(range)}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Step 2 — Duration */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Expected Duration</Text>
        {durationRange && (
          <Text style={styles.stepSubtitle}>
            Suggested range: {formatRange(durationRange)}
          </Text>
        )}

        {mode === 'witch' && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Target calories per hour</Text>
            <TextInput
              style={styles.textInput}
              value={calPerHour}
              onChangeText={setCalPerHour}
              keyboardType="numeric"
              placeholder="e.g. 250"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

        {distance === 'custom' && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Distance (km)</Text>
            <TextInput
              style={styles.textInput}
              value={customDistanceKm}
              onChangeText={setCustomDistanceKm}
              keyboardType="numeric"
              placeholder="e.g. 160"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

        <View style={styles.durationContainer}>
          <Text style={styles.durationValue}>{expectedHours}h</Text>
          <Slider
            style={styles.slider}
            minimumValue={durationRange ? durationRange[0] : 3}
            maximumValue={durationRange ? durationRange[1] : 60}
            step={1}
            value={expectedHours}
            onValueChange={setExpectedHours}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {durationRange ? `${durationRange[0]}h` : '3h'}
            </Text>
            <Text style={styles.sliderLabel}>
              {durationRange ? `${durationRange[1]}h` : '60h'}
            </Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Or enter manually</Text>
          <TextInput
            style={styles.textInput}
            value={expectedHours.toString()}
            onChangeText={(val) => {
              const num = parseInt(val, 10);
              if (!isNaN(num) && num > 0) setExpectedHours(num);
            }}
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Pack capacity in liters (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={packVolumeLiters}
            onChangeText={setPackVolumeLiters}
            keyboardType="decimal-pad"
            placeholder="e.g. 3.5"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.volumeHint}>
            Leave blank for no volume limit
          </Text>
        </View>
      </View>

      {/* Step 3 — Conditions */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Race Conditions</Text>
        <Text style={styles.stepSubtitle}>
          Expected weather during the race
        </Text>

        <View style={styles.conditionsRow}>
          {CONDITIONS.map((c) => {
            const isSelected = conditions === c.value;
            return (
              <Pressable
                key={c.value}
                style={({ pressed }) => [
                  styles.conditionButton,
                  isSelected && styles.conditionButtonSelected,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
                onPress={() => setConditions(c.value)}
              >
                <Text style={styles.conditionEmoji}>{c.emoji}</Text>
                <Text style={[
                  styles.conditionLabel,
                  isSelected && styles.conditionLabelSelected,
                ]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {pantryFoodIds.length > 0 && (
          <View style={styles.pantryToggleRow}>
            <View style={styles.pantryToggleInfo}>
              <Text style={styles.pantryToggleLabel}>Build from My Pantry</Text>
              <Text style={styles.pantryToggleCount}>
                {pantryFoodIds.length} item{pantryFoodIds.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Switch
              value={useFromPantry}
              onValueChange={setUseFromPantry}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={useFromPantry ? colors.primary : colors.textMuted}
            />
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (!distance || !conditions) && styles.submitButtonDisabled,
            pressed && distance && conditions ? { transform: [{ scale: 0.97 }] } : undefined,
          ]}
          onPress={handleSubmit}
          disabled={!distance || !conditions}
        >
          <Text style={styles.submitButtonText}>Build My Pack</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const CARD_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Step indicator
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0D5C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textInverse,
  },
  stepCircleTextInactive: {
    color: colors.textSecondary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0D5C5',
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },

  stepContainer: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  distanceCard: {
    width: CARD_WIDTH,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  distanceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  checkmarkBubble: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  distanceLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  distanceLabelSelected: {
    color: colors.primaryDark,
  },
  distanceRange: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  durationValue: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.xs,
  },
  sliderLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inputRow: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  volumeHint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  conditionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  conditionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  conditionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  conditionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  conditionLabelSelected: {
    color: colors.primaryDark,
  },
  pantryToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  pantryToggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  pantryToggleLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  pantryToggleCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 17,
  },
});
