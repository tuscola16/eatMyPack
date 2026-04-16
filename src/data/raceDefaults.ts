import { RaceDistance, Conditions, PhaseType } from '../types/race';
import { FoodCategory, GutRating } from '../types/food';

export interface RaceTargets {
  cal_per_hour: [number, number];
  carb_per_hour: [number, number];
  sodium_per_hour: [number, number];
}

export const RACE_DEFAULTS: Record<Exclude<RaceDistance, 'custom'>, RaceTargets> = {
  '50K':  { cal_per_hour: [150, 250], carb_per_hour: [40, 60], sodium_per_hour: [500, 700] },
  '50mi': { cal_per_hour: [200, 300], carb_per_hour: [60, 80], sodium_per_hour: [500, 800] },
  '100K': { cal_per_hour: [200, 300], carb_per_hour: [60, 80], sodium_per_hour: [500, 800] },
  '100mi':{ cal_per_hour: [250, 350], carb_per_hour: [70, 90], sodium_per_hour: [600, 1000] },
  '200mi':{ cal_per_hour: [200, 300], carb_per_hour: [60, 90], sodium_per_hour: [600, 1000] },
};

export const DURATION_SUGGESTIONS: Record<Exclude<RaceDistance, 'custom'>, [number, number]> = {
  '50K':  [4, 8],
  '50mi': [7, 14],
  '100K': [10, 20],
  '100mi': [15, 36],
  '200mi': [60, 120],
};

export const CONDITIONS_ADJUSTMENTS: Record<Conditions, { sodium_mult: number; cal_mult: number }> = {
  hot:      { sodium_mult: 1.3, cal_mult: 0.9 },
  moderate: { sodium_mult: 1.0, cal_mult: 1.0 },
  cool:     { sodium_mult: 0.85, cal_mult: 1.0 },
};

export interface PhaseTemplate {
  type: PhaseType;
  label: string;
  preferred_categories: FoodCategory[];
  min_gut_rating: GutRating;
  cal_multiplier: number; // relative to base target
  carb_emphasis: number; // 0-1, how much carbs matter vs. mixed macros
  notes: string;
}

export const PHASE_TEMPLATES: Record<PhaseType, PhaseTemplate> = {
  early: {
    type: 'early',
    label: 'Early Miles',
    preferred_categories: ['gel', 'chew', 'drink_mix'],
    min_gut_rating: 'good',
    cal_multiplier: 0.85,
    carb_emphasis: 0.9,
    notes: 'Focus on carbs. Gut is fresh but don\'t overload. Avoid fat/fiber.',
  },
  mid: {
    type: 'mid',
    label: 'Mid Race',
    preferred_categories: ['gel', 'chew', 'bar', 'real_food', 'drink_mix'],
    min_gut_rating: 'moderate',
    cal_multiplier: 1.0,
    carb_emphasis: 0.7,
    notes: 'Introduce real food. Rotate flavors to avoid sweetness fatigue.',
  },
  late: {
    type: 'late',
    label: 'Late Race',
    preferred_categories: ['real_food', 'bar', 'nut_butter', 'chew'],
    min_gut_rating: 'moderate',
    cal_multiplier: 1.0,
    carb_emphasis: 0.5,
    notes: 'Savory > sweet. Fat and protein become essential. Eat at every aid station.',
  },
  night: {
    type: 'night',
    label: 'Night Section',
    preferred_categories: ['real_food', 'gel', 'chew', 'drink_mix'],
    min_gut_rating: 'moderate',
    cal_multiplier: 0.9,
    carb_emphasis: 0.6,
    notes: 'Warm food + caffeine. Stomach slows at night. Focus on staying ahead of deficit.',
  },
  final_push: {
    type: 'final_push',
    label: 'Final Push',
    preferred_categories: ['gel', 'chew', 'drink_mix'],
    min_gut_rating: 'good',
    cal_multiplier: 0.85,
    carb_emphasis: 0.9,
    notes: 'Easy liquid/semi-liquid calories. Caffeine for alertness. Any calories count.',
  },
};
