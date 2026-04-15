import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ListRenderItemInfo } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing } from '@/theme';
import { FoodItem } from '@/types/food';
import FoodCard from './FoodCard';
import EmptyFoods from '@/components/illustrations/EmptyFoods';

const ITEM_HEIGHT = 110;
const ITEM_MARGIN = 4;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN * 2;

// Only animate the first screen-worth of items to avoid stutter on scroll
const MAX_ANIMATED_INDEX = 12;

interface FoodListProps {
  foods: FoodItem[];
  onPressFood?: (food: FoodItem) => void;
  pinnedIds?: string[];
  onTogglePin?: (id: string) => void;
  pantryIds?: string[];
  onTogglePantry?: (id: string) => void;
  emptyMessage?: string;
}

const FoodList: React.FC<FoodListProps> = ({
  foods,
  onPressFood,
  pinnedIds = [],
  onTogglePin,
  pantryIds = [],
  onTogglePantry,
  emptyMessage = 'No foods found. Try adjusting your filters.',
}) => {
  const pinnedSet = new Set(pinnedIds);
  const pantrySet = new Set(pantryIds);

  const keyExtractor = useCallback((item: FoodItem) => item.id, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: TOTAL_ITEM_HEIGHT,
      offset: TOTAL_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<FoodItem>) => {
      const card = (
        <FoodCard
          food={item}
          onPress={onPressFood ? () => onPressFood(item) : undefined}
          isPinned={pinnedSet.has(item.id)}
          onTogglePin={onTogglePin ? () => onTogglePin(item.id) : undefined}
          isInPantry={pantrySet.has(item.id)}
          onTogglePantry={onTogglePantry ? () => onTogglePantry(item.id) : undefined}
        />
      );

      // Only animate initial visible items; items scrolled into view appear instantly
      if (index < MAX_ANIMATED_INDEX) {
        return (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            {card}
          </Animated.View>
        );
      }
      return card;
    },
    [onPressFood, pinnedSet, onTogglePin, pantrySet, onTogglePantry],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <EmptyFoods width={180} height={180} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    ),
    [emptyMessage],
  );

  return (
    <FlatList
      data={foods}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={foods.length === 0 ? styles.emptyList : styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: spacing.sm,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.md,
  },
});

export default FoodList;
