import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  Modal,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

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
import type { PackPlan } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * (160 / 390);

export default function PackPlanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { currentPlan, rejectItem } = usePackBuilder();
  const savedPlans = useStore((s) => s.savedPlans);
  const deletePlan = useStore((s) => s.deletePlan);
  const savePlan = useStore((s) => s.savePlan);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

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
    Alert.alert('Delete Plan', 'Are you sure you want to delete this plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePlan(id);
          router.back();
        },
      },
    ]);
  };

  const handleRejectItem = (foodId: string) => {
    rejectItem(foodId);
    // Auto-save after rejection
    if (plan && id) {
      // rejectItem updates currentPlan in the hook; we need to save the updated version
      // The store will be updated by rejectItem, so we defer the save
      setTimeout(() => {
        const updatedPlan = useStore.getState().currentPlan;
        if (updatedPlan) savePlan(updatedPlan);
      }, 0);
    }
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
      params: { mode: plan.race_config.setup_mode ?? 'simple' },
    });
  };

  const handleEditDetails = () => {
    setShowEditModal(false);
    if (!plan) return;
    setEditName(plan.name);
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    if (!plan || !id) return;
    savePlan({ ...plan, name: editName.trim() || plan.name });
    setIsEditing(false);
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Pack Plan',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
            headerShadowVisible: false,
          }}
        />
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
          <HeroPlan width={SCREEN_WIDTH} height={HERO_HEIGHT} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {plan.name || plan.race_config.distance}
            </Text>
          </View>
        </View>

        {/* Back + Edit + Delete header row */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>‹ Back</Text>
          </Pressable>
          <View style={styles.headerActions}>
            {id && (
              <Pressable onPress={handleEdit} style={styles.headerBtn}>
                <Text style={styles.headerBtnText}>Edit</Text>
              </Pressable>
            )}
            {id && (
              <Pressable onPress={handleDelete} style={styles.headerBtn}>
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
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Plan name"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={styles.editActions}>
                <Pressable
                  style={styles.editCancelBtn}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
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
              style={styles.packingListChip}
              onPress={() => router.push({ pathname: '/race/packing-list', params: { id } })}
            >
              <Text style={styles.packingListChipText}>View Packing List</Text>
            </Pressable>
          )}

          <PackSummary plan={plan} />

          {plan.phases?.map((packPhase, phaseIndex) => {
            const isExpanded = expandedPhases[phaseIndex] !== false;
            return (
              <View key={phaseIndex} style={styles.phaseSection}>
                <PhaseBanner
                  phase={packPhase}
                  isExpanded={isExpanded}
                  onToggle={() => togglePhase(phaseIndex)}
                />
                {isExpanded &&
                  packPhase.entries.map((entry, itemIndex) => (
                    <PackItem
                      key={`${entry.food.id}-${itemIndex}`}
                      entry={entry}
                      onReject={(foodId) => handleRejectItem(foodId)}
                      onPress={() => router.push({ pathname: '/database/[id]', params: { id: entry.food.id } })}
                    />
                  ))}
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
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Plan</Text>
            <Pressable
              style={styles.modalOption}
              onPress={handleRegenerate}
            >
              <Text style={styles.modalOptionTitle}>Re-generate</Text>
              <Text style={styles.modalOptionSub}>Go back to setup with this config</Text>
            </Pressable>
            <Pressable
              style={styles.modalOption}
              onPress={handleEditDetails}
            >
              <Text style={styles.modalOptionTitle}>Edit Details</Text>
              <Text style={styles.modalOptionSub}>Change the plan name</Text>
            </Pressable>
            <Pressable
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
    ...typography.h2,
    color: colors.textInverse,
    textShadowColor: 'rgba(0,0,0,0.5)',
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
    color: colors.primary,
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
    color: colors.primary,
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
    backgroundColor: colors.primary,
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
});
