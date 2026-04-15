import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useRouter, useLocalSearchParams, Stack, router } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import AnimatedPressable from '@/components/common/AnimatedPressable';
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
  const { currentPlan, rejectItem, resetPlan } = usePackBuilder();
  const savedPlans = useStore((s) => s.savedPlans);
  const savePlan = useStore((s) => s.savePlan);
  const user = useStore((s) => s.user);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [showSyncBanner, setShowSyncBanner] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [planName, setPlanName] = useState('');

  const plan: PackPlan | null | undefined = id
    ? savedPlans.find((p) => p.id === id) ?? null
    : currentPlan;

  const isViewingExisting = !!id;

  const togglePhase = (index: number) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
    );
    setExpandedPhases((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getDefaultPlanName = () => {
    if (!plan) return '';
    const dist = plan.race_config.distance;
    const hrs = plan.race_config.expected_duration_hours;
    return `${dist} ${hrs}h`;
  };

  const handleSave = () => {
    if (!plan) return;
    setPlanName(plan.name || getDefaultPlanName());
    setShowNameModal(true);
  };

  const doSave = (name: string) => {
    if (!plan) return;
    setShowNameModal(false);
    savePlan({ ...plan, name: name.trim() || getDefaultPlanName() });
    Alert.alert('Saved', 'Your pack plan has been saved.');
    if (!user) {
      setShowSyncBanner(true);
    }
  };

  const handleStartOver = () => {
    Alert.alert('Start Over', 'Are you sure? This will clear the current plan.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start Over',
        style: 'destructive',
        onPress: () => {
          resetPlan();
          router.back();
        },
      },
    ]);
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
          title: plan.race_config?.distance
            ? `${plan.race_config.distance} Plan`
            : 'Pack Plan',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroContainer}>
          <HeroPlan width={SCREEN_WIDTH} height={HERO_HEIGHT} />
        </View>

        <View style={styles.body}>
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
                      onReject={
                        !isViewingExisting
                          ? (foodId) => rejectItem(foodId)
                          : () => {}
                      }
                    />
                  ))}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sync prompt for guest users */}
      {showSyncBanner && !user && (
        <Pressable
          style={styles.syncBanner}
          onPress={() => {
            setShowSyncBanner(false);
            router.push('/auth/sign-in');
          }}
        >
          <Text style={styles.syncBannerText}>
            Sign in to back up your plans to the cloud
          </Text>
          <Text style={styles.syncBannerArrow}>›</Text>
        </Pressable>
      )}

      {/* Floating action buttons */}
      {!isViewingExisting && (
        <View style={styles.fabRow}>
          <AnimatedPressable
            style={[styles.fab, styles.fabSecondary]}
            onPress={handleStartOver}
          >
            <Text style={styles.fabSecondaryText}>Start Over</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.fab, styles.fabPrimary]}
            onPress={handleSave}
          >
            <Text style={styles.fabPrimaryText}>Save Plan</Text>
          </AnimatedPressable>
        </View>
      )}

      {/* Plan naming modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Name Your Plan</Text>
            <TextInput
              style={styles.modalInput}
              value={planName}
              onChangeText={setPlanName}
              placeholder="e.g. Western States 100"
              placeholderTextColor={colors.textMuted}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  styles.modalBtnSecondary,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => doSave(getDefaultPlanName())}
              >
                <Text style={styles.modalBtnSecondaryText}>Skip</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  styles.modalBtnPrimary,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
                onPress={() => doSave(planName)}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    paddingBottom: 100,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  body: {
    padding: spacing.lg,
  },
  phaseSection: {
    marginTop: spacing.md,
  },
  fabRow: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  fab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  fabPrimary: {
    backgroundColor: colors.primary,
  },
  fabPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },
  fabSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  fabSecondaryText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  syncBanner: {
    position: 'absolute',
    bottom: 90,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncBannerText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '500',
    flex: 1,
  },
  syncBannerArrow: {
    fontSize: 20,
    color: colors.primary,
    marginLeft: spacing.sm,
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
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary,
  },
  modalBtnPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },
  modalBtnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modalBtnSecondaryText: {
    ...typography.button,
    color: colors.textSecondary,
  },
});
