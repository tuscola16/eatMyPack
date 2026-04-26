import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { confirmDestructive } from '@/utils/confirm';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { usePackBuilder } from '@/hooks/usePackBuilder';
import { useStore } from '@/store/useStore';
import { HeroPlan } from '@/components/illustrations';
import PackSummary from '@/components/race/PackSummary';
import PhaseBanner from '@/components/race/PhaseBanner';
import PackItem from '@/components/race/PackItem';
import EmptyState from '@/components/common/EmptyState';
import type { PackPlan, Waystation } from '@/types';
import {
  sanitizeRaceTitle,
  RACE_TITLE_MAX_LENGTH,
  isValidRaceDate,
  isValidStartTime,
  formatRaceDateTime,
} from '@/utils/validation';
import { formatWallClockTime } from '@/utils/timeUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * (160 / 390);

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

function WaystationBar({
  waystation,
  distanceUnit,
  startTime,
  timeFormat,
  onPress,
}: {
  waystation: Waystation;
  distanceUnit?: 'km' | 'mi';
  startTime?: string;
  timeFormat?: '12h' | '24h';
  onPress?: () => void;
}) {
  const color = WS_TYPE_COLORS[waystation.type] ?? colors.primary;
  const hour = waystation.estimated_hour ?? waystation.marker_value;
  const label = WS_TYPE_LABELS[waystation.type] ?? waystation.type;
  const distLabel = distanceUnit === 'km' ? 'Km' : 'Mile';

  const timeLabel = (() => {
    if (waystation.marker_type === 'mile') {
      const approx = startTime
        ? formatWallClockTime(startTime, hour, timeFormat ?? '12h')
        : `~${hour}h`;
      return `${distLabel} ${waystation.marker_value} (${approx})`;
    }
    return startTime
      ? formatWallClockTime(startTime, hour, timeFormat ?? '12h')
      : `Hour ${hour}`;
  })();

  return (
    <Pressable
      accessibilityLabel={waystation.name ?? label}
      accessibilityRole="button"
      style={styles.waystationBar}
      onPress={onPress}
    >
      <View style={styles.waystationInfo}>
        <Text style={[styles.waystationLabel, { color }]}>{waystation.name ?? label}</Text>
        <Text style={styles.waystationTime}>{timeLabel}</Text>
      </View>
      {waystation.calories_consumed != null && waystation.calories_consumed > 0 && (
        <Text style={styles.waystationCals}>{waystation.calories_consumed} cal</Text>
      )}
      {waystation.notes ? (
        <Text style={styles.waystationNotes} numberOfLines={1}>{waystation.notes}</Text>
      ) : null}
      <Text style={styles.waystationChevron}>›</Text>
    </Pressable>
  );
}

