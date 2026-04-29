import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { FoodItem } from '@/types/food';
import CategoryIcon from '@/components/illustrations/CategoryIcon';
import {
  formatGutRating,
  getGutRatingColor,
  formatCalDensity,
  getCalDensityColor,
  formatWeight,
  formatWeightOz,
} from '@/utils/formatters';
import Badge from '@/components/common/Badge';
import { useStore } from '@/store/useStore';

interface FoodDetailProps {
  food: FoodItem;
}

const MACRO_COLORS = {
  carbs: '#BC6039',
  protein: '#E4A53B',
  fat: '#AE7976',
};

const FoodDetail: React.FC<FoodDetailProps> = ({ food }) => {
  const weightUnit = useStore((s) => s.userPreferences.weightUnit);
  const gutColor = getGutRatingColor(food.gut_friendliness);
  const densityColor = getCalDensityColor(food.cal_per_oz);
  const densityLabel = formatCalDensity(food.cal_per_oz);
  const totalMacroG = food.carbs_g + food.protein_g + food.fat_g;
  const carbsPct = totalMacroG > 0 ? (food.carbs_g / totalMacroG) * 100 : 0;
  const proteinPct = totalMacroG > 0 ? (food.protein_g / totalMacroG) * 100 : 0;
  const fatPct = totalMacroG > 0 ? (food.fat_g / totalMacroG) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <CategoryIcon category={food.category} size={56} />
        </View>
        <Text style={styles.heroName}>{food.name}</Text>
        <Text style={styles.heroBrand}>{food.brand}</Text>
      </View>

      {/* Calories Section */}
      <View style={styles.caloriesSection}>
        <View style={styles.caloriePrimary}>
          <Text style={styles.calorieValue}>{food.calories}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>
        <View style={styles.calorieDensity}>
          <Badge
            label={`${Math.round(food.cal_per_oz)} cal/oz`}
            color={densityColor}
          />
          <Text style={[styles.densityLabel, { color: densityColor }]}>
            {densityLabel}
          </Text>
        </View>
      </View>

      {/* Macro Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macronutrient Breakdown</Text>

        {/* Proportional bar */}
        <View style={styles.macroBar}>
          {carbsPct > 0 && (
            <View
              style={[
                styles.macroBarSegment,
                {
                  backgroundColor: MACRO_COLORS.carbs,
                  flex: carbsPct,
                  borderTopLeftRadius: borderRadius.sm,
                  borderBottomLeftRadius: borderRadius.sm,
                },
              ]}
            />
          )}
          {proteinPct > 0 && (
            <View
              style={[
                styles.macroBarSegment,
                { backgroundColor: MACRO_COLORS.protein, flex: proteinPct },
              ]}
            />
          )}
          {fatPct > 0 && (
            <View
              style={[
                styles.macroBarSegment,
                {
                  backgroundColor: MACRO_COLORS.fat,
                  flex: fatPct,
                  borderTopRightRadius: borderRadius.sm,
                  borderBottomRightRadius: borderRadius.sm,
                },
              ]}
            />
          )}
        </View>

        {/* Macro details */}
        <View style={styles.macroDetails}>
          <MacroRow
            label="Carbs"
            value={`${food.carbs_g}g`}
            pct={Math.round(carbsPct)}
            color={MACRO_COLORS.carbs}
          />
          <MacroRow
            label="Protein"
            value={`${food.protein_g}g`}
            pct={Math.round(proteinPct)}
            color={MACRO_COLORS.protein}
          />
          <MacroRow
            label="Fat"
            value={`${food.fat_g}g`}
            pct={Math.round(fatPct)}
            color={MACRO_COLORS.fat}
          />
        </View>
      </View>

      {/* Individual Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.statsGrid}>
          {weightUnit === 'g' ? (
            <StatItem label="Serving" value={formatWeight(food.serving_size_g)} />
          ) : (
            <StatItem label="Serving" value={food.serving_size_oz.toFixed(1) + ' oz'} />
          )}
          <StatItem label="Sodium" value={`${food.sodium_mg}mg`} />
          <StatItem
            label="Caffeine"
            value={food.is_caffeinated ? `${food.caffeine_mg}mg` : 'None'}
          />
          {weightUnit === 'g' ? (
            <StatItem label="Cal/g" value={`${food.cal_per_g.toFixed(1)}`} />
          ) : (
            <StatItem label="Cal/oz" value={`${food.cal_per_oz.toFixed(1)}`} />
          )}
        </View>
      </View>

      {/* Gut Friendliness */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gut Friendliness</Text>
        <View style={styles.gutRow}>
          <Badge
            label={formatGutRating(food.gut_friendliness)}
            color={gutColor}
            
          />
          <Text style={styles.gutExplanation}>
            {getGutExplanation(food.gut_friendliness)}
          </Text>
        </View>
      </View>

      {/* Best For */}
      {food.best_for.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best For</Text>
          <View style={styles.bestForRow}>
            {food.best_for.map((phase) => (
              <Badge
                key={phase}
                label={phase.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                color={colors.primaryDark}
                variant="outline"
              />
            ))}
          </View>
        </View>
      )}

      {/* Label Accuracy Warning */}
      {food.label_accuracy_note && (
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>&#x26A0;&#xFE0F;</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Label Accuracy Note</Text>
            <Text style={styles.warningText}>{food.label_accuracy_note}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// --- Helper Components ---

const MacroRow: React.FC<{
  label: string;
  value: string;
  pct: number;
  color: string;
}> = ({ label, value, pct, color }) => (
  <View style={styles.macroRow}>
    <View style={[styles.macroDot, { backgroundColor: color }]} />
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}</Text>
    <Text style={styles.macroPct}>{pct}%</Text>
  </View>
);

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

function getGutExplanation(rating: string): string {
  switch (rating) {
    case 'excellent':
      return 'Very easy on the stomach, even at high intensities.';
    case 'very_good':
      return 'Well tolerated by most runners in most conditions.';
    case 'good':
      return 'Generally well tolerated. Test during training first.';
    case 'moderate':
      return 'May cause issues for some. Practice in training.';
    case 'poor':
      return 'Likely to cause GI distress. Use with caution.';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroIcon: {
    marginBottom: spacing.sm,
  },
  heroName: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroBrand: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  caloriesSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  caloriePrimary: {
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  calorieLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  calorieDensity: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  densityLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  macroBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  macroBarSegment: {
    height: '100%',
  },
  macroDetails: {
    gap: spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  macroLabel: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  macroValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  macroPct: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gutExplanation: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  bestForRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 183, 77, 0.12)',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...typography.body,
    color: '#FFB74D',
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    ...typography.caption,
    color: '#FFB74D',
    lineHeight: 18,
  },
});

export default FoodDetail;
