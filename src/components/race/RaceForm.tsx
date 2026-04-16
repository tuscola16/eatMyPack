import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Switch,
  Pressable,
  Dimensions,
  Modal,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { RaceConfig, RaceDistance, Conditions, SetupMode, Waystation, DISTANCE_TO_MILES } from '@/types/race';
import { DURATION_SUGGESTIONS } from '@/data/raceDefaults';
import { useStore } from '@/store/useStore';
import Slider from '@react-native-community/slider';
import WaystationEditor from './WaystationEditor';

interface RaceFormProps {
  onSubmit: (config: RaceConfig, name: string) => void;
  initialConfig?: Partial<RaceConfig>;
  mode?: SetupMode;
  heroComponent?: React.ReactNode;
}

const DISTANCES: { value: RaceDistance; label: string }[] = [
  { value: '50K', label: '50K' },
  { value: '50mi', label: '50 mi' },
  { value: '100K', label: '100K' },
  { value: '100mi', label: '100 mi' },
  { value: '200mi', label: '200 mi' },
  { value: 'custom', label: 'Custom' },
];

const CONDITIONS: { value: Conditions; label: string; color: string }[] = [
  { value: 'hot', label: 'Hot', color: '#BE5C35' },
  { value: 'moderate', label: 'Moderate', color: '#8EA778' },
  { value: 'cool', label: 'Cool', color: '#ABC2CA' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RaceForm({ onSubmit, initialConfig, mode: initialMode, heroComponent }: RaceFormProps) {
  const [setupMode, setSetupMode] = useState<SetupMode>(initialMode ?? 'simple');
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
  const [waystations, setWaystations] = useState<Waystation[]>(
    initialConfig?.waystations ?? []
  );
  const [planName, setPlanName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const useFromPantry = useStore((s) => s.useFromPantry);
  const setUseFromPantry = useStore((s) => s.setUseFromPantry);

  const durationRange = distance && distance !== 'custom'
    ? DURATION_SUGGESTIONS[distance]
    : null;

  useEffect(() => {
    if (distance && durationRange && setupMode === 'simple') {
      const mid = Math.round((durationRange[0] + durationRange[1]) / 2);
      setExpectedHours(mid);
    }
  }, [distance]);

  useEffect(() => {
    if (setupMode === 'complex') {
      setDistance('custom');
    }
  }, [setupMode]);

  const handleDistanceSelect = (d: RaceDistance) => {
    setDistance(d);
  };

  const totalDistanceMiles = distance && distance !== 'custom'
    ? DISTANCE_TO_MILES[distance]
    : customDistanceKm ? parseFloat(customDistanceKm) * 0.621371 : undefined;

  const packVolumeMl = packVolumeLiters
    ? Math.round(parseFloat(packVolumeLiters) * 1000) || undefined
    : undefined;

  const handleBuildMyPack = () => {
    if (!distance || !conditions) return;
    const distLabel = distance === 'custom'
      ? `${customDistanceKm || '?'}km`
      : distance;
    setPlanName(`${distLabel} ${expectedHours}h`);
    setShowNameModal(true);
  };

  const handleSubmit = () => {
    if (!distance || !conditions) return;
    const config: RaceConfig = {
      distance,
      expected_duration_hours: expectedHours,
      conditions,
      setup_mode: setupMode,
    };
    if (distance === 'custom' && customDistanceKm) {
      config.custom_distance_km = parseFloat(customDistanceKm);
    }
    if (packVolumeMl) {
      config.max_volume_ml = packVolumeMl;
    }
    if (setupMode === 'complex') {
      if (calPerHour) {
        const cal = parseFloat(calPerHour);
        if (!isNaN(cal) && cal > 0) {
          config.cal_per_hour_override = cal;
        }
      }
      if (waystations.length > 0) {
        config.waystations = waystations;
      }
    }
    onSubmit(config, planName || 'Unnamed Plan');
  };

  const formatRange = (range: [number, number] | null) => {
    if (!range) return '';
    return `${range[0]}–${range[1]}h`;
  };

  // Step progress computation
  const isSimple = setupMode === 'simple';
  const totalSteps = isSimple ? 3 : 5;

  const getCompletedSteps = (): number => {
    let steps = 1;
    if (distance !== null) steps++;
    if (isSimple) {
      if (conditions) steps++;
    } else {
      if (expectedHours > 0 && distance !== null) steps++;
      if (calPerHour) steps++;
      if (conditions) steps++;
    }
    return Math.min(steps, totalSteps);
  };

  const completedSteps = getCompletedSteps();

  // Progressive unlock
  const distanceStepUnlocked = true;
  const timeStepUnlocked = distance !== null;
  const calStepUnlocked = distance !== null && expectedHours > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero — scrolls with content */}
      {heroComponent}

      {/* Simple / Complex toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, isSimple && styles.modeButtonActive]}
          onPress={() => setSetupMode('simple')}
        >
          <Text style={[styles.modeButtonText, isSimple && styles.modeButtonTextActive]}>
            Simple
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, !isSimple && styles.modeButtonActive]}
          onPress={() => setSetupMode('complex')}
        >
          <Text style={[styles.modeButtonText, !isSimple && styles.modeButtonTextActive]}>
            Complex
          </Text>
        </Pressable>
      </View>

      {/* Step indicators */}
      <View style={styles.stepIndicators}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <View style={[styles.stepLine, i < completedSteps && styles.stepLineActive]} />
            )}
            <View style={[styles.stepCircle, i < completedSteps && styles.stepCircleActive]}>
              <Text style={[
                styles.stepCircleText,
                i >= completedSteps && styles.stepCircleTextInactive,
              ]}>
                {i + 1}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Name Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNameModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Name Your Plan</Text>
            <TextInput
              style={styles.textInput}
              value={planName}
              onChangeText={setPlanName}
              placeholder="e.g. Western States 100"
              placeholderTextColor={colors.textMuted}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  styles.modalSubmitButton,
                  pressed ? { transform: [{ scale: 0.97 }] } : undefined,
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Create Plan</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

          {/* Step: Distance */}
          <View style={[styles.stepContainer, !distanceStepUnlocked && styles.locked]}>
            <Text style={styles.stepTitle}>
              {isSimple ? 'Choose Your Distance' : 'Custom Distance'}
            </Text>
            <Text style={styles.stepSubtitle}>
              {isSimple ? 'What are you racing?' : 'Enter your race distance'}
            </Text>

            {isSimple && (
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

            {/* Pack capacity + Conditions on same step */}
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
              <Text style={styles.volumeHint}>Leave blank for no volume limit</Text>
            </View>

            <Text style={styles.conditionsTitle}>Race Conditions</Text>
            <View style={styles.conditionsRow}>
              {CONDITIONS.map((c) => {
                const isSelected = conditions === c.value;
                return (
                  <Pressable
                    key={c.value}
                    style={[
                      styles.conditionPill,
                      isSelected && {
                        backgroundColor: c.color + '22',
                        borderColor: c.color,
                      },
                    ]}
                    onPress={() => setConditions(c.value)}
                  >
                    <Text style={[
                      styles.conditionPillText,
                      isSelected && { color: c.color, fontWeight: '700' },
                    ]}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Duration step */}
          <View style={[styles.stepContainer, !timeStepUnlocked && styles.locked]}
            pointerEvents={timeStepUnlocked ? 'auto' : 'none'}
          >
            <Text style={styles.stepTitle}>
              {isSimple ? 'Expected Duration' : 'Duration'}
            </Text>
            {durationRange && isSimple && (
              <Text style={styles.stepSubtitle}>
                Suggested range: {formatRange(durationRange)}
              </Text>
            )}

            <View style={styles.durationContainer}>
              <Text style={styles.durationValue}>{expectedHours}h</Text>
              <Slider
                style={styles.slider}
                minimumValue={durationRange ? durationRange[0] : 3}
                maximumValue={durationRange ? durationRange[1] : 120}
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
                  {durationRange ? `${durationRange[1]}h` : '120h'}
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
          </View>

          {/* Complex-only: Cal/hr step */}
          {!isSimple && (
            <View style={[styles.stepContainer, !calStepUnlocked && styles.locked]}
              pointerEvents={calStepUnlocked ? 'auto' : 'none'}
            >
              <Text style={styles.stepTitle}>Calories Per Hour</Text>
              <Text style={styles.stepSubtitle}>Override the default calorie target</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={calPerHour}
                  onChangeText={setCalPerHour}
                  keyboardType="numeric"
                  placeholder="e.g. 250"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          )}

          {/* Complex-only: Waystations */}
          {!isSimple && distance && (
            <WaystationEditor
              waystations={waystations}
              onChange={setWaystations}
              totalDurationHours={expectedHours}
              totalDistanceMiles={totalDistanceMiles}
              defaultPackVolumeMl={packVolumeMl}
            />
          )}

          {/* Pantry toggle */}
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

          {/* Build button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              (!distance || !conditions) && styles.submitButtonDisabled,
              pressed && distance && conditions ? { transform: [{ scale: 0.97 }] } : undefined,
            ]}
            onPress={handleBuildMyPack}
            disabled={!distance || !conditions}
          >
            <Text style={styles.submitButtonText}>Build My Pack</Text>
          </Pressable>
    </ScrollView>
  );
}

const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - CARD_GAP * 2) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    padding: 3,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  modeButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  modeButtonText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
  },

  // Step indicator
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0D5C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleText: {
    fontSize: 11,
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
  locked: {
    opacity: 0.4,
  },
  stepTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // Distance grid — 3 columns, smaller cards
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: spacing.md,
  },
  distanceCard: {
    width: CARD_WIDTH,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
  distanceLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  distanceLabelSelected: {
    color: colors.primaryDark,
  },
  distanceRange: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Conditions — colored pills, no emojis
  conditionsTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  conditionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  conditionPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  conditionPillText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },

  // Duration
  durationContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  durationValue: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
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

  // Inputs
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

  // Pantry toggle
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

  // Submit
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

  // Name modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modalCancelText: {
    ...typography.button,
    color: colors.textSecondary,
    fontSize: 15,
  },
  modalSubmitButton: {
    flex: 1,
  },
});
