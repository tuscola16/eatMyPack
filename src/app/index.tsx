import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from './onboarding';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import { useStore } from '@/store/useStore';
import { FOODS } from '@/data/foods';
import { CATEGORY_ICONS } from '@/types/food';
import HeroTrail from '@/components/illustrations/HeroTrail';
import EmptyPlans from '@/components/illustrations/EmptyPlans';
import type { PackPlan } from '@/types';
import type { FoodItem } from '@/types/food';
import type { RaceDistance } from '@/types/race';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * (340 / 390);
const MAX_PREVIEW_ITEMS = 6;

const DISTANCE_CHIPS: { value: RaceDistance; label: string }[] = [
  { value: '50K', label: '50K' },
  { value: '50mi', label: '50mi' },
  { value: '100K', label: '100K' },
  { value: '100mi', label: '100mi' },
  { value: '200mi', label: '200mi' },
];

function getPlanDisplayName(plan: PackPlan): string {
  if (plan.name) return plan.name;
  const dist = plan.race_config.distance === 'custom'
    ? `${plan.race_config.custom_distance_km ?? '?'}km`
    : plan.race_config.distance;
  return `${dist} ${plan.race_config.expected_duration_hours}h`;
}

function gramsToOz(g: number): number {
  return Math.round(g / 28.35);
}

export default function HomeScreen() {
  const router = useRouter();
  const savedPlans = useStore((s) => s.savedPlans);
  const pantryFoodIds = useStore((s) => s.pantryFoodIds);

  // First-launch: show onboarding if never seen
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((seen) => {
      if (!seen) router.replace('/onboarding');
    });
  }, []);

  // Hero fade-in on screen mount
  const heroOpacity = useSharedValue(0);
  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, []);
  const heroAnimStyle = useAnimatedStyle(() => ({ opacity: heroOpacity.value }));

  const pantryFoods = useMemo(() => {
    return pantryFoodIds
      .slice(0, MAX_PREVIEW_ITEMS)
      .map((id) => FOODS.find((f) => f.id === id))
      .filter(Boolean) as FoodItem[];
  }, [pantryFoodIds]);

  const handleQuickStart = (distance: RaceDistance) => {
    router.push({ pathname: '/race/setup', params: { mode: 'wizard', distance } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Illustration — full bleed, fades in on mount */}
        <Animated.View style={[styles.heroContainer, heroAnimStyle]}>
          <HeroTrail width={SCREEN_WIDTH} height={HERO_HEIGHT} />

          {/* Distance chips overlaid on hero bottom */}
          <View style={styles.chipOverlay} pointerEvents="box-none">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {DISTANCE_CHIPS.map((d) => (
                <Pressable
                  key={d.value}
                  style={({ pressed }) => [
                    styles.distanceChip,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => handleQuickStart(d.value)}
                >
                  <Text style={styles.distanceChipText}>{d.label}</Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.distanceChipCustom}
                onPress={() => router.push({ pathname: '/race/setup', params: { mode: 'wizard' } })}
              >
                <Text style={styles.distanceChipText}>+</Text>
              </Pressable>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Your Plans Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => router.push('/race/plans')}
          activeOpacity={0.6}
        >
          <Text style={styles.sectionTitle}>Your Plans</Text>
          <Text style={styles.sectionChevron}>›</Text>
        </TouchableOpacity>

        {savedPlans.length > 0 ? (
          <View style={styles.planList}>
            {savedPlans.slice(0, MAX_PREVIEW_ITEMS).map((plan) => (
              <AnimatedPressable
                key={plan.id}
                style={styles.planCard}
                onPress={() => router.push({ pathname: '/race/plan', params: { id: plan.id } })}
              >
                <View style={styles.planCardLeft}>
                  <Text style={styles.planCardName} numberOfLines={1}>
                    {getPlanDisplayName(plan)}
                  </Text>
                  <Text style={styles.planCardDuration}>
                    {plan.race_config.expected_duration_hours}h
                  </Text>
                </View>
                <View style={styles.planCardRight}>
                  <Text style={styles.planCardCal}>
                    {plan.total_calories.toLocaleString()} cal
                  </Text>
                  <Text style={styles.planCardWeight}>
                    {gramsToOz(plan.total_weight_g)} oz
                  </Text>
                  <Text style={styles.planCardChevron}>›</Text>
                </View>
              </AnimatedPressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <EmptyPlans width={240} height={240} />
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap a distance chip above or use + New Plan to build your first pack
            </Text>
          </View>
        )}

        {/* My Pantry Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => router.push('/settings/pantry')}
          activeOpacity={0.6}
        >
          <Text style={styles.sectionTitle}>My Pantry</Text>
          <Text style={styles.sectionChevron}>›</Text>
        </TouchableOpacity>

        {pantryFoods.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pantryScroll}
          >
            {pantryFoods.map((food) => (
              <View key={food.id} style={styles.pantryCard}>
                <Text style={styles.pantryIcon}>
                  {CATEGORY_ICONS[food.category] ?? '🍽️'}
                </Text>
                <Text style={styles.pantryName} numberOfLines={1}>
                  {food.name}
                </Text>
                <Text style={styles.pantryCal}>{food.calories} cal</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Pantry is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add foods from the Foods tab to restrict your pack to what you own
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <AnimatedPressable
        style={styles.fab}
        onPress={() => router.push({ pathname: '/race/setup', params: { mode: 'wizard' } })}
      >
        <Text style={styles.fabText}>+ New Plan</Text>
      </AnimatedPressable>
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
    paddingBottom: spacing.xxxl + spacing.xl,
  },

  // Hero
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    marginBottom: spacing.lg,
  },
  chipOverlay: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
  },
  chipRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  distanceChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  distanceChipCustom: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  chipPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  distanceChipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionChevron: {
    fontSize: 22,
    color: colors.textMuted,
    lineHeight: 24,
  },

  // Plan list — individual cards
  planList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  planCardLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  planCardName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  planCardDuration: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  planCardRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.xs,
  },
  planCardCal: {
    ...typography.captionBold,
    color: colors.calories,
  },
  planCardWeight: {
    ...typography.caption,
    color: colors.textMuted,
  },
  planCardChevron: {
    fontSize: 18,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // Pantry — horizontal cards
  pantryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pantryCard: {
    width: 80,
    height: 96,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  pantryIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  pantryName: {
    ...typography.small,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  pantryCal: {
    ...typography.small,
    color: colors.textSecondary,
  },

  // Empty state card
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  fabText: {
    ...typography.button,
    color: colors.textInverse,
  },
});
