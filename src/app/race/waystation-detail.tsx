import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useStore } from '@/store/useStore';
import { usePackBuilder } from '@/hooks/usePackBuilder';
import type {
  Waystation,
  WaystationType,
  MarkerType,
  RaceConfig,
  WaystationFoodEntry,
} from '@/types/race';
import { DISTANCE_TO_MILES, migrateWaystationFoods } from '@/types/race';
import type { FoodItem } from '@/types/food';

const WS_TYPE_COLORS: Record<string, string> = {
  aid_station: '#8EA778',
  pack_refill: '#BE5C35',
  both: '#C4923A',
};

const WS_TYPE_LABELS: Record<string, string> = {
  aid_station: 'Aid Station',
  pack_refill: 'Pack Refill',
  both: 'Aid + Refill',
};

const TYPE_OPTIONS: { value: WaystationType; label: string }[] = [
  { value: 'aid_station', label: 'Aid Station' },
  { value: 'pack_refill', label: 'Pack Refill' },
  { value: 'both', label: 'Both' },
];

function getMarkerOptions(distanceUnit: 'km' | 'mi'): { value: MarkerType; label: string }[] {
  return [
    { value: 'hour', label: 'Hour' },
    { value: 'mile', label: distanceUnit === 'km' ? 'Km' : 'Mile' },
  ];
}

// Fields whose edits require regenerating the pack plan.
const REPACK_TRIGGER_KEYS: (keyof Waystation)[] = [
  'type',
  'marker_type',
  'marker_value',
  'estimated_hour',
  'calories_consumed',
  'pack_volume_ml',
];

function getTotalDistanceMiles(config: RaceConfig): number | undefined {
  if (config.distance === 'custom') {
    return config.custom_distance_km != null
      ? config.custom_distance_km / 1.609344
      : undefined;
  }
  return DISTANCE_TO_MILES[config.distance];
}

function recomputeEstimatedHour(
  ws: Waystation,
  totalDistanceMiles: number | undefined,
  totalDurationHours: number,
  distanceUnit: 'km' | 'mi',
): Waystation {
  if (ws.marker_type === 'hour') {
    return { ...ws, estimated_hour: ws.marker_value };
  }
  if (ws.marker_type === 'mile' && totalDistanceMiles && totalDistanceMiles > 0) {
    const markerMiles =
      distanceUnit === 'km' ? ws.marker_value * 0.621371 : ws.marker_value;
    return {
      ...ws,
      estimated_hour:
        Math.round((markerMiles / totalDistanceMiles) * totalDurationHours * 10) / 10,
    };
  }
  return ws;
}

function hasTriggerChange(original: Waystation, edited: Waystation): boolean {
  return REPACK_TRIGGER_KEYS.some((k) => original[k] !== edited[k]);
}

