import React, { useEffect } from 'react';
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
import { HeroTrail, EmptyPlans, ArrowIcon } from '@/components/illustrations';
import PantryCarousel from '@/components/home/PantryCarousel';
import type { PackPlan } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_WIDTH * (340 / 390);
const MAX_PREVIEW_ITEMS = 6;

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
  const weightUnit = useStore((s) => s.userPreferences.weightUnit);

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

          {/* "Add an adventure" button overlaid on hero bottom */}
          <View style={styles.chipOverlay} pointerEvents="box-none">
            <Pressable
              style={({ pressed }) => [
                styles.adventureButton,
                pressed && styles.adventureButtonPressed,
              ]}
              onPress={() => router.push({ pathname: '/race/setup', params: { mode: 'simple' } })}
            >
              <Text style={styles.adventureButtonText}>Add an adventure</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* My Plans Section */}
        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => router.push('/race/plans')}
            activeOpacity={0.6}
          >
            <Text style={styles.sectionTitle}>My Plans</Text>
            <ArrowIcon width={8} height={16} />
          </TouchableOpacity>
          <AnimatedPressable
            style={styles.plansAddButton}
            onPress={() => router.push({ pathname: '/race/setup', params: { mode: 'simple' } })}
          >
            <Text style={styles.plansAddButtonText}>+</Text>
          </AnimatedPressable>
        </View>

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
                  <ArrowIcon width={6} height={12} />
                </View>
              </AnimatedPressable>
            ))}
          </View>
        ) : (
          <AnimatedPressable
            style={styles.emptyCard}
            onPress={() => router.push({ pathname: '/race/setup', params: { mode: 'simple' } })}
          >
            <View style={styles.emptySvgFill}>
              <EmptyPlans width={SCREEN_WIDTH - spacing.lg * 2} height={200} />
              <View style={styles.emptyTitleOverlay}>
                <Text style={styles.emptyTitle}>No plans yet</Text>
              </View>
            </View>
            <View style={styles.emptyOverlay}>
              <Text style={styles.emptySubtitle}>Add an adventure</Text>
            </View>
          </AnimatedPressable>
        )}

        {/* My Pantry Section */}
        <PantryCarousel pantryFoodIds={pantryFoodIds} weightUnit={weightUnit} />
      </ScrollView>

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
  adventureButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(250, 247, 242, 0.75)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  adventureButtonPressed: {
    backgroundColor: 'rgba(250, 247, 242, 0.95)',
  },
  adventureButtonText: {
    ...typography.captionBold,
    color: colors.textSecondary,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  plansAddButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.pantryCardBorder,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plansAddButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.pantryCardBorder,
    includeFontPadding: false,
    textAlignVertical: 'center',
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

  // Empty state card
  emptyCard: {
    backgroundColor: '#EFE7D5',
    borderRadius: borderRadius.md,
    height: 200,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  emptySvgFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyTitleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },

});
