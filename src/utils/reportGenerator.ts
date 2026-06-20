import {
  PressParams,
  SimulationResult,
  ExperimentSummary,
  PressStageAnalysis,
  ExperimentReport,
  ParameterComparison,
  ResultComparison,
  StructureAdjustmentRecord,
} from "../types";

const PARAM_LABELS: Record<keyof PressParams, { label: string; unit: string }> = {
  leverLength: { label: "杠杆长度", unit: "m" },
  fulcrumPosition: { label: "压石挂点位置", unit: "%" },
  plateDiameter: { label: "压盘直径", unit: "m" },
  stoneWeight: { label: "压石重量", unit: "kg" },
  fruitWeight: { label: "果料重量", unit: "kg" },
  moistureContent: { label: "果料含水率", unit: "%" },
};

const METRIC_LABELS: Record<string, { label: string; unit: string; lowerBetter?: boolean; isTime?: boolean }> = {
  peakPressure: { label: "峰值压力", unit: "kPa" },
  totalJuice: { label: "总出汁量", unit: "mL" },
  theoreticalWater: { label: "理论含水量", unit: "mL" },
  residueMoisture: { label: "残渣含水率", unit: "%", lowerBetter: true },
  juiceYield: { label: "出汁率", unit: "%" },
  stableJuiceTime: { label: "稳定出汁时间", unit: "s", lowerBetter: true, isTime: true },
};

export function generateExperimentSummary(
  result: SimulationResult
): ExperimentSummary {
  const { timeSeries, feasible, juiceYield, peakPressure, stableJuiceTime, totalJuice, theoreticalWater, residueMoisture } = result;
  
  let peakPressureTime = 0;
  for (const point of timeSeries) {
    if (point.pressure >= peakPressure) {
      peakPressureTime = point.time;
    }
  }
  
  let feasibility: "feasible" | "borderline" | "infeasible";
  if (!feasible) {
    feasibility = "infeasible";
  } else if (juiceYield < 30 || stableJuiceTime < 0) {
    feasibility = "borderline";
  } else {
    feasibility = "feasible";
  }
  
  const yieldScore = Math.min(100, juiceYield * 1.2);
  const stabilityScore = stableJuiceTime > 0 ? Math.max(0, 100 - stableJuiceTime * 1.5) : 30;
  const pressureScore = peakPressure > 800 ? 0 : Math.min(100, peakPressure / 8);
  const overallScore = Math.round((yieldScore * 0.4 + stabilityScore * 0.3 + pressureScore * 0.3) * 10) / 10;
  
  return {
    totalDuration: timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].time : 0,
    peakPressure,
    peakPressureTime,
    totalJuice,
    theoreticalWater,
    juiceYield,
    residueMoisture,
    stableJuiceTime,
    feasibility,
    overallScore,
  };
}

