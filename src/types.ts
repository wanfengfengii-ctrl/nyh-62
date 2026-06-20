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

export interface ReportComparisonRow {
  paramKey: keyof PressParams | string;
  label: string;
  unit: string;
  values: (number | string)[];
  bestIndex?: number;
  isBetterHigher?: boolean;
}

export interface ReportComparisonData {
  reports: ExperimentReport[];
  paramComparison: ReportComparisonRow[];
  resultComparison: ReportComparisonRow[];
  radarData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  winnerId?: string;
  winnerReason: string;
}

export type RecommendationCategory = "efficiency" | "safety" | "stability" | "balance";

export interface RecommendationResult {
  report: ExperimentReport;
  category: RecommendationCategory;
  categoryLabel: string;
  score: number;
  rank: number;
  highlights: string[];
  tradeoffs: string[];
}

export interface RecommendationAnalysis {
  recommendations: RecommendationResult[];
  overallBest: RecommendationResult;
  efficiencyBest: RecommendationResult;
  safetyBest: RecommendationResult;
  stabilityBest: RecommendationResult;
  insights: string[];
  comparisonMatrix: {
    reportIds: string[];
    matrix: number[][];
  };
}

export type ExportFormat = "html" | "json" | "csv" | "pdf";

export interface BatchExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  includeRawData?: boolean;
  includeDiagnosis?: boolean;
  fileName?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  speed: number;
  history: StructureAdjustmentRecord[];
}

export interface TrajectoryAnalysis {
  records: StructureAdjustmentRecord[];
  paramTrends: {
    paramKey: keyof PressParams;
    label: string;
    unit: string;
    values: { timestamp: number; value: number; improvement: number }[];
    trend: "increasing" | "decreasing" | "stable";
    correlation: number;
  }[];
  resultTrends: {
    metricKey: string;
    label: string;
    unit: string;
    values: { timestamp: number; value: number; delta: number }[];
    trend: "improving" | "declining" | "stable";
  }[];
  overallImprovement: number;
  keyInsights: string[];
  optimalPath: StructureAdjustmentRecord[];
}

export interface ShareLinkData {
  id: string;
  reportIds: string[];
  createdAt: number;
  expiresAt?: number;
  viewCount: number;
}

export type RightPanelTab = "report" | "history" | "plans" | "comparison" | "trajectory" | "recommendation";

export type TrainingDifficulty = "beginner" | "intermediate" | "advanced";
export type TrainingMode = "teaching" | "exam" | "practice";
export type TrainingTaskStatus = "not_started" | "in_progress" | "submitted" | "completed";

export interface TrainingTaskStep {
  id: string;
  title: string;
  description: string;
  hint?: string;
  paramTargets?: Partial<PressParams>;
  expectedAction?: "set_param" | "start_simulation" | "check_result";
}

export interface TrainingTaskTarget {
  minJuiceYield?: number;
  maxPeakPressure?: number;
  minTotalJuice?: number;
  maxStableJuiceTime?: number;
  maxResidueMoisture?: number;
  targetParams?: Partial<PressParams>;
  paramTolerance?: number;
}

export interface TrainingTask {
  id: string;
  title: string;
  description: string;
  difficulty: TrainingDifficulty;
  mode: TrainingMode;
  duration: number;
  steps: TrainingTaskStep[];
  targets: TrainingTaskTarget;
  passScore: number;
  tags: string[];
  learningObjectives: string[];
  prerequisites?: string[];
}

export interface ScoreDimension {
  key: "params" | "pressure" | "efficiency" | "structure";
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  details: string;
}

export interface TrainingError {
  id: string;
  category: "param_error" | "operation_error" | "result_error";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  relatedParam?: keyof PressParams;
  suggestion: string;
}

export interface TrainingFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    expectedImprovement?: string;
  }[];
  nextSteps: string[];
  knowledgeGaps: string[];
}

export interface TrainingResult {
  id: string;
  taskId: string;
  taskTitle: string;
  submittedAt: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: "excellent" | "good" | "pass" | "fail";
  passed: boolean;
  dimensions: ScoreDimension[];
  errors: TrainingError[];
  feedback: TrainingFeedback;
  params: PressParams;
  result: SimulationResult | null;
  timeSpent: number;
  hintsUsed: number;
}

export interface TrainingState {
  activeTask: TrainingTask | null;
  currentStepIndex: number;
  status: TrainingTaskStatus;
  startTime: number | null;
  hintsUsed: number;
  showHints: boolean;
  trainingResults: TrainingResult[];
  lastResult: TrainingResult | null;
}

export type AppViewMode = "simulation" | "training";
