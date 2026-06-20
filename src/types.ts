export interface PressParams {
  leverLength: number;
  stoneWeight: number;
  fruitWeight: number;
  moistureContent: number;
  plateDiameter: number;
  fulcrumPosition: number;
}

export function computePlateArea(diameterM: number): number {
  const r = diameterM / 2;
  return Math.PI * r * r;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface TimeSeriesPoint {
  time: number;
  pressure: number;
  juice: number;
  compression: number;
}

export interface SimulationResult {
  peakPressure: number;
  totalJuice: number;
  theoreticalWater: number;
  residueMoisture: number;
  juiceYield: number;
  stableJuiceTime: number;
  feasible: boolean;
  infeasibleReason?: string;
  timeSeries: TimeSeriesPoint[];
}

export interface ExperimentPlan {
  id: string;
  name: string;
  params: PressParams;
  result?: SimulationResult;
  createdAt: number;
}

export type SimulationStatus = "idle" | "running" | "paused" | "finished";

export interface SimulationState {
  status: SimulationStatus;
  currentTime: number;
  currentPressure: number;
  currentJuice: number;
  compressionRatio: number;
  displayedPoints: TimeSeriesPoint[];
}

export const SIMULATION_DURATION = 120;
export const SIMULATION_DT = 0.5;
export const PRESSURE_THRESHOLD = 50;
export const JUICE_COEFFICIENT = 0.0015;
export const COMPRESSION_TAU = 20;
export const GRAVITY = 9.8;

export const DEFAULT_PLATE_POSITION_RATIO = 0.25;
