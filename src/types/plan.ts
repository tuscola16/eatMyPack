import { FoodItem } from './food';
import { RaceConfig, RacePhase, PhaseType } from './race';

export interface PackEntry {
  food: FoodItem;
  servings: number;
  total_calories: number;
  total_weight_g: number;
  total_carbs_g: number;
  total_sodium_mg: number;
  total_volume_ml: number;
  assigned_phase: PhaseType;
}

export interface PackPhase {
  phase: RacePhase;
  entries: PackEntry[];
  total_calories: number;
  total_carbs_g: number;
  total_sodium_mg: number;
  total_weight_g: number;
  total_volume_ml: number;
  target_met_pct: number;
}

export interface PackPlan {
  id: string;
  name: string;
  created_at: string;
  race_config: RaceConfig;
  phases: PackPhase[];
  total_calories: number;
  total_weight_g: number;
  total_volume_ml: number;
  total_items: number;
  rejected_food_ids: string[];
  pinned_food_ids: string[];
}
