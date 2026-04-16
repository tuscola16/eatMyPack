import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { FoodItem } from '@/types/food';
import {
  formatGutRating,
  getGutRatingColor,
  getCategoryColor,
} from '@/utils/formatters';
import Badge from '@/components/common/Badge';
import CategoryIcon from '@/components/illustrations/CategoryIcon';
import PantryIcon from '@/components/illustrations/PantryIcon';

interface FoodCardProps {
  food: FoodItem;
  onPress?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  isInPantry?: boolean;
  onTogglePantry?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, onPress, isPinned, onTogglePin, isInPantry, onTogglePantry }) => {
  const gutColor = getGutRatingColor(food.gut_friendliness);
  const categoryColor = getCategoryColor(food.category);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isPinned && styles.cardPinned,
        isInPantry && !isPinned && styles.cardPantry,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Top Row: Info left, badges right */}
      <View style={styles.topRow}>
        <View style={styles.infoSection}>
          <View style={styles.categoryIcon}>
            <CategoryIcon category={food.category} size={22} />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {food.name}
            </Text>
            <Text style={styles.brand} numberOfLines={1}>
              {food.brand}
            </Text>
          </View>
        </View>

        <View style={styles.badgeSection}>
          <Badge
            label={`${food.calories} cal`}
            color={colors.calories}
          />
          <Badge
            label={`${food.carbs_g}g`}
            color={colors.carbs}
          />
        </View>
      </View>

      {/* Bottom Row: gut rating, caffeine, category, pin */}
      <View style={styles.bottomRow}>
        <View style={styles.chipRow}>
          <Badge
            label={formatGutRating(food.gut_friendliness)}
            color={gutColor}
            size="small"
          />
          {food.is_caffeinated && (
            <Badge
              label={`${food.caffeine_mg}mg caffeine`}
              color={colors.warning}
              size="small"
              variant="outline"
            />
          )}
          <Badge
            label={food.category.replace('_', ' ')}
            color={categoryColor}
            size="small"
            variant="outline"
          />
        </View>

        <View style={styles.pinArea}>
          {onTogglePantry && (
            <Pressable
              style={styles.pinButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onTogglePantry();
              }}
              hitSlop={8}
              accessibilityLabel={isInPantry ? 'Remove from pantry' : 'Add to pantry'}
              accessibilityRole="button"
            >
              <View style={{ opacity: isInPantry ? 1 : 0.3 }}>
                <PantryIcon width={20} height={20} />
              </View>
            </Pressable>
          )}
          {isPinned && <Text style={styles.pinIndicator}>&#x2713;</Text>}
          {onTogglePin && (
            <Pressable
              style={styles.pinButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onTogglePin();
              }}
              hitSlop={8}
            >
              <Text style={[styles.pinIcon, isPinned && styles.pinIconActive]}>
                {isPinned ? '\u{1F4CC}' : '\u{1F4CC}'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    ...shadows.sm,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardPinned: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardPantry: {
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryIcon: {
    marginRight: spacing.sm,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  brand: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badgeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    flexWrap: 'wrap',
  },
  pinArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  pinIndicator: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  pinButton: {
    padding: 4,
  },
  pinIcon: {
    fontSize: 16,
    opacity: 0.4,
  },
  pinIconActive: {
    opacity: 1,
  },
  pantryIcon: {
    fontSize: 16,
    opacity: 0.4,
    marginRight: 4,
  },
  pantryIconActive: {
    opacity: 1,
  },
});

export default FoodCard;
