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

export interface PressStageAnalysis {
  stageName: string;
  startTime: number;
  endTime: number;
  avgPressure: number;
  juiceProduced: number;
  juiceRate: number;
  description: string;
}

export interface ExperimentSummary {
  totalDuration: number;
  peakPressure: number;
  peakPressureTime: number;
  totalJuice: number;
  theoreticalWater: number;
  juiceYield: number;
  residueMoisture: number;
  stableJuiceTime: number;
  feasibility: "feasible" | "borderline" | "infeasible";
  overallScore: number;
}

export interface ParameterComparison {
  paramKey: string;
  paramLabel: string;
  oldValue: number;
  newValue: number;
  delta: number;
  deltaPercent: number;
  unit: string;
  impact: "positive" | "negative" | "neutral";
  impactDescription: string;
}

export interface ResultComparison {
  metricKey: string;
  metricLabel: string;
  oldValue: number;
  newValue: number;
  delta: number;
  deltaPercent: number;
  unit: string;
  better: boolean;
  isTime?: boolean;
}

export interface StructureAdjustmentRecord {
  id: string;
  timestamp: number;
  previousParams: PressParams;
  newParams: PressParams;
  previousResult?: SimulationResult;
  newResult?: SimulationResult;
  paramChanges: ParameterComparison[];
  resultChanges: ResultComparison[];
  improvementScore: number;
}

export interface AnomalyIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  description: string;
  affectedMetric?: string;
  detectedAt?: number;
}

export interface OptimizationSuggestion {
  id: string;
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  expectedImprovement: string;
  targetMetric: string;
  paramAdjustments: {
    key: keyof PressParams;
    direction: "increase" | "decrease";
    suggestedValue?: number;
    magnitude: "small" | "medium" | "large";
  }[];
}

export interface DiagnosisReport {
  anomalies: AnomalyIssue[];
  suggestions: OptimizationSuggestion[];
  overallAssessment: string;
  efficiencyRating: "excellent" | "good" | "fair" | "poor";
}

export interface ExperimentReport {
  id: string;
  name: string;
  planId?: string;
  createdAt: number;
  params: PressParams;
  result: SimulationResult;
  summary: ExperimentSummary;
  stageAnalysis: PressStageAnalysis[];
  diagnosis: DiagnosisReport;
  isBest?: boolean;
  tags: string[];
  notes?: string;
}

export type ReportSortField =
  | "createdAt"
  | "juiceYield"
  | "totalJuice"
  | "peakPressure"
  | "stableJuiceTime"
  | "overallScore";

export type ReportFilter = {
  feasibleOnly?: boolean;
  bestOnly?: boolean;
  minJuiceYield?: number;
  searchText?: string;
  sortBy: ReportSortField;
  sortOrder: "asc" | "desc";
};