export default function PackPlanScreen() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{ id?: string; source?: string }>();
  const { currentPlan, rejectItem, rejectFromPhase, adjustServings, togglePhaseLock } = usePackBuilder();
  const savedPlans = useStore((s) => s.savedPlans);
  const deletePlan = useStore((s) => s.deletePlan);
  const savePlan = useStore((s) => s.savePlan);
  const setCurrentPlan = useStore((s) => s.setCurrentPlan);
  const pinnedPhaseEntries = useStore((s) => s.pinnedPhaseEntries);
  const timeFormat = useStore((s) => s.userPreferences.timeFormat);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const plan: PackPlan | null | undefined = id
    ? savedPlans.find((p) => p.id === id) ?? null
    : currentPlan;

  const togglePhase = (index: number) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
    );
    setExpandedPhases((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDelete = () => {
    if (!plan || !id) return;
    confirmDestructive({
      title: 'Delete Plan',
      message: 'Are you sure you want to delete this plan?',
      confirmLabel: 'Delete',
      onConfirm: () => {
        deletePlan(id);
        source === 'plans' ? router.replace('/race/plans') : router.replace('/');
      },
    });
  };

  // Ensure the store's currentPlan matches the displayed plan before any pack operation.
  const ensurePlanIsCurrent = () => {
    if (!plan) return false;
    const storeCurrentPlan = useStore.getState().currentPlan;
    if (!storeCurrentPlan || storeCurrentPlan.id !== plan.id) {
      setCurrentPlan(plan);
    }
    return true;
  };

  const persistIfSaved = () => {
    if (!id) return;
    setTimeout(() => {
      const updatedPlan = useStore.getState().currentPlan;
      if (updatedPlan && plan && updatedPlan.id === plan.id) savePlan(updatedPlan);
    }, 0);
  };

  const handleRemoveFromPhase = (phaseIndex: number, foodId: string) => {
    if (!ensurePlanIsCurrent()) return;
    rejectFromPhase(phaseIndex, foodId);
    persistIfSaved();
  };

  const handleToggleLock = (foodId: string, phaseType: string, servings: number) => {
    togglePhaseLock(foodId, phaseType, servings);
  };

  const handleAdjustServings = (phaseIndex: number, foodId: string, delta: number) => {
    if (!ensurePlanIsCurrent()) return;
    adjustServings(phaseIndex, foodId, delta);
    persistIfSaved();
  };

  const handleEdit = () => {
    if (!plan) return;
    setShowEditModal(true);
  };

  const handleRegenerate = () => {
    setShowEditModal(false);
    if (!plan) return;
    router.push({
      pathname: '/race/setup',
      params: {
        mode: plan.race_config.setup_mode ?? 'simple',
        existingPlanId: plan.id,
        planName: plan.name ?? '',
      },
    });
  };

  const handleEditDetails = () => {
    setShowEditModal(false);
    if (!plan) return;
    setEditName(plan.name);
    setEditDate(plan.race_date ?? '');
    setEditStartTime(plan.start_time ?? '');
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    if (!plan || !id) return;
    const trimmedDate = editDate.trim();
    const trimmedTime = editStartTime.trim();
    if (trimmedDate && !isValidRaceDate(trimmedDate)) {
      setEditError('Date must be YYYY-MM-DD.');
      return;
    }
    if (trimmedTime && !isValidStartTime(trimmedTime)) {
      setEditError('Start time must be HH:MM (24-hour).');
      return;
    }
    savePlan({
      ...plan,
      name: editName.trim() || plan.name,
      race_date: trimmedDate || undefined,
      start_time: trimmedTime || undefined,
    });
    setEditError(null);
    setIsEditing(false);
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          title="No plan yet"
          subtitle="Head to race setup to generate your nutrition pack."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner with name overlay */}
        <View style={styles.heroContainer}>
          <View style={styles.heroSvgWrapper}>
            <HeroPlan width={SCREEN_WIDTH} height={HERO_HEIGHT} />
          </View>
          <View style={styles.heroScrim} pointerEvents="none" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {plan.name || plan.race_config.distance}
            </Text>
            {(plan.race_date || plan.start_time) && (
              <Text style={styles.heroSubtitle}>
                {formatRaceDateTime(plan.race_date, plan.start_time)}
              </Text>
            )}
          </View>
        </View>

        {/* Back + Edit + Delete header row */}
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => id
              ? (source === 'plans' ? router.replace('/race/plans') : router.replace('/'))
              : router.back()
            }
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>‹ Back</Text>
          </Pressable>
          <View style={styles.headerActions}>
            {id && (
              <Pressable
                accessibilityLabel="Edit plan"
                accessibilityRole="button"
                onPress={handleEdit}
                style={styles.headerBtn}
              >
                <Text style={styles.headerBtnText}>Edit</Text>
              </Pressable>
            )}
            {id && (
              <Pressable
                accessibilityLabel="Delete plan"
                accessibilityRole="button"
                onPress={handleDelete}
                style={styles.headerBtn}
              >
                <Text style={[styles.headerBtnText, { color: colors.error }]}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* Inline name editing */}
          {isEditing && (
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>Plan Name</Text>
              <TextInput
                accessibilityLabel="Plan name"
                style={styles.editInput}
                value={editName}
                onChangeText={(v) => setEditName(sanitizeRaceTitle(v))}
                placeholder="Plan name"
                placeholderTextColor={colors.textMuted}
                maxLength={RACE_TITLE_MAX_LENGTH}
                autoFocus
              />
              <Text style={styles.editLabel}>Race Date (YYYY-MM-DD)</Text>
              <TextInput
                accessibilityLabel="Race date"
                style={styles.editInput}
                value={editDate}
                onChangeText={setEditDate}
                placeholder="2026-04-20"
                placeholderTextColor={colors.textMuted}
                maxLength={10}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.editLabel}>Start Time (HH:MM, 24h)</Text>
              <TextInput
                accessibilityLabel="Start time"
                style={styles.editInput}
                value={editStartTime}
                onChangeText={setEditStartTime}
                placeholder="06:00"
                placeholderTextColor={colors.textMuted}
                maxLength={5}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {editError && <Text style={styles.editErrorText}>{editError}</Text>}
              <View style={styles.editActions}>
                <Pressable
                  accessibilityLabel="Cancel editing"
                  accessibilityRole="button"
                  style={styles.editCancelBtn}
                  onPress={() => {
                    setIsEditing(false);
                    setEditError(null);
                  }}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Save plan changes"
                  accessibilityRole="button"
                  style={styles.editSaveBtn}
                  onPress={handleSaveEdits}
                >
                  <Text style={styles.editSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Packing list chip */}
          {id && (
            <Pressable
              accessibilityLabel="View packing list"
              accessibilityRole="button"
              style={styles.packingListChip}
              onPress={() => router.push({ pathname: '/race/packing-list', params: { id } })}
            >
              <Text style={styles.packingListChipText}>View Packing List</Text>
            </Pressable>
          )}

          <PackSummary plan={plan} />

          {plan.phases?.map((packPhase, phaseIndex) => {
            const isExpanded = expandedPhases[phaseIndex] !== false;
            const waystationsInPhase = (plan.race_config.waystations ?? []).filter((ws) => {
              const wsHour = ws.estimated_hour ?? ws.marker_value;
              return wsHour >= packPhase.phase.start_hour && wsHour < packPhase.phase.end_hour;
            });
            return (
              <View key={phaseIndex} style={styles.phaseSection}>
                <PhaseBanner
                  phase={packPhase}
                  isExpanded={isExpanded}
                  onToggle={() => togglePhase(phaseIndex)}
                  startTime={plan.start_time}
                  timeFormat={timeFormat}
                />
                {isExpanded && (
                  <>
                    {packPhase.entries.map((entry, itemIndex) => {
                      const isLocked = pinnedPhaseEntries.some(
                        (p) => p.foodId === entry.food.id && p.phaseType === packPhase.phase.type,
                      );
                      return (
                        <PackItem
                          key={`${entry.food.id}-${itemIndex}`}
                          entry={entry}
                          phaseIndex={phaseIndex}
                          isLocked={isLocked}
                          onRemove={(foodId) => handleRemoveFromPhase(phaseIndex, foodId)}
                          onToggleLock={(foodId) =>
                            handleToggleLock(foodId, packPhase.phase.type, entry.servings)
                          }
                          onAdjustServings={(foodId, delta) =>
                            handleAdjustServings(phaseIndex, foodId, delta)
                          }
                          onPress={() => router.push({ pathname: '/database/[id]', params: { id: entry.food.id } })}
                        />
                      );
                    })}
                    {waystationsInPhase.map((ws) => (
                      <WaystationBar
                        key={ws.id}
                        waystation={ws}
                        distanceUnit={plan.race_config.distance_unit}
                        startTime={plan.start_time}
                        timeFormat={timeFormat}
                        onPress={() =>
                          router.push({
                            pathname: '/race/waystation-detail',
                            params: { wsId: ws.id, ...(id ? { planId: id } : {}) },
                          })
                        }
                      />
                    ))}
                  </>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit options modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable
          accessibilityLabel="Close edit menu"
          accessibilityRole="button"
          style={styles.modalOverlay}
          onPress={() => setShowEditModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Plan</Text>
            <Pressable
              accessibilityLabel="Re-generate pack plan"
              accessibilityRole="button"
              style={styles.modalOption}
              onPress={handleRegenerate}
            >
              <Text style={styles.modalOptionTitle}>Re-generate</Text>
              <Text style={styles.modalOptionSub}>Go back to setup with this config</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Edit plan details"
              accessibilityRole="button"
              style={styles.modalOption}
              onPress={handleEditDetails}
            >
              <Text style={styles.modalOptionTitle}>Edit Details</Text>
              <Text style={styles.modalOptionSub}>Change name, race date, or start time</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              style={styles.modalCancelBtn}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
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
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroSvgWrapper: {
    opacity: 0.55,
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.65,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textInverse,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.textInverse,
    opacity: 0.9,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerBtnText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  body: {
    padding: spacing.lg,
  },
  phaseSection: {
    marginTop: spacing.md,
  },
  packingListChip: {
    alignSelf: 'center',
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  packingListChipText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  editSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  editLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  editInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  editErrorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  editCancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  editCancelText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  editSaveBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  editSaveText: {
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
    maxWidth: 340,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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

  // Waystation bars
  waystationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9d3c7',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginHorizontal: -spacing.lg,
    gap: spacing.sm,
  },
  waystationInfo: {
    flex: 1,
  },
  waystationLabel: {
    ...typography.captionBold,
  },
  waystationTime: {
    ...typography.small,
    color: colors.textSecondary,
  },
  waystationCals: {
    ...typography.captionBold,
    color: colors.calories,
  },
  waystationNotes: {
    ...typography.small,
    color: colors.textMuted,
    maxWidth: 100,
  },
  waystationChevron: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
