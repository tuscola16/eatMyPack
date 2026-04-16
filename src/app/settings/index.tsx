import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { FoodCategory } from '@/types/food';
import { RaceDistance } from '@/types/race';
import { TempUnit, WeightUnit, CaffeineSensitivity } from '@/types/preferences';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { CategoryToggleChip } from '@/components/common/CategoryToggleChip';
import { SettingsHeader } from '@/components/illustrations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_WIDTH * (140 / 390);

const ALL_CATEGORIES: FoodCategory[] = [
  'gel', 'bar', 'chew', 'drink_mix', 'real_food', 'nut_butter', 'freeze_dried',
];

const DISTANCES: { value: RaceDistance; label: string }[] = [
  { value: '50K', label: '50K' },
  { value: '50mi', label: '50 mi' },
  { value: '100K', label: '100K' },
  { value: '100mi', label: '100 mi' },
  { value: '200mi', label: '200 mi' },
  { value: 'custom', label: 'Custom' },
];

export default function SettingsScreen() {
  const savedPlans = useStore((s) => s.savedPlans);
  const user = useStore((s) => s.user);
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);
  const categoryPreferences = useStore((s) => s.categoryPreferences);
  const toggleExcludedCategory = useStore((s) => s.toggleExcludedCategory);
  const togglePreferredCategory = useStore((s) => s.togglePreferredCategory);
  const clearPantry = useStore((s) => s.clearPantry);
  const userPreferences = useStore((s) => s.userPreferences);
  const setUserPreferences = useStore((s) => s.setUserPreferences);
  const { signOut } = useAuth();
  const { fullSync, syncStatus } = useCloudSync();

  const handleClearPlans = () => {
    Alert.alert(
      'Clear All Saved Plans',
      'This will permanently delete all your saved plans. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            savedPlans.forEach((p) => useStore.getState().deletePlan(p.id));
            await AsyncStorage.removeItem('@eatmypack:saved_plans');
          },
        },
      ]
    );
  };

  const handleClearPantry = () => {
    Alert.alert(
      'Clear Pantry',
      'This will remove all foods from your pantry. Your saved plans are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearPantry,
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleDefaultDistanceSelect = () => {
    const options = [
      { text: 'None', onPress: () => setUserPreferences({ defaultDistance: null }) },
      ...DISTANCES.map((d) => ({
        text: d.label,
        onPress: () => setUserPreferences({ defaultDistance: d.value }),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ];
    Alert.alert('Default Distance', 'Choose your typical race distance', options);
  };

  const defaultDistanceLabel = userPreferences.defaultDistance
    ? DISTANCES.find((d) => d.value === userPreferences.defaultDistance)?.label ?? userPreferences.defaultDistance
    : 'None';

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration Header */}
        <View style={styles.headerContainer}>
          <SettingsHeader width={SCREEN_WIDTH} height={HEADER_HEIGHT} />
          <View style={styles.headerTitleOverlay}>
            <Text style={styles.screenTitle}>Settings</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Preferences Section — first per wireframe */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              {/* Default Distance */}
              <Pressable
                style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.7 }]}
                onPress={handleDefaultDistanceSelect}
              >
                <Text style={styles.prefRowLabel}>Default Distance</Text>
                <View style={styles.prefRowRight}>
                  <Text style={styles.prefRowValue}>{defaultDistanceLabel}</Text>
                  <Text style={styles.prefRowChevron}>›</Text>
                </View>
              </Pressable>

              <View style={styles.rowDivider} />

              {/* Temp Unit */}
              <View style={styles.prefRow}>
                <Text style={styles.prefRowLabel}>Temperature</Text>
                <View style={styles.segmentedControl}>
                  {(['F', 'C'] as TempUnit[]).map((unit) => (
                    <Pressable
                      key={unit}
                      style={[
                        styles.segmentOption,
                        userPreferences.tempUnit === unit && styles.segmentOptionActive,
                      ]}
                      onPress={() => setUserPreferences({ tempUnit: unit })}
                    >
                      <Text style={[
                        styles.segmentOptionText,
                        userPreferences.tempUnit === unit && styles.segmentOptionTextActive,
                      ]}>
                        °{unit}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Weight Unit */}
              <View style={styles.prefRow}>
                <Text style={styles.prefRowLabel}>Weight</Text>
                <View style={styles.segmentedControl}>
                  {(['oz', 'g'] as WeightUnit[]).map((unit) => (
                    <Pressable
                      key={unit}
                      style={[
                        styles.segmentOption,
                        userPreferences.weightUnit === unit && styles.segmentOptionActive,
                      ]}
                      onPress={() => setUserPreferences({ weightUnit: unit })}
                    >
                      <Text style={[
                        styles.segmentOptionText,
                        userPreferences.weightUnit === unit && styles.segmentOptionTextActive,
                      ]}>
                        {unit}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.rowDivider} />

              {/* Caffeine Sensitivity */}
              <View style={styles.prefRow}>
                <Text style={styles.prefRowLabel}>Caffeine</Text>
                <View style={styles.segmentedControl}>
                  {(['low', 'medium', 'high'] as CaffeineSensitivity[]).map((level) => (
                    <Pressable
                      key={level}
                      style={[
                        styles.segmentOption,
                        userPreferences.caffeineSensitivity === level && styles.segmentOptionActive,
                      ]}
                      onPress={() => setUserPreferences({ caffeineSensitivity: level })}
                    >
                      <Text style={[
                        styles.segmentOptionText,
                        userPreferences.caffeineSensitivity === level && styles.segmentOptionTextActive,
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.prefDivider} />

              {/* Category preferences */}
              <Text style={styles.prefLabel}>Never use</Text>
              <View style={styles.chipRow}>
                {ALL_CATEGORIES.map((cat) => (
                  <CategoryToggleChip
                    key={`exc-${cat}`}
                    category={cat}
                    active={categoryPreferences.excludedCategories.includes(cat)}
                    onToggle={() => toggleExcludedCategory(cat)}
                    activeColor={colors.error}
                  />
                ))}
              </View>

              <View style={styles.prefDivider} />

              <Text style={styles.prefLabel}>Prefer</Text>
              <View style={styles.chipRow}>
                {ALL_CATEGORIES.map((cat) => (
                  <CategoryToggleChip
                    key={`pref-${cat}`}
                    category={cat}
                    active={categoryPreferences.preferredCategories.includes(cat)}
                    onToggle={() => togglePreferredCategory(cat)}
                    activeColor={colors.primary}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Pantry Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pantry</Text>
            <View style={styles.card}>
              {/* My Foods row */}
              <Pressable
                style={({ pressed }) => [styles.pantryRow, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/settings/pantry')}
              >
                <Text style={styles.pantryLabel}>My Foods</Text>
                <View style={styles.pantryRight}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {pantryFoodIds.length} item{pantryFoodIds.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.pantryArrow}>›</Text>
                </View>
              </Pressable>

              <View style={styles.rowDivider} />

              {/* Import Foods row */}
              <Pressable
                style={({ pressed }) => [styles.pantryRow, pressed && { opacity: 0.7 }]}
                onPress={() => Alert.alert('Import Foods', 'Coming soon — import from a CSV or share link.')}
              >
                <Text style={styles.pantryLabel}>Import Foods</Text>
                <Text style={styles.pantryArrow}>›</Text>
              </Pressable>

              <View style={styles.rowDivider} />

              {/* Clear Pantry row */}
              <Pressable
                style={({ pressed }) => [styles.pantryRow, pressed && { opacity: 0.7 }]}
                onPress={handleClearPantry}
              >
                <Text style={styles.clearPantryLabel}>Clear Pantry</Text>
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={[styles.card, styles.aboutCard]}>
              <Text style={styles.appName}>eatMyPack</Text>
              <Text style={styles.versionText}>Version 1.0.0</Text>
              <Text style={styles.aboutText}>
                Plan your race nutrition down to each phase. Built for ultra trail runners.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.feedbackButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.feedbackButtonText}>Send Feedback</Text>
              </Pressable>
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <Pressable
              style={({ pressed }) => [
                styles.dangerButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleClearPlans}
            >
              <Text style={styles.dangerButtonText}>Clear All Saved Plans</Text>
            </Pressable>
          </View>

          {/* Account Section — kept functional but below wireframe sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {user ? (
              <View style={styles.card}>
                <View style={styles.accountInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(user.email?.[0] ?? '?').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.accountDetails}>
                    {user.displayName && (
                      <Text style={styles.accountName}>{user.displayName}</Text>
                    )}
                    <Text style={styles.accountEmail}>{user.email}</Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.syncButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={fullSync}
                  disabled={syncStatus === 'syncing'}
                >
                  {syncStatus === 'syncing' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.syncButtonText}>
                      {syncStatus === 'error' ? 'Sync Failed — Retry' : 'Sync Now'}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.guestText}>
                  Sign in to sync your plans across devices
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.signInButton,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={() => router.push('/auth/sign-in')}
                >
                  <Text style={styles.signInButtonText}>Sign In</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made for ultra trail runners</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Header
  headerContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    marginBottom: spacing.lg,
  },
  headerTitleOverlay: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
  },
  screenTitle: {
    ...typography.h1,
    color: colors.textInverse,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  body: {
    paddingHorizontal: spacing.lg,
  },

  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.sm,
  },

  // Row divider inside cards
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // Preference rows (unit toggles, distance)
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  prefRowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  prefRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  prefRowValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  prefRowChevron: {
    fontSize: 20,
    color: colors.textMuted,
    lineHeight: 24,
  },

  // Segmented control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    padding: 2,
    gap: 2,
  },
  segmentOption: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm - 2,
  },
  segmentOptionActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  segmentOptionTextActive: {
    color: colors.textPrimary,
  },

  // Category preferences
  prefLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  prefDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  // About card centered
  aboutCard: {
    alignItems: 'center',
  },
  appName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  aboutText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  feedbackButton: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  feedbackButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 13,
  },

  dangerButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.error,
    ...shadows.sm,
  },
  dangerButtonText: {
    ...typography.button,
    color: colors.error,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Account styles
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h4,
    color: colors.primary,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  accountEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  syncButton: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  syncButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  signOutButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  signOutButtonText: {
    ...typography.body,
    color: colors.textMuted,
  },
  guestText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  signInButtonText: {
    ...typography.button,
    color: colors.textInverse,
  },

  // Pantry rows
  pantryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  pantryLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  clearPantryLabel: {
    ...typography.body,
    color: colors.error,
  },
  pantryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countBadge: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  countBadgeText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  pantryArrow: {
    fontSize: 20,
    color: colors.textMuted,
    lineHeight: 24,
  },
});
