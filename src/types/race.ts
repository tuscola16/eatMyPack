import { FoodCategory, GutRating } from './food';

export type RaceDistance = '50K' | '50mi' | '100K' | '100mi' | '200mi' | 'custom';
export type Conditions = 'hot' | 'moderate' | 'cool';
export type PhaseType = 'early' | 'mid' | 'late' | 'night' | 'final_push';
export type SetupMode = 'wizard' | 'witch';

export interface RaceConfig {
  distance: RaceDistance;
  custom_distance_km?: number;
  expected_duration_hours: number;
  conditions: Conditions;
  max_volume_ml?: number;
  setup_mode?: SetupMode;
  cal_per_hour_override?: number;
}

export interface RacePhase {
  type: PhaseType;
  label: string;
  start_hour: number;
  end_hour: number;
  duration_hours: number;
  cal_per_hour_target: number;
  carb_per_hour_target_g: number;
  sodium_per_hour_target_mg: number;
  total_cal_target: number;
  total_carb_target_g: number;
  preferred_categories: FoodCategory[];
  min_gut_rating: GutRating;
  notes: string;
}

export const PHASE_LABELS: Record<PhaseType, string> = {
  early: 'Early Miles',
  mid: 'Mid Race',
  late: 'Late Race',
  night: 'Night Section',
  final_push: 'Final Push',
};

export const PHASE_COLORS: Record<PhaseType, string> = {
  early: '#4CAF50',
  mid: '#2196F3',
  late: '#FF9800',
  night: '#7C4DFF',
  final_push: '#F44336',
};
