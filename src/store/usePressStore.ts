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
import { runFullSimulation, computePressure } from "../utils/simulationEngine";

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
  const pressure = computePressure(defaultParams);
  return {
    status: "idle",
    currentTime: 0,
    currentPressure: pressure,
    currentJuice: 0,
    compressionRatio: 0,
    displayedPoints: [
      { time: 0, pressure, juice: 0, compression: 0 },
    ],
  };
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
    const pressure = computePressure(next);
    set({
      params: next,
      dirtyParams: true,
      simulationState: {
        status: "idle",
        currentTime: 0,
        currentPressure: pressure,
        currentJuice: 0,
        compressionRatio: 0,
        displayedPoints: [{ time: 0, pressure, juice: 0, compression: 0 }],
      },
      simulationResult: null,
    });
  },

  setParams: (params) => {
    const pressure = computePressure(params);
    set({
      params,
      dirtyParams: false,
      simulationState: {
        status: "idle",
        currentTime: 0,
        currentPressure: pressure,
        currentJuice: 0,
        compressionRatio: 0,
        displayedPoints: [{ time: 0, pressure, juice: 0, compression: 0 }],
      },
      simulationResult: null,
    });
  },

  startSimulation: () => {
    const { params } = get();
    const validation = validateParams(params);
    if (!validation.valid) return false;

    const fullResult = runFullSimulation(params);
    const pressure = computePressure(params);

    set({
      simulationResult: fullResult,
      dirtyParams: false,
      simulationState: {
        status: "running",
        currentTime: 0,
        currentPressure: pressure,
        currentJuice: 0,
        compressionRatio: 0,
        displayedPoints: [{ time: 0, pressure, juice: 0, compression: 0 }],
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
    const pressure = computePressure(get().params);
    set({
      simulationResult: null,
      simulationState: {
        status: "idle",
        currentTime: 0,
        currentPressure: pressure,
        currentJuice: 0,
        compressionRatio: 0,
        displayedPoints: [{ time: 0, pressure, juice: 0, compression: 0 }],
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
      set({
        simulationResult: { ...plan.result },
        simulationState: {
          status: "finished",
          currentTime: plan.result.timeSeries[plan.result.timeSeries.length - 1].time,
          currentPressure: plan.result.peakPressure,
          currentJuice: plan.result.totalJuice,
          compressionRatio:
            plan.result.timeSeries[plan.result.timeSeries.length - 1].compression,
          displayedPoints: plan.result.timeSeries,
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

  togglePlanSelection: (id) => {
    const { selectedPlanIds } = get();
    const next = selectedPlanIds.includes(id)
      ? selectedPlanIds.filter((sid) => sid !== id)
      : [...selectedPlanIds, id];
    set({ selectedPlanIds: next });
  },

  clearSelection: () => set({ selectedPlanIds: [] }),
}));
