import { create } from "zustand";
import {
  PressParams,
  ExperimentPlan,
  SimulationState,
  SimulationResult,
  SimulationStatus,
  SIMULATION_DT,
  ExperimentReport,
  ReportFilter,
  StructureAdjustmentRecord,
} from "../types";
import { validateParams } from "../utils/validateParams";
import { runFullSimulation, computePressure, computeInitialStatePoint } from "../utils/simulationEngine";
import {
  generateExperimentReport,
  createAdjustmentRecord,
} from "../utils/reportGenerator";

interface PressStore {
  params: PressParams;
  simulationState: SimulationState;
  simulationResult: SimulationResult | null;
  plans: ExperimentPlan[];
  selectedPlanIds: string[];
  dirtyParams: boolean;

  setParam: (key: keyof PressParams, value: number) => void;
  setParams: (params: PressParams) => void;
  startSimulation: () => boolean;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  tickSimulation: () => void;

  savePlan: (name: string) => string | null;
  loadPlan: (id: string) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => string | null;
  exportPlans: (ids: string[], format: "json" | "csv") => string;
  togglePlanSelection: (id: string) => void;
  clearSelection: () => void;

  reports: ExperimentReport[];
  currentReport: ExperimentReport | null;
  reportFilter: ReportFilter;
  adjustmentRecords: StructureAdjustmentRecord[];
  lastParamsBeforeChange: PressParams | null;

  generateReport: (name?: string) => string | null;
  deleteReport: (id: string) => void;
  setCurrentReport: (id: string | null) => void;
  toggleBestReport: (id: string) => void;
  setReportFilter: (filter: Partial<ReportFilter>) => void;
  getFilteredReports: () => ExperimentReport[];
  getBestReport: () => ExperimentReport | null;
  addReportTag: (reportId: string, tag: string) => void;
  removeReportTag: (reportId: string, tag: string) => void;
  updateReportNotes: (reportId: string, notes: string) => void;
  renameReport: (reportId: string, name: string) => void;
  exportReportHTML: (id: string) => string;
}

const STORAGE_KEY = "press_experiment_plans";
const REPORTS_STORAGE_KEY = "press_experiment_reports";
const ADJUSTMENTS_STORAGE_KEY = "press_adjustment_records";

const defaultParams: PressParams = {
  leverLength: 4.5,
  stoneWeight: 150,
  fruitWeight: 50,
  moistureContent: 75,
  plateDiameter: 0.35,
  fulcrumPosition: 0.9,
};

function normalizeResult(result: any): SimulationResult | undefined {
  if (!result) return undefined;
  return {
    ...result,
    stableJuiceTime: result.stableJuiceTime ?? -1,
  };
}

function loadPlansFromStorage(): ExperimentPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ExperimentPlan[];
      return parsed.map((p) => ({
        ...p,
        params: {
          leverLength: p.params.leverLength ?? 2.5,
          stoneWeight: p.params.stoneWeight ?? 80,
          fruitWeight: p.params.fruitWeight ?? 50,
          moistureContent: p.params.moistureContent ?? 75,
          plateDiameter: (p.params as any).plateDiameter ?? 0.4,
          fulcrumPosition: (p.params as any).fulcrumPosition ?? 0.8,
        },
        result: normalizeResult(p.result),
      }));
    }
  } catch (e) {
    console.error("Failed to load plans", e);
  }
  return [];
}

function savePlansToStorage(plans: ExperimentPlan[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error("Failed to save plans", e);
  }
}

function buildInitialSimulationState(): SimulationState {
  const initialPoint = computeInitialStatePoint(defaultParams);
  return {
    status: "idle",
    currentTime: initialPoint.time,
    currentPressure: initialPoint.pressure,
    currentJuice: initialPoint.juice,
    compressionRatio: initialPoint.compression,
    displayedPoints: [initialPoint],
  };
}

function buildPlanExportJSON(plans: ExperimentPlan[]): string {
  return JSON.stringify(
    plans.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      params: p.params,
      result: p.result
        ? {
            peakPressure: p.result.peakPressure,
            totalJuice: p.result.totalJuice,
            theoreticalWater: p.result.theoreticalWater,
            residueMoisture: p.result.residueMoisture,
            juiceYield: p.result.juiceYield,
            stableJuiceTime: p.result.stableJuiceTime,
            feasible: p.result.feasible,
            infeasibleReason: p.result.infeasibleReason,
          }
        : null,
    })),
    null,
    2
  );
}