export function analyzePressStages(
  result: SimulationResult
): PressStageAnalysis[] {
  const { timeSeries, theoreticalWater } = result;
  if (timeSeries.length < 3) return [];
  
  const stages: PressStageAnalysis[] = [];
  
  const initialPressure = timeSeries[0].pressure;
  let rapidCompressionEnd = 0;
  for (let i = 1; i < timeSeries.length; i++) {
    const compressionRate = (timeSeries[i].compression - timeSeries[i - 1].compression) / (timeSeries[i].time - timeSeries[i - 1].time);
    if (compressionRate < 0.005 && timeSeries[i].time > 10) {
      rapidCompressionEnd = timeSeries[i].time;
      break;
    }
  }
  if (rapidCompressionEnd === 0) rapidCompressionEnd = Math.min(30, timeSeries[timeSeries.length - 1].time * 0.3);
  
  const stableStart = result.stableJuiceTime > 0 ? result.stableJuiceTime : timeSeries[timeSeries.length - 1].time;
  
  function calculateStageStats(startIdx: number, endIdx: number): { avgPressure: number; juiceProduced: number; juiceRate: number } {
    if (startIdx > endIdx || endIdx >= timeSeries.length) {
      return { avgPressure: 0, juiceProduced: 0, juiceRate: 0 };
    }
    let pressureSum = 0;
    for (let i = startIdx; i <= endIdx; i++) {
      pressureSum += timeSeries[i].pressure;
    }
    const avgPressure = pressureSum / (endIdx - startIdx + 1);
    const juiceProduced = timeSeries[endIdx].juice - timeSeries[startIdx].juice;
    const duration = timeSeries[endIdx].time - timeSeries[startIdx].time;
    const juiceRate = duration > 0 ? juiceProduced / duration : 0;
    return { avgPressure, juiceProduced, juiceRate };
  }
  
  function findTimeIndex(time: number): number {
    for (let i = 0; i < timeSeries.length; i++) {
      if (timeSeries[i].time >= time) return i;
    }
    return timeSeries.length - 1;
  }
  
  const rapidIdx = findTimeIndex(rapidCompressionEnd);
  const rapidStats = calculateStageStats(0, rapidIdx);
  stages.push({
    stageName: "初始压缩阶段",
    startTime: 0,
    endTime: rapidCompressionEnd,
    avgPressure: rapidStats.avgPressure,
    juiceProduced: rapidStats.juiceProduced,
    juiceRate: rapidStats.juiceRate,
    description: "压盘快速下降，果料被初步压实，出汁速率较低，主要为自由水分流出。",
  });
  
  const mainStartIdx = rapidIdx + 1;
  const stableIdx = findTimeIndex(stableStart);
  const mainEndIdx = Math.min(stableIdx, timeSeries.length - 1);
  if (mainStartIdx < mainEndIdx) {
    const mainStats = calculateStageStats(mainStartIdx, mainEndIdx);
    stages.push({
      stageName: "主出汁阶段",
      startTime: rapidCompressionEnd,
      endTime: stableStart,
      avgPressure: mainStats.avgPressure,
      juiceProduced: mainStats.juiceProduced,
      juiceRate: mainStats.juiceRate,
      description: "压力持续作用，细胞液被挤出，出汁速率最高，是主要的产汁阶段。",
    });
  }
  
  const tailStartIdx = mainEndIdx + 1;
  if (tailStartIdx < timeSeries.length - 1) {
    const tailStats = calculateStageStats(tailStartIdx, timeSeries.length - 1);
    stages.push({
      stageName: "尾段稳定阶段",
      startTime: stableStart,
      endTime: timeSeries[timeSeries.length - 1].time,
      avgPressure: tailStats.avgPressure,
      juiceProduced: tailStats.juiceProduced,
      juiceRate: tailStats.juiceRate,
      description: "出汁速率显著下降，趋于稳定，大部分可提取汁液已被榨出。",
    });
  }
  
  return stages;
}

export function generateExperimentReport(
  name: string,
  params: PressParams,
  result: SimulationResult,
  options?: { planId?: string; tags?: string[]; notes?: string }
): ExperimentReport {
  const summary = generateExperimentSummary(result);
  const stageAnalysis = analyzePressStages(result);
  const diagnosis = generateDiagnosis(params, result);
  
  return {
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `实验报告 ${new Date().toLocaleString("zh-CN")}`,
    planId: options?.planId,
    createdAt: Date.now(),
    params: { ...params },
    result: { ...result },
    summary,
    stageAnalysis,
    diagnosis,
    tags: options?.tags || [],
    notes: options?.notes,
  };
}

export function compareParams(
  oldParams: PressParams,
  newParams: PressParams,
  oldResult?: SimulationResult,
  newResult?: SimulationResult
): { paramChanges: ParameterComparison[]; resultChanges: ResultComparison[]; improvementScore: number } {
  const paramChanges: ParameterComparison[] = [];
  
  for (const key of Object.keys(PARAM_LABELS) as (keyof PressParams)[]) {
    const oldVal = oldParams[key];
    const newVal = newParams[key];
    const delta = newVal - oldVal;
    const deltaPercent = oldVal !== 0 ? (delta / Math.abs(oldVal)) * 100 : 0;
    
    let impact: "positive" | "negative" | "neutral" = "neutral";
    let impactDescription = "无明显影响";
    
    if (delta !== 0) {
      switch (key) {
        case "leverLength":
          impact = delta > 0 ? "positive" : "negative";
          impactDescription = delta > 0 ? "杠杆加长，机械增益增大" : "杠杆缩短，机械增益减小";
          break;
        case "fulcrumPosition":
          impact = delta > 0 ? "positive" : "negative";
          impactDescription = delta > 0 ? "挂点外移，压力增大" : "挂点内移，压力减小";
          break;
        case "plateDiameter":
          impact = delta > 0 ? "negative" : "positive";
          impactDescription = delta > 0 ? "压盘加大，压强减小" : "压盘缩小，压强增大";
          break;
        case "stoneWeight":
          impact = delta > 0 ? "positive" : "negative";
          impactDescription = delta > 0 ? "压石增重，压力增大" : "压石减重，压力减小";
          break;
        case "fruitWeight":
          impact = delta > 0 ? "positive" : "negative";
          impactDescription = delta > 0 ? "果料增加，总产汁量提升" : "果料减少，总产汁量下降";
          break;
        case "moistureContent":
          impact = delta > 0 ? "positive" : "negative";
          impactDescription = delta > 0 ? "含水率提高，理论含水量增加" : "含水率降低，理论含水量减少";
          break;
      }
    }
    
    paramChanges.push({
      paramKey: key,
      paramLabel: PARAM_LABELS[key].label,
      oldValue: oldVal,
      newValue: newVal,
      delta,
      deltaPercent,
      unit: PARAM_LABELS[key].unit,
      impact,
      impactDescription,
    });
  }
  
  const resultChanges: ResultComparison[] = [];
  let improvementScore = 0;
  
  if (oldResult && newResult) {
    let scoreChanges = 0;
    let metricCount = 0;
    
    for (const key of Object.keys(METRIC_LABELS)) {
      const oldVal = (oldResult as unknown as Record<string, number>)[key];
      const newVal = (newResult as unknown as Record<string, number>)[key];
      if (oldVal === undefined || newVal === undefined) continue;
      
      const delta = newVal - oldVal;
      const deltaPercent = oldVal !== 0 ? (delta / Math.abs(oldVal)) * 100 : 0;
      const metricInfo = METRIC_LABELS[key];
      const better = metricInfo.lowerBetter ? delta < 0 : delta > 0;
      
      if (delta !== 0) {
        scoreChanges += better ? Math.abs(deltaPercent) : -Math.abs(deltaPercent) * 0.5;
        metricCount++;
      }
      
      resultChanges.push({
        metricKey: key,
        metricLabel: metricInfo.label,
        oldValue: oldVal,
        newValue: newVal,
        delta,
        deltaPercent,
        unit: metricInfo.unit,
        better,
        isTime: metricInfo.isTime,
      });
    }
    
    improvementScore = metricCount > 0 ? Math.round(scoreChanges / metricCount * 10) / 10 : 0;
  }
  
  return { paramChanges, resultChanges, improvementScore };
}

