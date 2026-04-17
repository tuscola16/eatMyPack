import { FoodCategory, GutRating } from './food';

export type RaceDistance = '50K' | '50mi' | '100K' | '100mi' | '200mi' | 'custom';
export type Conditions = 'hot' | 'moderate' | 'cool';
export type PhaseType = 'early' | 'mid' | 'late' | 'night' | 'final_push';
export type SetupMode = 'simple' | 'complex';

export type WaystationType = 'aid_station' | 'pack_refill' | 'both';
export type MarkerType = 'hour' | 'mile';

export interface Waystation {
  id: string;
  type: WaystationType;
  marker_type: MarkerType;
  marker_value: number;
  estimated_hour?: number;
  calories_consumed?: number;
  foods?: string[];
  pack_volume_ml?: number;
  notes?: string;
}

export type DistanceUnit = 'km' | 'mi';

export interface RaceConfig {
  distance: RaceDistance;
  custom_distance_km?: number;
  expected_duration_hours: number;
  conditions: Conditions;
  max_volume_ml?: number;
  setup_mode?: SetupMode;
  cal_per_hour_override?: number;
  waystations?: Waystation[];
  /**
   * Unit the user typed distances in. Affects custom-distance input and
   * how 'mile' waystation markers are interpreted. Storage is still in km
   * via `custom_distance_km`; this flag drives display + hour math.
   */
  distance_unit?: DistanceUnit;
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
  waystation_id?: string;
  is_pack_refill?: boolean;
}

export const DISTANCE_TO_MILES: Record<Exclude<RaceDistance, 'custom'>, number> = {
  '50K': 31,
  '50mi': 50,
  '100K': 62,
  '100mi': 100,
  '200mi': 200,
};

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