function buildPlanExportCSV(plans: ExperimentPlan[]): string {
  const headers = [
    "方案名称",
    "创建时间",
    "杠杆长度(m)",
    "压石挂点(%)",
    "压盘直径(m)",
    "压石重量(kg)",
    "果料重量(kg)",
    "含水率(%)",
    "可行",
    "峰值压力(kPa)",
    "总出汁量(mL)",
    "理论含水量(mL)",
    "残渣含水率(%)",
    "出汁率(%)",
    "稳定出汁时间(s)",
    "不可行原因",
  ];
  const rows = plans.map((p) => [
    p.name,
    new Date(p.createdAt).toLocaleString("zh-CN"),
    p.params.leverLength,
    (p.params.fulcrumPosition * 100).toFixed(0),
    p.params.plateDiameter,
    p.params.stoneWeight,
    p.params.fruitWeight,
    p.params.moistureContent,
    p.result?.feasible ? "是" : "否",
    p.result?.peakPressure ?? "",
    p.result?.totalJuice ?? "",
    p.result?.theoreticalWater ?? "",
    p.result?.residueMoisture ?? "",
    p.result?.juiceYield ?? "",
    p.result && p.result.stableJuiceTime > 0 ? p.result.stableJuiceTime : "未达成",
    p.result?.infeasibleReason ?? "",
  ]);
  const escape = (v: any) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

function loadReportsFromStorage(): ExperimentReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ExperimentReport[];
    }
  } catch (e) {
    console.error("Failed to load reports", e);
  }
  return [];
}

function saveReportsToStorage(reports: ExperimentReport[]) {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error("Failed to save reports", e);
  }
}

function loadAdjustmentsFromStorage(): StructureAdjustmentRecord[] {
  try {
    const raw = localStorage.getItem(ADJUSTMENTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StructureAdjustmentRecord[];
    }
  } catch (e) {
    console.error("Failed to load adjustments", e);
  }
  return [];
}

