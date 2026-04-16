import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AnimatedPressable from '@/components/common/AnimatedPressable';
import { EmptyFoods, ArrowIcon, PantryIcon } from '@/components/illustrations';
import PantryCard from './PantryCard';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { FOODS } from '@/data/foods';
import type { FoodItem } from '@/types/food';

interface PantryCarouselProps {
  pantryFoodIds: string[];
  weightUnit: 'oz' | 'g';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.lg;
const CARD_GAP = spacing.sm;
const CARDS_PER_PAGE = 3;
const MAX_FOOD_ITEMS = 8;
const CONTENT_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const CARD_WIDTH = Math.floor((CONTENT_WIDTH - CARD_GAP * (CARDS_PER_PAGE - 1)) / CARDS_PER_PAGE);
const PAGE_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = 270;

const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

export default function PantryCarousel({ pantryFoodIds, weightUnit }: PantryCarouselProps) {
  const router = useRouter();
  const [activeDot, setActiveDot] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const foods = useMemo(() => {
    return pantryFoodIds
      .slice(0, MAX_FOOD_ITEMS)
      .map((id) => FOODS.find((f) => f.id === id))
      .filter(Boolean) as FoodItem[];
  }, [pantryFoodIds]);

  const showSeeAll = pantryFoodIds.length > MAX_FOOD_ITEMS;
  const totalCards = foods.length + (showSeeAll ? 1 : 0);
  const dotCount = totalCards <= 3 ? 0 : totalCards <= 6 ? 2 : 3;

  const items: (FoodItem | 'see_all')[] = useMemo(() => {
    const result: (FoodItem | 'see_all')[] = [...foods];
    if (showSeeAll) result.push('see_all');
    return result;
  }, [foods, showSeeAll]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (dotCount === 0) return;
      const offsetX = event.nativeEvent.contentOffset.x;
      const cardIndex = Math.round(offsetX / SNAP_INTERVAL);
      const dot = Math.min(Math.floor(cardIndex / CARDS_PER_PAGE), dotCount - 1);
      setActiveDot(dot);
    },
    [dotCount],
  );

  const handleDotPress = useCallback(
    (dotIndex: number) => {
      const scrollX = dotIndex * CARDS_PER_PAGE * SNAP_INTERVAL;
      scrollRef.current?.scrollTo({ x: scrollX, animated: true });
    },
    [],
  );

  const isEmpty = foods.length === 0;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => router.push('/settings/pantry')}
          activeOpacity={0.6}
        >
          <Text style={styles.sectionTitle}>My pantry</Text>
          <ArrowIcon width={8} height={16} />
        </TouchableOpacity>

        {!isEmpty && (
          <AnimatedPressable
            style={styles.addButton}
            onPress={() => router.push('/database')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </AnimatedPressable>
        )}
      </View>

      {isEmpty ? (
        <AnimatedPressable
          style={styles.emptyCard}
          onPress={() => router.push('/database')}
        >
          <View style={styles.emptySvgFill}>
            <EmptyFoods width={CONTENT_WIDTH} height={200} />
          </View>
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyTitle}>Pantry is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add foods from the Foods tab to restrict your pack to what you own
            </Text>
          </View>
        </AnimatedPressable>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselContent}
          >
            {items.map((item) =>
              item === 'see_all' ? (
                <AnimatedPressable
                  key="see_all"
                  style={styles.seeAllCard}
                  onPress={() => router.push('/settings/pantry')}
                >
                  <PantryIcon width={32} height={32} />
                  <Text style={styles.seeAllText}>See all</Text>
                </AnimatedPressable>
              ) : (
                <PantryCard
                  key={item.id}
                  food={item}
                  cardWidth={CARD_WIDTH}
                  cardHeight={CARD_HEIGHT}
                  weightUnit={weightUnit}
                  onPress={() =>
                    router.push({ pathname: '/database/[id]', params: { id: item.id } })
                  }
                />
              ),
            )}
          </ScrollView>

          {dotCount > 0 && (
            <View style={styles.dotContainer}>
              {Array.from({ length: dotCount }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleDotPress(i)}
                  hitSlop={8}
                >
                  <View
                    style={[
                      styles.dot,
                      i === activeDot ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Section Header
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
  addButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.pantryCardBorder,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.pantryCardBorder,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 24,
  },

  // Carousel flat layout
  carouselContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },

  // See All card
  seeAllCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.pantryCardBg,
    borderWidth: 1,
    borderColor: colors.pantryCardBorder,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  seeAllText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },

  // Dot indicators
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.pantryCardBorder,
  },
  dotInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.pantryCardBorder,
  },

  // Empty state
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
  emptyOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
