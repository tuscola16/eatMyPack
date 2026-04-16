import React, { useMemo, useState, useCallback } from 'react';
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
import EmptyFoods from '@/components/illustrations/EmptyFoods';
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

export default function PantryCarousel({ pantryFoodIds, weightUnit }: PantryCarouselProps) {
  const router = useRouter();
  const [activePage, setActivePage] = useState(0);

  const foods = useMemo(() => {
    return pantryFoodIds
      .slice(0, MAX_FOOD_ITEMS)
      .map((id) => FOODS.find((f) => f.id === id))
      .filter(Boolean) as FoodItem[];
  }, [pantryFoodIds]);

  const showSeeAll = pantryFoodIds.length > MAX_FOOD_ITEMS;
  const totalCards = foods.length + (showSeeAll ? 1 : 0);
  const totalPages = Math.ceil(totalCards / CARDS_PER_PAGE);

  const dotCount = totalCards <= 3 ? 0 : totalCards <= 6 ? 2 : 3;

  const pages = useMemo(() => {
    const result: (FoodItem | 'see_all')[][] = [];
    for (let i = 0; i < totalPages; i++) {
      const start = i * CARDS_PER_PAGE;
      const pageItems: (FoodItem | 'see_all')[] = foods.slice(start, start + CARDS_PER_PAGE);
      if (showSeeAll && i === totalPages - 1) {
        pageItems.push('see_all');
      }
      result.push(pageItems);
    }
    return result;
  }, [foods, totalPages, showSeeAll]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / PAGE_WIDTH);
      setActivePage(page);
    },
    [],
  );

  const isEmpty = foods.length === 0;

  return (
    <View>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => router.push('/settings/pantry')}
          activeOpacity={0.6}
        >
          <Text style={styles.sectionTitle}>My pantry</Text>
          <Text style={styles.sectionChevron}>{'>'}</Text>
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

      {/* Carousel or Empty State */}
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
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {pages.map((pageItems, pageIndex) => (
              <View key={pageIndex} style={styles.page}>
                {pageItems.map((item) =>
                  item === 'see_all' ? (
                    <AnimatedPressable
                      key="see_all"
                      style={styles.seeAllCard}
                      onPress={() => router.push('/settings/pantry')}
                    >
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
              </View>
            ))}
          </ScrollView>

          {/* Dot Indicators */}
          {dotCount > 0 && (
            <View style={styles.dotContainer}>
              {Array.from({ length: dotCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activePage ? styles.dotActive : styles.dotInactive,
                  ]}
                />
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
  sectionChevron: {
    fontSize: 22,
    color: colors.textMuted,
    lineHeight: 24,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.pantryBrown,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  // Carousel pages
  page: {
    width: PAGE_WIDTH,
    flexDirection: 'row',
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