function saveAdjustmentsToStorage(records: StructureAdjustmentRecord[]) {
  try {
    localStorage.setItem(ADJUSTMENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to save adjustments", e);
  }
}

function buildReportExportHTML(report: ExperimentReport): string {
  const { name, createdAt, params, result, summary, stageAnalysis, diagnosis } = report;
  
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const severityColors: Record<string, string> = {
    critical: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
  };

  const priorityColors: Record<string, string> = {
    high: "#dc2626",
    medium: "#d97706",
    low: "#65a30d",
  };

  const ratingColors: Record<string, string> = {
    excellent: "#16a34a",
    good: "#65a30d",
    fair: "#d97706",
    poor: "#dc2626",
  };

  const ratingLabels: Record<string, string> = {
    excellent: "优秀",
    good: "良好",
    fair: "一般",
    poor: "较差",
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - 压榨实验报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: #f5f0e6;
      color: #3d2914;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #c9a96e;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(61, 41, 20, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #c9a96e;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      color: #5c4033;
      margin-bottom: 8px;
    }
    .header .date {
      color: #8b7355;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 20px;
      color: #5c4033;
      margin-bottom: 15px;
      padding-left: 12px;
      border-left: 4px solid #c9a96e;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .summary-card {
      background: #faf6ee;
      border: 1px solid #e8dcc8;
      border-radius: 6px;
      padding: 15px;
      text-align: center;
    }
    .summary-card .label {
      font-size: 13px;
      color: #8b7355;
      margin-bottom: 5px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #5c4033;
    }
    .summary-card .unit {
      font-size: 12px;
      color: #8b7355;
      margin-left: 3px;
    }
    .score-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 16px;
      color: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e8dcc8;
    }
    th {
      background: #faf6ee;
      font-weight: 600;
      color: #5c4033;
    }
    .anomaly-item, .suggestion-item {
      padding: 12px;
      border-left: 4px solid;
      background: #faf6ee;
      margin-bottom: 10px;
      border-radius: 0 4px 4px 0;
    }
    .anomaly-item h4, .suggestion-item h4 {
      margin-bottom: 5px;
      font-size: 15px;
    }
    .anomaly-item p, .suggestion-item p {
      font-size: 13px;
      color: #6b5b47;
    }
    .assessment {
      background: linear-gradient(135deg, #faf6ee 0%, #f0e6d2 100%);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #c9a96e;
    }
    .assessment .rating {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .stage-item {
      padding: 12px;
      background: #faf6ee;
      border: 1px solid #e8dcc8;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .stage-item h4 {
      color: #5c4033;
      margin-bottom: 8px;
    }
    .stage-item .metrics {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: #6b5b47;
    }
    .footer {
      text-align: center;
      color: #8b7355;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e8dcc8;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${name}</h1>
      <div class="date">生成时间：${formatDate(createdAt)}</div>
    </div>

    <div class="section">
      <h2>实验摘要</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">总出汁量</div>
          <div class="value">${result.totalJuice.toFixed(0)}<span class="unit">mL</span></div>
        </div>
        <div class="summary-card">
          <div class="label">出汁率</div>
          <div class="value">${result.juiceYield.toFixed(1)}<span class="unit">%</span></div>
        </div>
        <div class="summary-card">
          <div class="label">峰值压力</div>
          <div class="value">${result.peakPressure.toFixed(0)}<span class="unit">kPa</span></div>
        </div>
        <div class="summary-card">
          <div class="label">残渣含水率</div>
          <div class="value">${result.residueMoisture.toFixed(1)}<span class="unit">%</span></div>
        </div>
        <div class="summary-card">
          <div class="label">稳定出汁时间</div>
          <div class="value">${result.stableJuiceTime > 0 ? result.stableJuiceTime.toFixed(0) : "未达成"}<span class="unit">${result.stableJuiceTime > 0 ? "s" : ""}</span></div>
        </div>
        <div class="summary-card">
          <div class="label">综合评分</div>
          <div class="value"><span class="score-badge" style="background: ${ratingColors[diagnosis.efficiencyRating]}">${summary.overallScore}</span></div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>关键参数</h2>
      <table>
        <thead>
          <tr>
            <th>参数类别</th>
            <th>参数名称</th>
            <th>数值</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="3">结构参数</td>
            <td>杠杆长度</td>
            <td>${params.leverLength} m</td>
          </tr>
          <tr>
            <td>压石挂点位置</td>
            <td>${(params.fulcrumPosition * 100).toFixed(0)}%</td>
          </tr>
          <tr>
            <td>压盘直径</td>
            <td>Ø${params.plateDiameter.toFixed(2)} m</td>
          </tr>
          <tr>
            <td>载荷参数</td>
            <td>压石重量</td>
            <td>${params.stoneWeight} kg</td>
          </tr>
          <tr>
            <td rowspan="2">物料参数</td>
            <td>果料重量</td>
            <td>${params.fruitWeight} kg</td>
          </tr>
          <tr>
            <td>果料含水率</td>
            <td>${params.moistureContent}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>压榨阶段分析</h2>
      ${stageAnalysis.map(stage => `
        <div class="stage-item">
          <h4>${stage.stageName}（${stage.startTime.toFixed(0)}s - ${stage.endTime.toFixed(0)}s）</h4>
          <div class="metrics">
            <span>平均压力：${stage.avgPressure.toFixed(1)} kPa</span>
            <span>产汁量：${stage.juiceProduced.toFixed(0)} mL</span>
            <span>出汁速率：${stage.juiceRate.toFixed(2)} mL/s</span>
          </div>
          <p style="font-size: 13px; color: #6b5b47; margin-top: 8px;">${stage.description}</p>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>智能诊断</h2>
      <div class="assessment">
        <div class="rating" style="color: ${ratingColors[diagnosis.efficiencyRating]}">
          效率评级：${ratingLabels[diagnosis.efficiencyRating]}
        </div>
        <p>${diagnosis.overallAssessment}</p>
      </div>
    </div>

    ${diagnosis.anomalies.length > 0 ? `
    <div class="section">
      <h2>异常检测</h2>
      ${diagnosis.anomalies.map(a => `
        <div class="anomaly-item" style="border-left-color: ${severityColors[a.severity]}">
          <h4 style="color: ${severityColors[a.severity]}">${a.title}</h4>
          <p>${a.description}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${diagnosis.suggestions.length > 0 ? `
    <div class="section">
      <h2>优化建议</h2>
      ${diagnosis.suggestions.map(s => `
        <div class="suggestion-item" style="border-left-color: ${priorityColors[s.priority]}">
          <h4 style="color: ${priorityColors[s.priority]}">${s.title}</h4>
          <p>${s.description}</p>
          <p style="margin-top: 5px; color: #16a34a;">预期效果：${s.expectedImprovement}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="footer">
      <p>传统压榨机出汁效率模拟系统 · 实验报告自动生成</p>
      <p style="margin-top: 4px;">本报告基于物理模型计算，仅供参考</p>
    </div>
  </div>
</body>
</html>`;
}

export const usePressStore = create<PressStore>((set, get) => ({
  params: defaultParams,
  simulationState: buildInitialSimulationState(),
  simulationResult: null,
  plans: loadPlansFromStorage(),
  selectedPlanIds: [],
  dirtyParams: false,
  reports: loadReportsFromStorage(),
  currentReport: null,
  reportFilter: {
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  adjustmentRecords: loadAdjustmentsFromStorage(),
  lastParamsBeforeChange: null,

  setParam: (key, value) => {
    const currentParams = get().params;
    const next = { ...currentParams, [key]: value };
    const initialPoint = computeInitialStatePoint(next);
    
    const hasChanged = currentParams[key] !== value;
    const lastParamsBeforeChange = hasChanged && !get().lastParamsBeforeChange
      ? { ...currentParams }
      : get().lastParamsBeforeChange;
    
    set({
      params: next,
      dirtyParams: true,
      lastParamsBeforeChange,
      simulationState: {
        status: "idle",
        currentTime: initialPoint.time,
        currentPressure: initialPoint.pressure,
        currentJuice: initialPoint.juice,
        compressionRatio: initialPoint.compression,
        displayedPoints: [initialPoint],
      },
      simulationResult: null,
    });
  },

  setParams: (params) => {
    const initialPoint = computeInitialStatePoint(params);
    set({
      params,
      dirtyParams: false,
      simulationState: {
        status: "idle",
        currentTime: initialPoint.time,
        currentPressure: initialPoint.pressure,
        currentJuice: initialPoint.juice,
        compressionRatio: initialPoint.compression,
        displayedPoints: [initialPoint],
      },
      simulationResult: null,
    });
  },

  startSimulation: () => {
    const { params } = get();
    const validation = validateParams(params);
    if (!validation.valid) return false;

    const fullResult = runFullSimulation(params);
    const initialPoint = fullResult.timeSeries[0];

    if (!fullResult.feasible) {
      set({
        simulationResult: fullResult,
        dirtyParams: false,
        simulationState: {
          status: "finished",
          currentTime: initialPoint.time,
          currentPressure: initialPoint.pressure,
          currentJuice: initialPoint.juice,
          compressionRatio: initialPoint.compression,
          displayedPoints: [...fullResult.timeSeries],
        },
      });
      return true;
    }

    set({
      simulationResult: fullResult,
      dirtyParams: false,
      simulationState: {
        status: "running",
        currentTime: initialPoint.time,
        currentPressure: initialPoint.pressure,
        currentJuice: initialPoint.juice,
        compressionRatio: initialPoint.compression,
        displayedPoints: [initialPoint],
      },
    });
    return true;
  },

  pauseSimulation: () => {
    const state = get().simulationState;
    if (state.status === "running") {
      set({ simulationState: { ...state, status: "paused" } });
    }
  },

  resumeSimulation: () => {
    const state = get().simulationState;
    if (state.status === "paused") {
      set({ simulationState: { ...state, status: "running" } });
    }
  },

  resetSimulation: () => {
    const initialPoint = computeInitialStatePoint(get().params);
    set({
      simulationResult: null,
      simulationState: {
        status: "idle",
        currentTime: initialPoint.time,
        currentPressure: initialPoint.pressure,
        currentJuice: initialPoint.juice,
        compressionRatio: initialPoint.compression,
        displayedPoints: [initialPoint],
      },
    });
  },

  tickSimulation: () => {
    const { simulationState, simulationResult } = get();
    if (simulationState.status !== "running" || !simulationResult) return;

    const nextTime = simulationState.currentTime + SIMULATION_DT;
    const series = simulationResult.timeSeries;

    let idx = 0;
    while (idx < series.length - 1 && series[idx + 1].time <= nextTime) {
      idx++;
    }

    const point = series[Math.min(idx, series.length - 1)];
    const isFinished = point.time >= series[series.length - 1].time - 0.001;

    const displayedPoints = isFinished
      ? [...series]
      : series.slice(0, idx + 1);

    set({
      simulationState: {
        status: isFinished ? ("finished" as SimulationStatus) : "running",
        currentTime: point.time,
        currentPressure: point.pressure,
        currentJuice: point.juice,
        compressionRatio: point.compression,
        displayedPoints,
      },
    });
  },

  savePlan: (name) => {
    const { params, simulationResult } = get();
    const validation = validateParams(params);
    if (!validation.valid) return null;

    const plan: ExperimentPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || `方案 ${new Date().toLocaleString("zh-CN")}`,
      params: { ...params },
      result: simulationResult ? { ...simulationResult } : undefined,
      createdAt: Date.now(),
    };

    const next = [plan, ...get().plans];
    savePlansToStorage(next);
    set({ plans: next });
    return plan.id;
  },

  loadPlan: (id) => {
    const plan = get().plans.find((p) => p.id === id);
    if (!plan) return;
    get().setParams({ ...plan.params });
    if (plan.result) {
      const pressure = computePressure(plan.params);
      const normalized = normalizeResult(plan.result)!;
      set({
        simulationResult: normalized,
        simulationState: {
          status: "finished",
          currentTime: normalized.timeSeries[normalized.timeSeries.length - 1].time,
          currentPressure: normalized.peakPressure,
          currentJuice: normalized.totalJuice,
          compressionRatio:
            normalized.timeSeries[normalized.timeSeries.length - 1].compression,
          displayedPoints: normalized.timeSeries,
        },
        dirtyParams: false,
      });
    }
  },

  deletePlan: (id) => {
    const next = get().plans.filter((p) => p.id !== id);
    savePlansToStorage(next);
    set({
      plans: next,
      selectedPlanIds: get().selectedPlanIds.filter((sid) => sid !== id),
    });
  },

  duplicatePlan: (id) => {
    const plan = get().plans.find((p) => p.id === id);
    if (!plan) return null;

    const clone: ExperimentPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: `${plan.name} (副本)`,
      params: { ...plan.params },
      result: plan.result ? { ...plan.result } : undefined,
      createdAt: Date.now(),
    };

    const next = [clone, ...get().plans];
    savePlansToStorage(next);
    set({ plans: next });
    return clone.id;
  },

  exportPlans: (ids, format) => {
    const plans =
      ids.length === 0
        ? get().plans
        : get().plans.filter((p) => ids.includes(p.id));
    return format === "csv"
      ? buildPlanExportCSV(plans)
      : buildPlanExportJSON(plans);
  },

  togglePlanSelection: (id) => {
    const { selectedPlanIds } = get();
    const next = selectedPlanIds.includes(id)
      ? selectedPlanIds.filter((sid) => sid !== id)
      : [...selectedPlanIds, id];
    set({ selectedPlanIds: next });
  },

  clearSelection: () => set({ selectedPlanIds: [] }),

  generateReport: (name) => {
    const { params, simulationResult, plans, lastParamsBeforeChange, adjustmentRecords } = get();
    if (!simulationResult) return null;

    const report = generateExperimentReport(
      name || "",
      params,
      simulationResult
    );

    if (lastParamsBeforeChange) {
      const existingResult = plans.find(p => p.result)?.result;
      const record = createAdjustmentRecord(
        lastParamsBeforeChange,
        params,
        existingResult,
        simulationResult
      );
      const nextRecords = [record, ...adjustmentRecords].slice(0, 50);
      saveAdjustmentsToStorage(nextRecords);
      set({ adjustmentRecords: nextRecords });
    }

    const next = [report, ...get().reports];
    saveReportsToStorage(next);
    set({ reports: next, currentReport: report, lastParamsBeforeChange: null });
    return report.id;
  },

  deleteReport: (id) => {
    const next = get().reports.filter((r) => r.id !== id);
    saveReportsToStorage(next);
    set({
      reports: next,
      currentReport: get().currentReport?.id === id ? null : get().currentReport,
    });
  },

  setCurrentReport: (id) => {
    if (!id) {
      set({ currentReport: null });
      return;
    }
    const report = get().reports.find((r) => r.id === id);
    if (report) {
      set({ currentReport: report });
    }
  },

  toggleBestReport: (id) => {
    const reports = get().reports.map((r) => ({
      ...r,
      isBest: r.id === id ? !r.isBest : r.isBest,
    }));
    saveReportsToStorage(reports);
    set({ reports });
  },

  setReportFilter: (filter) => {
    set({
      reportFilter: { ...get().reportFilter, ...filter },
    });
  },

  getFilteredReports: () => {
    const { reports, reportFilter } = get();
    let filtered = [...reports];

    if (reportFilter.feasibleOnly) {
      filtered = filtered.filter((r) => r.result.feasible);
    }

    if (reportFilter.bestOnly) {
      filtered = filtered.filter((r) => r.isBest);
    }

    if (reportFilter.minJuiceYield !== undefined) {
      filtered = filtered.filter((r) => r.result.juiceYield >= reportFilter.minJuiceYield!);
    }

    if (reportFilter.searchText) {
      const search = reportFilter.searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.tags.some((t) => t.toLowerCase().includes(search)) ||
          (r.notes && r.notes.toLowerCase().includes(search))
      );
    }

    const { sortBy, sortOrder } = reportFilter;
    filtered.sort((a, b) => {
      let valA: number;
      let valB: number;

      switch (sortBy) {
        case "createdAt":
          valA = a.createdAt;
          valB = b.createdAt;
          break;
        case "juiceYield":
          valA = a.result.juiceYield;
          valB = b.result.juiceYield;
          break;
        case "totalJuice":
          valA = a.result.totalJuice;
          valB = b.result.totalJuice;
          break;
        case "peakPressure":
          valA = a.result.peakPressure;
          valB = b.result.peakPressure;
          break;
        case "stableJuiceTime":
          valA = a.result.stableJuiceTime > 0 ? a.result.stableJuiceTime : 9999;
          valB = b.result.stableJuiceTime > 0 ? b.result.stableJuiceTime : 9999;
          break;
        case "overallScore":
          valA = a.summary.overallScore;
          valB = b.summary.overallScore;
          break;
        default:
          valA = a.createdAt;
          valB = b.createdAt;
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return filtered;
  },

  getBestReport: () => {
    const feasibleReports = get().reports.filter((r) => r.result.feasible);
    if (feasibleReports.length === 0) return null;
    return feasibleReports.reduce((best, current) =>
      current.summary.overallScore > best.summary.overallScore ? current : best
    );
  },

  addReportTag: (reportId, tag) => {
    const reports = get().reports.map((r) => {
      if (r.id !== reportId) return r;
      if (r.tags.includes(tag)) return r;
      return { ...r, tags: [...r.tags, tag] };
    });
    saveReportsToStorage(reports);
    set({ reports });
  },

  removeReportTag: (reportId, tag) => {
    const reports = get().reports.map((r) => {
      if (r.id !== reportId) return r;
      return { ...r, tags: r.tags.filter((t) => t !== tag) };
    });
    saveReportsToStorage(reports);
    set({ reports });
  },

  updateReportNotes: (reportId, notes) => {
    const reports = get().reports.map((r) => {
      if (r.id !== reportId) return r;
      return { ...r, notes };
    });
    saveReportsToStorage(reports);
    set({ reports });
  },

  renameReport: (reportId, name) => {
    const reports = get().reports.map((r) => {
      if (r.id !== reportId) return r;
      return { ...r, name: name.trim() || r.name };
    });
    saveReportsToStorage(reports);
    set({ reports });
  },

  exportReportHTML: (id) => {
    const report = get().reports.find((r) => r.id === id);
    if (!report) return "";
    return buildReportExportHTML(report);
  },
}));