export default function WaystationDetailScreen() {
  const router = useRouter();
  const { wsId, planId } = useLocalSearchParams<{ wsId: string; planId?: string }>();

  const savedPlans = useStore((s) => s.savedPlans);
  const currentPlan = useStore((s) => s.currentPlan);
  const savePlan = useStore((s) => s.savePlan);
  const setCurrentPlan = useStore((s) => s.setCurrentPlan);
  const pendingWaystationFoods = useStore((s) => s.pendingWaystationFoods);
  const setPendingWaystationFoods = useStore((s) => s.setPendingWaystationFoods);
  const { rebuildFromConfig } = usePackBuilder();

  const plan = planId
    ? savedPlans.find((p) => p.id === planId) ?? null
    : currentPlan;

  const originalWaystation: Waystation | undefined = plan?.race_config?.waystations?.find(
    (ws) => ws.id === wsId,
  );

  const [edited, setEdited] = useState<Waystation | null>(originalWaystation ?? null);
  const [showRepackModal, setShowRepackModal] = useState(false);

  // When the underlying waystation changes (e.g. re-pack), refresh local state.
  useEffect(() => {
    if (originalWaystation) setEdited(originalWaystation);
  }, [originalWaystation?.id]);

  // Apply pending food-picker selections into the edited waystation.
  useEffect(() => {
    if (!pendingWaystationFoods || !pendingWaystationFoods.committed) return;
    if (pendingWaystationFoods.waystationId !== wsId) return;
    setEdited((prev) =>
      prev ? { ...prev, foods: pendingWaystationFoods.foods } : prev,
    );
    setPendingWaystationFoods(null);
  }, [pendingWaystationFoods, wsId, setPendingWaystationFoods]);

  const totalDistanceMiles = useMemo(
    () => (plan ? getTotalDistanceMiles(plan.race_config) : undefined),
    [plan?.race_config],
  );

  if (!plan || !originalWaystation || !edited) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorState}>
          <Pressable
            onPress={() => router.replace({ pathname: '/race/plan', params: { id: planId ?? '' } })}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.errorText}>Waystation not found.</Text>
        </View>
      </View>
    );
  }

  const typeColor = WS_TYPE_COLORS[edited.type] ?? colors.primary;
  const typeLabel = WS_TYPE_LABELS[edited.type] ?? edited.type;
  const hour = edited.estimated_hour ?? edited.marker_value;
  const isDirty = JSON.stringify(originalWaystation) !== JSON.stringify(edited);
  const distanceUnit = plan.race_config.distance_unit ?? 'mi';
  const markerOptions = getMarkerOptions(distanceUnit);
  const distLabel = distanceUnit === 'km' ? 'Km' : 'Mile';

  const updateField = <K extends keyof Waystation>(key: K, value: Waystation[K]) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      if (key === 'marker_type' || key === 'marker_value') {
        return recomputeEstimatedHour(
          next,
          totalDistanceMiles,
          plan.race_config.expected_duration_hours,
          plan.race_config.distance_unit ?? 'mi',
        );
      }
      return next;
    });
  };

  const openFoodPicker = () => {
    setPendingWaystationFoods({
      waystationId: edited.id,
      foods: migrateWaystationFoods(edited.foods),
      committed: false,
    });
    router.push('/race/food-picker');
  };

  const removeFood = (foodId: string) => {
    setEdited((prev) =>
      prev
        ? { ...prev, foods: (prev.foods ?? []).filter((e) => e.foodId !== foodId) }
        : prev,
    );
  };

  const incrementQty = (foodId: string) => {
    setEdited((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        foods: (prev.foods ?? []).map((e) =>
          e.foodId === foodId ? { ...e, qty: e.qty + 1 } : e,
        ),
      };
    });
  };

  const decrementQty = (foodId: string) => {
    setEdited((prev) => {
      if (!prev) return prev;
      const next = (prev.foods ?? [])
        .map((e) => (e.foodId === foodId ? { ...e, qty: e.qty - 1 } : e))
        .filter((e) => e.qty > 0);
      return { ...prev, foods: next };
    });
  };

  const buildUpdatedConfig = (): RaceConfig => ({
    ...plan.race_config,
    waystations: (plan.race_config.waystations ?? [])
      .map((ws) => (ws.id === edited.id ? edited : ws))
      .sort(
        (a, b) =>
          (a.estimated_hour ?? a.marker_value ?? 0) -
          (b.estimated_hour ?? b.marker_value ?? 0),
      ),
  });

  const saveWithoutRepack = () => {
    const updatedConfig = buildUpdatedConfig();
    savePlan({ ...plan, race_config: updatedConfig });
    setShowRepackModal(false);
    router.back();
  };

  const saveWithRepack = () => {
    const updatedConfig = buildUpdatedConfig();
    const rebuilt = rebuildFromConfig(updatedConfig, plan);
    savePlan(rebuilt);
    if (!planId) setCurrentPlan(rebuilt);
    setShowRepackModal(false);
    router.back();
  };

  const handleSave = () => {
    if (!isDirty) {
      router.back();
      return;
    }
    if (hasTriggerChange(originalWaystation, edited)) {
      setShowRepackModal(true);
      return;
    }
    // Only notes/foods changed — save silently.
    saveWithoutRepack();
  };

  const storeFoods = useStore((s) => s.foods);
  const packedFoodEntries = useMemo(
    () =>
      migrateWaystationFoods(edited.foods)
        .map((e) => {
          const food = storeFoods.find((f) => f.id === e.foodId);
          return food ? { food, qty: e.qty } : null;
        })
        .filter((x): x is { food: FoodItem; qty: number } => x !== null),
    [edited.foods, storeFoods],
  );

  const foodCalories = packedFoodEntries.reduce((sum, { food, qty }) => sum + (food.calories ?? 0) * qty, 0);
  const displayedTotalCalories =
    edited.calories_consumed != null
      ? edited.calories_consumed
      : foodCalories > 0
        ? foodCalories
        : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header bar */}
        <View style={[styles.headerBar, { borderLeftColor: typeColor }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={[styles.typeLabel, { color: typeColor }]}>{typeLabel}</Text>
            <Text style={styles.timeLabel}>
              {edited.marker_type === 'mile'
                ? `${distLabel} ${edited.marker_value}${hour != null ? ` (~${hour}h)` : ''}`
                : `Hour ${hour}`}
            </Text>
          </View>
          {isDirty && (
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.body}>
          {/* Name (optional) */}
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Name (optional)</Text>
              <TextInput
                style={[styles.smallInput, { width: 160 }]}
                value={edited.name ?? ''}
                onChangeText={(val) => updateField('name', val.slice(0, 50) || undefined)}
                placeholder="e.g. Mile 42 Aid"
                placeholderTextColor={colors.textMuted}
                maxLength={50}
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Type pills */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Type</Text>
            <View style={styles.pillRow}>
              {TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, edited.type === opt.value && styles.pillActive]}
                  onPress={() => updateField('type', opt.value)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      edited.type === opt.value && styles.pillTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Position: marker_type + marker_value */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Position</Text>
            <View style={styles.markerRow}>
              <View style={styles.markerToggle}>
                {markerOptions.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.markerPill,
                      edited.marker_type === opt.value && styles.markerPillActive,
                    ]}
                    onPress={() => updateField('marker_type', opt.value)}
                  >
                    <Text
                      style={[
                        styles.markerPillText,
                        edited.marker_type === opt.value && styles.markerPillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={styles.markerInput}
                value={edited.marker_value ? edited.marker_value.toString() : ''}
                onChangeText={(val) => {
                  const num = parseFloat(val);
                  updateField('marker_value', isNaN(num) ? 0 : num);
                }}
                keyboardType="numeric"
                placeholder={edited.marker_type === 'hour' ? 'Hour' : distLabel}
                placeholderTextColor={colors.textMuted}
              />
              {edited.marker_type === 'mile' && edited.estimated_hour != null && (
                <Text style={styles.estimatedHour}>~{edited.estimated_hour}h</Text>
              )}
            </View>
          </View>

          {/* Calories consumed */}
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Calories consumed here</Text>
              <TextInput
                style={styles.smallInput}
                value={edited.calories_consumed != null ? edited.calories_consumed.toString() : ''}
                onChangeText={(val) => {
                  const num = parseInt(val, 10);
                  updateField('calories_consumed', isNaN(num) ? undefined : num);
                }}
                keyboardType="numeric"
                placeholder="Optional"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {displayedTotalCalories != null && (
              <Text style={styles.helperText}>Showing {displayedTotalCalories} kcal</Text>
            )}
          </View>

          {/* Pack volume (refill/both only) */}
          {(edited.type === 'pack_refill' || edited.type === 'both') && (
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Pack volume (L)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={
                    edited.pack_volume_ml != null
                      ? (edited.pack_volume_ml / 1000).toString()
                      : ''
                  }
                  onChangeText={(val) => {
                    const num = parseFloat(val);
                    updateField(
                      'pack_volume_ml',
                      isNaN(num) ? undefined : Math.round(num * 1000),
                    );
                  }}
                  keyboardType="decimal-pad"
                  placeholder="3.0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          )}

          {/* Notes */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={edited.notes ?? ''}
              onChangeText={(val) => updateField('notes', val)}
              placeholder="Optional notes"
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>

          {/* Packed foods */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Packed Foods</Text>
            {packedFoodEntries.length > 0 && (
              <View style={styles.foodChipRow}>
                {packedFoodEntries.map(({ food, qty }) => (
                  <View key={food.id} style={styles.foodChip}>
                    <Pressable onPress={() => decrementQty(food.id)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.foodChipText}>{food.name}{qty > 1 ? ` ×${qty}` : ''}</Text>
                    <Pressable onPress={() => incrementQty(food.id)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <Pressable style={styles.addFoodsButton} onPress={openFoodPicker}>
              <Text style={styles.addFoodsButtonText}>
                {packedFoodEntries.length > 0 ? 'Edit foods →' : 'Add foods →'}
              </Text>
            </Pressable>
            {packedFoodEntries.length > 0 && (
              <View style={styles.foodTotalRow}>
                <Text style={styles.foodTotalLabel}>Total</Text>
                <Text style={styles.foodTotalValue}>{foodCalories} cal</Text>
              </View>
            )}
          </View>

          {/* Save / Cancel footer */}
          {isDirty && (
            <View style={styles.footerActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setEdited(originalWaystation);
                }}
              >
                <Text style={styles.cancelBtnText}>Discard</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={handleSave}>
                <Text style={styles.primaryBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Re-pack warning modal */}
      <Modal
        visible={showRepackModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRepackModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRepackModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>This change affects your pack</Text>
            <Text style={styles.modalBody}>
              You edited a field (type, position, calories, or pack volume) that changes how
              your nutrition pack is built. Re-pack now to get a fresh plan, or keep your
              current pack and save the waystation change only.
            </Text>
            <Pressable style={styles.modalOption} onPress={saveWithRepack}>
              <Text style={styles.modalOptionTitle}>Re-pack & Save</Text>
              <Text style={styles.modalOptionSub}>Rebuild phases with the new values</Text>
            </Pressable>
            <Pressable style={styles.modalOption} onPress={saveWithoutRepack}>
              <Text style={styles.modalOptionTitle}>Save without re-pack</Text>
              <Text style={styles.modalOptionSub}>Keep the current pack as is</Text>
            </Pressable>
            <Pressable
              style={styles.modalCancelBtn}
              onPress={() => setShowRepackModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.sm,
  },
  backBtnText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  headerInfo: {
    flex: 1,
  },
  typeLabel: {
    ...typography.h3,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  saveBtnText: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
  body: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markerToggle: {
    flexDirection: 'row',
    gap: 2,
  },
  markerPill: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  markerPillActive: {
    backgroundColor: colors.primaryDark,
  },
  markerPillText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  markerPillTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  markerInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
  },
  estimatedHour: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  smallInput: {
    width: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  helperText: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  notesInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  foodChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  foodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  foodChipText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  qtyBtn: {
    paddingHorizontal: 4,
  },
  qtyBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  addFoodsButton: {
    alignSelf: 'flex-start',
  },
  addFoodsButtonText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  foodTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  foodTotalLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  foodTotalValue: {
    ...typography.captionBold,
    color: colors.calories,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelBtnText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  primaryBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  primaryBtnText: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalBody: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  modalOption: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalOptionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  modalOptionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCancelBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  modalCancelText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  errorState: {
    flex: 1,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