export function createAdjustmentRecord(
  previousParams: PressParams,
  newParams: PressParams,
  previousResult?: SimulationResult,
  newResult?: SimulationResult
): StructureAdjustmentRecord {
  const { paramChanges, resultChanges, improvementScore } = compareParams(
    previousParams,
    newParams,
    previousResult,
    newResult
  );
  
  return {
    id: `adj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    previousParams: { ...previousParams },
    newParams: { ...newParams },
    previousResult: previousResult ? { ...previousResult } : undefined,
    newResult: newResult ? { ...newResult } : undefined,
    paramChanges,
    resultChanges,
    improvementScore,
  };
}

function generateDiagnosis(
  params: PressParams,
  result: SimulationResult
): import("../types").DiagnosisReport {
  const { feasible, peakPressure, juiceYield, stableJuiceTime, residueMoisture, theoreticalWater } = result;
  const anomalies: import("../types").AnomalyIssue[] = [];
  const suggestions: import("../types").OptimizationSuggestion[] = [];
  
  if (!feasible) {
    anomalies.push({
      id: "anom_1",
      severity: "critical",
      category: "可行性",
      title: "方案不可行",
      description: result.infeasibleReason || "当前参数组合无法产生有效出汁。",
      affectedMetric: "feasibility",
    });
  }
  
  if (peakPressure > 700 && feasible) {
    anomalies.push({
      id: "anom_high_pressure",
      severity: "warning",
      category: "压力安全",
      title: "压力接近上限",
      description: `峰值压力 ${peakPressure.toFixed(0)} kPa 已接近安全上限 800 kPa，可能对设备造成损害。`,
      affectedMetric: "peakPressure",
    });
  }
  
  if (peakPressure < 100 && feasible) {
    anomalies.push({
      id: "anom_low_pressure",
      severity: "warning",
      category: "效率",
      title: "压力偏低",
      description: `峰值压力仅 ${peakPressure.toFixed(0)} kPa，压榨效率可能不足。`,
      affectedMetric: "peakPressure",
    });
  }
  
  if (juiceYield < 40 && feasible) {
    anomalies.push({
      id: "anom_low_yield",
      severity: "warning",
      category: "效率",
      title: "出汁率偏低",
      description: `出汁率仅 ${juiceYield.toFixed(1)}%，低于良好水平（40%）。`,
      affectedMetric: "juiceYield",
    });
  }
  
  if (stableJuiceTime < 0 && feasible) {
    anomalies.push({
      id: "anom_no_stable",
      severity: "info",
      category: "效率",
      title: "未达稳定出汁",
      description: "在模拟时间内出汁速率持续下降，未达到明显的稳定平台期。",
      affectedMetric: "stableJuiceTime",
    });
  }
  
  if (residueMoisture > 50 && feasible) {
    anomalies.push({
      id: "anom_high_residue",
      severity: "info",
      category: "效率",
      title: "残渣含水率偏高",
      description: `残渣含水率仍有 ${residueMoisture.toFixed(1)}%，仍有汁液未被充分提取。`,
      affectedMetric: "residueMoisture",
    });
  }
  
  if (peakPressure < 400 && feasible) {
    suggestions.push({
      id: "sug_inc_pressure",
      priority: "high",
      category: "压力优化",
      title: "提升压榨压力",
      description: "当前压力偏低，增加压力可显著提高出汁率和缩短压榨时间。",
      expectedImprovement: "出汁率提升 10-25%",
      targetMetric: "juiceYield",
      paramAdjustments: [
        { key: "stoneWeight", direction: "increase", magnitude: "medium" },
        { key: "leverLength", direction: "increase", magnitude: "small" },
      ],
    });
  }
  
  if (params.moistureContent < 50 && feasible) {
    suggestions.push({
      id: "sug_inc_moisture",
      priority: "high",
      category: "物料优化",
      title: "提高果料含水率",
      description: "果料含水率偏低会导致汁液粘稠难以提取，适当提高含水率可增加总产汁量。",
      expectedImprovement: "总产汁量显著增加",
      targetMetric: "totalJuice",
      paramAdjustments: [
        { key: "moistureContent", direction: "increase", magnitude: "medium" },
      ],
    });
  }
  
  if (peakPressure > 600 && juiceYield < 60 && feasible) {
    suggestions.push({
      id: "sug_balance",
      priority: "medium",
      category: "参数平衡",
      title: "平衡压力与效率",
      description: "压力已较高但出汁率仍不理想，可能需要优化压盘尺寸或延长压榨时间。",
      expectedImprovement: "效率提升 5-15%",
      targetMetric: "juiceYield",
      paramAdjustments: [
        { key: "plateDiameter", direction: "decrease", magnitude: "small" },
      ],
    });
  }
  
  if (stableJuiceTime > 60 && feasible) {
    suggestions.push({
      id: "sug_fast_stable",
      priority: "medium",
      category: "效率优化",
      title: "加快压榨进程",
      description: `稳定出汁时间长达 ${stableJuiceTime.toFixed(0)} 秒，可通过增加压力或优化压盘来加速。`,
      expectedImprovement: "稳定时间缩短 20-40%",
      targetMetric: "stableJuiceTime",
      paramAdjustments: [
        { key: "fulcrumPosition", direction: "increase", magnitude: "small" },
        { key: "stoneWeight", direction: "increase", magnitude: "small" },
      ],
    });
  }
  
  if (peakPressure > 750 && feasible) {
    suggestions.push({
      id: "sug_safety",
      priority: "high",
      category: "安全优化",
      title: "降低压力确保安全",
      description: "当前压力接近安全上限，建议适当降低以保护设备和操作人员安全。",
      expectedImprovement: "设备安全性提升",
      targetMetric: "peakPressure",
      paramAdjustments: [
        { key: "stoneWeight", direction: "decrease", magnitude: "medium" },
        { key: "plateDiameter", direction: "increase", magnitude: "small" },
      ],
    });
  }
  
  if (feasible && juiceYield > 50) {
    suggestions.push({
      id: "sug_capacity",
      priority: "low",
      category: "产能提升",
      title: "增加果料装填量",
      description: "当前参数组合压榨效果良好，可考虑增加果料重量以提高单次产能。",
      expectedImprovement: "单次产汁量提升",
      targetMetric: "totalJuice",
      paramAdjustments: [
        { key: "fruitWeight", direction: "increase", magnitude: "medium" },
      ],
    });
  }
  
  let overallAssessment = "";
  let efficiencyRating: "excellent" | "good" | "fair" | "poor" = "poor";
  
  if (!feasible) {
    overallAssessment = "当前方案不可行，需要调整参数以达到有效压榨条件。";
    efficiencyRating = "poor";
  } else if (juiceYield >= 60 && stableJuiceTime > 0 && stableJuiceTime < 40) {
    overallAssessment = "压榨效果优秀，出汁率高且压榨速度快，是高效的参数组合。";
    efficiencyRating = "excellent";
  } else if (juiceYield >= 45) {
    overallAssessment = "压榨效果良好，出汁率达标，可进一步优化以提升效率。";
    efficiencyRating = "good";
  } else if (juiceYield >= 25) {
    overallAssessment = "压榨效果一般，出汁率偏低，建议优化压力或物料参数。";
    efficiencyRating = "fair";
  } else {
    overallAssessment = "压榨效果较差，需要较大幅度的参数调整。";
    efficiencyRating = "poor";
  }
  
  return {
    anomalies,
    suggestions,
    overallAssessment,
    efficiencyRating,
  };
}
