import { create } from "zustand";
import {
  PressParams,
  ExperimentPlan,
  SimulationState,
  SimulationResult,
  SimulationStatus,
  SIMULATION_DT,
} from "../types";
import { validateParams } from "../utils/validateParams";
import { runFullSimulation, computePressure, computeInitialStatePoint } from "../utils/simulationEngine";

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
}

const STORAGE_KEY = "press_experiment_plans";

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

export const usePressStore = create<PressStore>((set, get) => ({
  params: defaultParams,
  simulationState: buildInitialSimulationState(),
  simulationResult: null,
  plans: loadPlansFromStorage(),
  selectedPlanIds: [],
  dirtyParams: false,

  setParam: (key, value) => {
    const next = { ...get().params, [key]: value };
    const initialPoint = computeInitialStatePoint(next);
    set({
      params: next,
      dirtyParams: true,
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
}));
