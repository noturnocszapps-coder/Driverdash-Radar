export type AppName = "Uber" | "99" | "inDrive" | "Particular";

export interface CallAnalysis {
  id?: string;
  uid: string;
  app_name: AppName;
  fare_value: number;
  pickup_km: number;
  trip_km: number;
  total_km: number;
  estimated_minutes: number;
  destination_text: string;
  destination_bairro: string;
  destination_region: string;
  value_per_km: number;
  value_per_hour: number;
  estimated_cost: number;
  estimated_profit: number;
  ride_score: number;
  recommendation: "ruim" | "fraca" | "razoavel" | "boa" | "excelente";
  accepted: boolean;
  notes?: string;
  created_at: string;
}

export interface CompletedRide {
  id?: string;
  uid: string;
  app_name: AppName;
  started_at: string;
  finished_at: string;
  origin_text: string;
  origin_bairro: string;
  destination_text: string;
  destination_bairro: string;
  total_km: number;
  ride_value: number;
  duration_minutes: number;
  estimated_cost: number;
  estimated_profit: number;
  created_at: string;
}

export interface DriverSettings {
  uid: string;
  city: string;
  minimum_value_per_km: number;
  minimum_value_per_hour: number;
  max_pickup_km: number;
  vehicle_cost_per_km: number;
  preferred_apps: AppName[];
  bad_regions: string[];
  preferred_regions: string[];
  daily_goal: number;
  updated_at: string;
}

export interface NeighborhoodInsight {
  id?: string;
  uid: string;
  bairro: string;
  regiao: string;
  app_name: AppName;
  total_calls: number;
  accepted_calls: number;
  refused_calls: number;
  avg_fare: number;
  avg_total_km: number;
  avg_value_per_km: number;
  avg_value_per_hour: number;
  avg_profit: number;
  return_score: number;
  updated_at: string;
}
