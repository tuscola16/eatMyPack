import { GutRating, FoodCategory } from '../types/food';
import { colors } from '../theme/colors';

export function formatCalPerHour(cal: number): string {
  return `${Math.round(cal)} cal/hr`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`;
  }
  return `${Math.round(grams)}g`;
}

export function formatWeightOz(grams: number): string {
  const oz = grams / 28.35;
  return `${oz.toFixed(1)} oz`;
}

/**
 * Format weight respecting the user's unit preference.
 *   'g':  grams under 1kg, kg above
 *   'oz': oz under 16 oz, lb above
 */
export function formatWeightAuto(grams: number, unit: 'oz' | 'g'): string {
  if (unit === 'g') return formatWeight(grams);
  const oz = grams / 28.35;
  if (oz >= 16) {
    return `${(oz / 16).toFixed(1)} lb`;
  }
  return `${Math.round(oz)} oz`;
}

export function formatCalDensity(calPerOz: number): string {
  if (calPerOz >= 130) return 'Ultralight';
  if (calPerOz >= 100) return 'Excellent';
  if (calPerOz >= 80) return 'Good';
  if (calPerOz >= 60) return 'Acceptable';
  return 'Heavy';
}

export function getCalDensityColor(calPerOz: number): string {
  if (calPerOz >= 130) return colors.gutExcellent;
  if (calPerOz >= 100) return colors.gutVeryGood;
  if (calPerOz >= 80) return colors.gutGood;
  if (calPerOz >= 60) return colors.gutModerate;
  return colors.gutPoor;
}

export function formatGutRating(rating: GutRating): string {
  return rating.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getGutRatingColor(rating: GutRating): string {
  const map: Record<GutRating, string> = {
    excellent: colors.gutExcellent,
    very_good: colors.gutVeryGood,
    good: colors.gutGood,
    moderate: colors.gutModerate,
    poor: colors.gutPoor,
  };
  return map[rating];
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatVolume(ml: number): string {
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${Math.round(ml)}ml`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getCategoryColor(category: FoodCategory): string {
  const map: Record<FoodCategory, string> = {
    gel: colors.chipGel,
    bar: colors.chipBar,
    chew: colors.chipChew,
    drink_mix: colors.chipDrink,
    real_food: colors.chipRealFood,
    nut_butter: colors.chipNutButter,
    freeze_dried: colors.chipFreezeDried,
  };
  return map[category];
}
