import React, { useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { FoodCategory, CATEGORY_LABELS } from '@/types/food';
import CategoryIcon from '@/components/illustrations/CategoryIcon';
import { getCategoryColor } from '@/utils/formatters';
import { useStore } from '@/store/useStore';

const CATEGORIES: FoodCategory[] = [
  'gel',
  'bar',
  'chew',
  'drink_mix',
  'real_food',
  'nut_butter',
  'freeze_dried',
];

const GUT_OPTIONS = [
  { label: 'All', value: null },
  { label: 'Good+', value: 'good' },
  { label: 'Very Good+', value: 'very_good' },
  { label: 'Excellent', value: 'excellent' },
] as const;

const FoodFilterBar: React.FC = () => {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories && filters.categories.length > 0) count += filters.categories.length;
    if (filters.minGutRating) count++;
    if (filters.hasCaffeine !== null && filters.hasCaffeine !== undefined) count++;
    if (filters.minCalPerOz) count++;
    return count;
  }, [filters]);

  const toggleCategory = (cat: FoodCategory) => {
    const current = filters.categories ?? [];
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setFilters({ categories: next });
  };

  const isCategoryActive = (cat: FoodCategory) =>
    (filters.categories ?? []).includes(cat);

  const setGutRating = (value: typeof GUT_OPTIONS[number]['value']) => {
    setFilters({ minGutRating: value as any });
  };

  const toggleCaffeine = () => {
    const next =
      filters.hasCaffeine === true
        ? null
        : filters.hasCaffeine === false
          ? null
          : true;
    setFilters({ hasCaffeine: next });
  };

  return (
    <View style={styles.container}>
      {/* Row 1: Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={colors.textMuted}
            value={filters.search ?? ''}
            onChangeText={(text) => setFilters({ search: text })}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {activeFilterCount > 0 && (
          <Pressable style={styles.clearButton} onPress={resetFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Row 2: Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScrollContent}
        style={styles.chipScroll}
      >
        {CATEGORIES.map((cat) => {
          const active = isCategoryActive(cat);
          const catColor = getCategoryColor(cat);
          return (
            <Pressable
              key={cat}
              style={[
                styles.categoryChip,
                active && { backgroundColor: catColor + '22', borderColor: catColor },
              ]}
              onPress={() => toggleCategory(cat)}
            >
              <CategoryIcon category={cat} size={14} />
              <Text
                style={[
                  styles.chipLabel,
                  active && { color: catColor, fontWeight: '600' },
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Row 3: Gut rating + caffeine toggle (all in one scrollable row) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gutChipsContent}
        style={styles.extraFiltersRow}
      >
        {GUT_OPTIONS.map((opt) => {
          const active =
            opt.value === null
              ? !filters.minGutRating
              : filters.minGutRating === opt.value;
          return (
            <Pressable
              key={opt.label}
              style={[styles.gutChip, active && styles.gutChipActive]}
              onPress={() => setGutRating(opt.value)}
            >
              <Text style={[styles.gutChipText, active && styles.gutChipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            styles.caffeineToggle,
            filters.hasCaffeine === true && styles.caffeineToggleActive,
          ]}
          onPress={toggleCaffeine}
        >
          <Text style={styles.caffeineIcon}>⚡</Text>
          <Text
            style={[
              styles.caffeineText,
              filters.hasCaffeine === true && styles.caffeineTextActive,
            ]}
          >
            Caffeine
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.accentSubtle,
    borderRadius: borderRadius.full,
  },
  clearButtonText: {
    ...typography.caption,
    color: colors.accent,
    marginRight: 4,
    fontWeight: '600',
  },
  filterCountBadge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountText: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  chipScroll: {
    marginBottom: spacing.sm,
  },
  chipScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  extraFiltersRow: {
    paddingHorizontal: spacing.md,
  },
  gutChipsContent: {
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  gutChip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
  },
  gutChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  gutChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gutChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  caffeineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  caffeineToggleActive: {
    backgroundColor: colors.warning + '22',
    borderColor: colors.warning,
  },
  caffeineIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  caffeineText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  caffeineTextActive: {
    color: colors.warning,
    fontWeight: '600',
  },
});

export default FoodFilterBar;
