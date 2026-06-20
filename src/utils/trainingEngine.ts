import {
  PressParams,
  SimulationResult,
  TrainingTask,
  ScoreDimension,
  TrainingError,
  TrainingFeedback,
  TrainingResult,
} from "../types";

export const TRAINING_TASKS: TrainingTask[] = [
  {
    id: "task_basic_01",
    title: "基础操作：认识压榨机参数",
    description:
      "通过调整基本参数，了解杠杆长度、压石重量、果料重量等核心参数对出汁效果的影响。完成一次完整的压榨实验，观察压力和出汁量的变化。",
    difficulty: "beginner",
    mode: "teaching",
    duration: 15,
    tags: ["入门", "基础操作", "参数认识"],
    learningObjectives: [
      "理解杠杆长度对压力放大的影响",
      "掌握压石重量与压力的关系",
      "了解果料含水率对出汁率的影响",
      "能够独立完成一次完整的模拟实验",
    ],
    passScore: 60,
    targets: {
      minJuiceYield: 30,
      maxPeakPressure: 800,
    },
    steps: [
      {
        id: "step_1",
        title: "设置结构参数",
        description:
          "调整杠杆长度至 3.5m 左右，压盘直径设置为 0.35m，压石挂点位置约 75%。观察侧视图中结构的变化。",
        hint: "杠杆越长，相同重量产生的压力越大；挂点越靠近末端，机械效益越高。",
        expectedAction: "set_param",
        paramTargets: { leverLength: 3.5, plateDiameter: 0.35, fulcrumPosition: 0.75 },
      },
      {
        id: "step_2",
        title: "设置载荷与物料参数",
        description:
          "将压石重量设置为 120kg，果料重量 50kg，果料含水率 75%。",
        hint: "压石重量直接决定了施加在果料上的总压力，含水率越高理论出汁量越大。",
        expectedAction: "set_param",
        paramTargets: { stoneWeight: 120, fruitWeight: 50, moistureContent: 75 },
      },
      {
        id: "step_3",
        title: "启动模拟实验",
        description: "点击「开始模拟」按钮，观察压力曲线和出汁量的变化过程。",
        hint: "模拟过程中可以看到压力随时间变化的曲线，以及果汁逐渐流出的过程。",
        expectedAction: "start_simulation",
      },
      {
        id: "step_4",
        title: "分析实验结果",
        description:
          "实验完成后，检查出汁率是否达到 30% 以上，峰值压力是否在安全范围内（≤800kPa）。",
        hint: "如果出汁率偏低，可以尝试增加压石重量或调整挂点位置。",
        expectedAction: "check_result",
      },
    ],
  },
  {
    id: "task_efficiency_01",
    title: "效率优化：追求高出汁率",
    description:
      "目标：通过合理的参数配置，使出汁率达到 50% 以上，同时保证峰值压力不超过 700kPa，稳定出汁时间不超过 60s。需要综合考虑结构参数、载荷和物料的平衡。",
    difficulty: "intermediate",
    mode: "practice",
    duration: 20,
    tags: ["进阶", "效率优化", "参数平衡"],
    learningObjectives: [
      "掌握多参数协同优化的方法",
      "理解出汁率与压力之间的权衡关系",
      "学会分析不同参数组合的综合效果",
    ],
    passScore: 70,
    targets: {
      minJuiceYield: 50,
      maxPeakPressure: 700,
      maxStableJuiceTime: 60,
    },
    steps: [
      {
        id: "step_1",
        title: "制定优化策略",
        description:
          "分析任务目标：出汁率 ≥50%、压力 ≤700kPa、稳定时间 ≤60s。思考哪些参数应该调高，哪些应该降低。",
        hint:
          "高出汁率需要足够的压力，但压力过高会超出安全范围。可以通过增加杠杆长度或增大压盘面积来分散压力。",
        expectedAction: "set_param",
      },
      {
        id: "step_2",
        title: "配置高产出参数",
        description:
          "尝试使用较长的杠杆（4m以上）和适中的压石重量（100-140kg），确保挂点位置合理（70%-85%）。",
        hint: "杠杆机械效益 = 杠杆长度 × 挂点位置，这个值越大越省力。",
        expectedAction: "set_param",
      },
      {
        id: "step_3",
        title: "运行并记录数据",
        description: "启动模拟，密切关注压力峰值和出汁速率。",
        hint: "如果压力超标，尝试增大压盘直径或略微降低压石重量。",
        expectedAction: "start_simulation",
      },
      {
        id: "step_4",
        title: "迭代优化",
        description:
          "根据结果调整参数，重复实验直到满足所有目标要求。记录你的最优参数组合。",
        hint: "每次只调整一个参数，便于观察其影响效果。",
        expectedAction: "check_result",
      },
    ],
  },
  {
    id: "task_safety_01",
    title: "安全运行：低压高效压榨",
    description:
      "考核目标：在峰值压力不超过 400kPa 的严格条件下，尽可能获得较高的出汁率（≥40%）。考验你对压榨机结构力学的理解程度。",
    difficulty: "advanced",
    mode: "exam",
    duration: 25,
    tags: ["考核", "安全优先", "高级技巧"],
    learningObjectives: [
      "深入理解杠杆力学与压强的关系",
      "掌握在安全约束下优化效率的策略",
      "理解压盘面积对压强的分散作用",
    ],
    passScore: 75,
    targets: {
      minJuiceYield: 40,
      maxPeakPressure: 400,
    },
    steps: [
      {
        id: "step_1",
        title: "分析约束条件",
        description:
          "压力限制非常严格（400kPa），这意味着需要通过结构设计来降低压强，同时保证足够的压榨力。",
        hint: "压强 = 压力 / 面积。要降低压强，可以增大压盘直径，将压力分散到更大的面积上。",
        expectedAction: "set_param",
      },
      {
        id: "step_2",
        title: "设计大压盘方案",
        description:
          "使用较大的压盘直径（≥0.45m），配合长杠杆（≥4.5m）和合理的挂点位置。",
        hint:
          "大压盘虽然降低了压强，但总压榨力仍然由杠杆和压石决定。长杠杆可以用较小的压石获得足够的压力。",
        expectedAction: "set_param",
      },
      {
        id: "step_3",
        title: "精细调整参数",
        description:
          "调整压石重量、果料参数，找到压力和出汁率的最佳平衡点。",
        hint: "果料含水率对出汁率影响很大，高含水率物料更容易达到高出汁率目标。",
        expectedAction: "set_param",
      },
      {
        id: "step_4",
        title: "完成考核实验",
        description:
          "运行最终方案并提交结果。确保同时满足出汁率和压力两个硬性指标。",
        expectedAction: "start_simulation",
      },
    ],
  },
  {
    id: "task_structure_01",
    title: "结构合理性分析",
    description:
      "给定一组目标参数（杠杆长4.5m、压石150kg、挂点85%、压盘0.4m、果料50kg/75%），请验证该方案的可行性，分析结构是否合理，并解释原因。",
    difficulty: "intermediate",
    mode: "teaching",
    duration: 15,
    tags: ["结构分析", "理论验证", "教学"],
    learningObjectives: [
      "学会评估参数配置的合理性",
      "理解结构参数对实验结果的影响机制",
      "能够识别不合理的参数组合",
    ],
    passScore: 65,
    targets: {
      targetParams: {
        leverLength: 4.5,
        stoneWeight: 150,
        fulcrumPosition: 0.85,
        plateDiameter: 0.4,
        fruitWeight: 50,
        moistureContent: 75,
      },
      paramTolerance: 0.05,
      maxPeakPressure: 900,
    },
    steps: [
      {
        id: "step_1",
        title: "按目标设置参数",
        description:
          "严格按照任务要求设置各项参数：杠杆4.5m、压石150kg、挂点85%、压盘0.4m、果料50kg、含水率75%。",
        hint: "参数偏差将直接影响得分，请尽可能准确设置。",
        expectedAction: "set_param",
        paramTargets: {
          leverLength: 4.5,
          stoneWeight: 150,
          fulcrumPosition: 0.85,
          plateDiameter: 0.4,
          fruitWeight: 50,
          moistureContent: 75,
        },
      },
      {
        id: "step_2",
        title: "预测实验结果",
        description:
          "在运行模拟之前，先思考：这组参数会产生多高的压力？出汁率大约是多少？是否存在安全隐患？",
        hint:
          "计算参考：机械效益 ≈ 4.5 × 0.85 ≈ 3.8，总压力 ≈ 150 × 9.8 × 3.8 ≈ 5586N，压盘面积 ≈ 0.126m²，压强 ≈ 44kPa... 不对，实际模型更复杂。",
        expectedAction: "start_simulation",
      },
      {
        id: "step_3",
        title: "运行并对比分析",
        description:
          "启动模拟，记录实际的峰值压力、出汁率和稳定时间，与你的预测进行对比。",
        expectedAction: "check_result",
      },
    ],
  },
];

const DIMENSION_WEIGHTS: Record<ScoreDimension["key"], number> = {
  params: 0.25,
  pressure: 0.25,
  efficiency: 0.35,
  structure: 0.15,
};

const DIMENSION_LABELS: Record<ScoreDimension["key"], string> = {
  params: "参数设置",
  pressure: "压力控制",
  efficiency: "出汁效率",
  structure: "结构合理性",
};

export function getTrainingTasks(): TrainingTask[] {
  return TRAINING_TASKS;
}

export function getTaskById(id: string): TrainingTask | undefined {
  return TRAINING_TASKS.find((t) => t.id === id);
}

export function calculateParamScore(
  params: PressParams,
  task: TrainingTask
): ScoreDimension {
  const maxScore = 25;
  const { targets } = task;
  let score = maxScore;
  const details: string[] = [];

  if (targets.targetParams) {
    const tolerance = targets.paramTolerance ?? 0.1;
    const paramKeys = Object.keys(targets.targetParams) as (keyof PressParams)[];
    let matchCount = 0;

    paramKeys.forEach((key) => {
      const target = targets.targetParams![key]!;
      const actual = params[key];
      let isPercent = false;
      let diff = 0;

      if (key === "fulcrumPosition" || key === "moistureContent") {
        isPercent = true;
        diff = Math.abs(actual - target);
      } else if (key === "leverLength" || key === "plateDiameter") {
        diff = Math.abs(actual - target) / target;
      } else {
        diff = Math.abs(actual - target) / target;
      }

      if (diff <= tolerance) {
        matchCount++;
      }
    });

    const accuracy = matchCount / paramKeys.length;
    score = Math.round(maxScore * accuracy);

    if (accuracy === 1) {
      details.push("所有参数设置完全符合目标要求");
    } else if (accuracy >= 0.7) {
      details.push(`参数设置准确率 ${(accuracy * 100).toFixed(0)}%，基本符合要求`);
    } else {
      details.push(`参数设置准确率仅 ${(accuracy * 100).toFixed(0)}%，需要改进`);
    }
  } else {
    details.push("本任务未指定精确参数目标，按默认标准评分");
    if (params.leverLength >= 2 && params.leverLength <= 6) {
      score -= 0;
    } else {
      score -= 5;
      details.push("杠杆长度取值范围不合理");
    }
    if (params.plateDiameter >= 0.2 && params.plateDiameter <= 0.6) {
      score -= 0;
    } else {
      score -= 5;
      details.push("压盘直径取值范围不合理");
    }
    if (params.stoneWeight >= 30 && params.stoneWeight <= 300) {
      score -= 0;
    } else {
      score -= 5;
      details.push("压石重量取值范围不合理");
    }
  }

  return {
    key: "params",
    label: DIMENSION_LABELS.params,
    score: Math.max(0, score),
    maxScore,
    weight: DIMENSION_WEIGHTS.params,
    details: details.join("；"),
  };
}

export function calculatePressureScore(
  result: SimulationResult | null,
  task: TrainingTask
): ScoreDimension {
  const maxScore = 25;
  let score = maxScore;
  const details: string[] = [];

  if (!result) {
    return {
      key: "pressure",
      label: DIMENSION_LABELS.pressure,
      score: 0,
      maxScore,
      weight: DIMENSION_WEIGHTS.pressure,
      details: "未完成模拟实验，无法评估压力控制",
    };
  }

  const maxAllowedPressure = task.targets.maxPeakPressure ?? 800;

  if (result.peakPressure <= maxAllowedPressure) {
    const ratio = result.peakPressure / maxAllowedPressure;
    if (ratio <= 0.6) {
      details.push(`峰值压力 ${result.peakPressure.toFixed(0)}kPa，控制优秀，安全余量充足`);
    } else if (ratio <= 0.85) {
      details.push(`峰值压力 ${result.peakPressure.toFixed(0)}kPa，控制良好，在安全范围内`);
      score -= 3;
    } else {
      details.push(`峰值压力 ${result.peakPressure.toFixed(0)}kPa，接近安全上限，需注意`);
      score -= 6;
    }
  } else {
    const overRatio = (result.peakPressure - maxAllowedPressure) / maxAllowedPressure;
    if (overRatio <= 0.1) {
      score -= 10;
      details.push(`峰值压力 ${result.peakPressure.toFixed(0)}kPa，略微超过安全限制 ${maxAllowedPressure}kPa`);
    } else if (overRatio <= 0.3) {
      score -= 18;
      details.push(`峰值压力 ${result.peakPressure.toFixed(0)}kPa，明显超过安全限制`);
    } else {
      score = 0;
      details.push(`峰值压力 ${result.peakPressure.toFixed(0)}kPa，严重超标，存在安全隐患`);
    }
  }

  return {
    key: "pressure",
    label: DIMENSION_LABELS.pressure,
    score: Math.max(0, score),
    maxScore,
    weight: DIMENSION_WEIGHTS.pressure,
    details: details.join("；"),
  };
}

export function calculateEfficiencyScore(
  result: SimulationResult | null,
  task: TrainingTask
): ScoreDimension {
  const maxScore = 35;
  let score = maxScore;
  const details: string[] = [];

  if (!result) {
    return {
      key: "efficiency",
      label: DIMENSION_LABELS.efficiency,
      score: 0,
      maxScore,
      weight: DIMENSION_WEIGHTS.efficiency,
      details: "未完成模拟实验，无法评估出汁效率",
    };
  }

  const minYield = task.targets.minJuiceYield ?? 30;
  if (result.juiceYield >= minYield) {
    const exceedRatio = (result.juiceYield - minYield) / minYield;
    if (exceedRatio >= 0.3) {
      details.push(`出汁率 ${result.juiceYield.toFixed(1)}%，远超目标 ${minYield}%，表现优秀`);
    } else if (exceedRatio >= 0.1) {
      details.push(`出汁率 ${result.juiceYield.toFixed(1)}%，优于目标 ${minYield}%`);
      score -= 3;
    } else {
      details.push(`出汁率 ${result.juiceYield.toFixed(1)}%，刚好达到目标 ${minYield}%`);
      score -= 6;
    }
  } else {
    const gapRatio = (minYield - result.juiceYield) / minYield;
    if (gapRatio <= 0.15) {
      score -= 10;
      details.push(`出汁率 ${result.juiceYield.toFixed(1)}%，略低于目标 ${minYield}%`);
    } else if (gapRatio <= 0.4) {
      score -= 22;
      details.push(`出汁率 ${result.juiceYield.toFixed(1)}%，明显低于目标 ${minYield}%`);
    } else {
      score = 5;
      details.push(`出汁率 ${result.juiceYield.toFixed(1)}%，远低于目标 ${minYield}%`);
    }
  }

  if (task.targets.maxStableJuiceTime && result.stableJuiceTime > 0) {
    const maxTime = task.targets.maxStableJuiceTime;
    if (result.stableJuiceTime <= maxTime) {
      details.push(`稳定出汁时间 ${result.stableJuiceTime.toFixed(0)}s，符合要求`);
    } else {
      score -= 5;
      details.push(`稳定出汁时间 ${result.stableJuiceTime.toFixed(0)}s，超过目标 ${maxTime}s`);
    }
  }

  if (task.targets.maxResidueMoisture !== undefined) {
    if (result.residueMoisture <= task.targets.maxResidueMoisture) {
      details.push(`残渣含水率 ${result.residueMoisture.toFixed(1)}%，达标`);
    } else {
      score -= 5;
      details.push(`残渣含水率 ${result.residueMoisture.toFixed(1)}%，偏高`);
    }
  }

  return {
    key: "efficiency",
    label: DIMENSION_LABELS.efficiency,
    score: Math.max(0, score),
    maxScore,
    weight: DIMENSION_WEIGHTS.efficiency,
    details: details.join("；"),
  };
}

export function calculateStructureScore(
  params: PressParams,
  result: SimulationResult | null,
  task: TrainingTask
): ScoreDimension {
  const maxScore = 15;
  let score = maxScore;
  const details: string[] = [];

  const mechanicalAdvantage = params.leverLength * params.fulcrumPosition;
  if (mechanicalAdvantage >= 2 && mechanicalAdvantage <= 5) {
    details.push(`机械效益 ${mechanicalAdvantage.toFixed(2)}，结构设计合理`);
  } else if (mechanicalAdvantage < 2) {
    score -= 5;
    details.push(`机械效益 ${mechanicalAdvantage.toFixed(2)}，偏低，杠杆设计不够省力`);
  } else {
    score -= 4;
    details.push(`机械效益 ${mechanicalAdvantage.toFixed(2)}，偏高，结构稳定性可能受影响`);
  }

  const plateArea = Math.PI * Math.pow(params.plateDiameter / 2, 2);
  const pressurePerArea = result ? result.peakPressure / plateArea : 0;

  if (params.plateDiameter >= 0.3 && params.plateDiameter <= 0.5) {
    details.push(`压盘直径 Ø${params.plateDiameter.toFixed(2)}m，尺寸合适`);
  } else if (params.plateDiameter < 0.3) {
    score -= 4;
    details.push(`压盘直径 Ø${params.plateDiameter.toFixed(2)}m，偏小，压强集中`);
  } else {
    score -= 3;
    details.push(`压盘直径 Ø${params.plateDiameter.toFixed(2)}m，偏大，操作不便`);
  }

  const stoneToFruitRatio = params.stoneWeight / params.fruitWeight;
  if (stoneToFruitRatio >= 1.5 && stoneToFruitRatio <= 4) {
    details.push(`料石比 ${stoneToFruitRatio.toFixed(2)}:1，比例合理`);
  } else if (stoneToFruitRatio < 1.5) {
    score -= 3;
    details.push(`料石比 ${stoneToFruitRatio.toFixed(2)}:1，压石相对偏轻`);
  } else {
    score -= 2;
    details.push(`料石比 ${stoneToFruitRatio.toFixed(2)}:1，压石相对偏重`);
  }

  if (task.targets.targetParams) {
    const pressureRatio = result ? result.peakPressure / (task.targets.maxPeakPressure ?? 800) : 0;
    if (pressureRatio > 1 && score > 0) {
      score -= 2;
    }
  }

  return {
    key: "structure",
    label: DIMENSION_LABELS.structure,
    score: Math.max(0, score),
    maxScore,
    weight: DIMENSION_WEIGHTS.structure,
    details: details.join("；"),
  };
}

export function detectErrors(
  params: PressParams,
  result: SimulationResult | null,
  task: TrainingTask
): TrainingError[] {
  const errors: TrainingError[] = [];
  let errId = 0;

  if (task.targets.targetParams) {
    const tolerance = task.targets.paramTolerance ?? 0.1;
    (Object.keys(task.targets.targetParams) as (keyof PressParams)[]).forEach((key) => {
      const target = task.targets.targetParams![key]!;
      const actual = params[key];
      let diff = 0;
      if (key === "leverLength" || key === "plateDiameter" || key === "stoneWeight" || key === "fruitWeight") {
        diff = Math.abs(actual - target) / target;
      } else {
        diff = Math.abs(actual - target);
      }
      if (diff > tolerance) {
        errors.push({
          id: `err_${errId++}`,
          category: "param_error",
          severity: diff > tolerance * 2 ? "critical" : "warning",
          title: `${key} 参数设置偏差`,
          description: `当前值 ${actual}，目标值 ${target}，偏差超过允许范围`,
          relatedParam: key,
          suggestion: `将该参数调整至 ${target} 附近（允许偏差 ${(tolerance * 100).toFixed(0)}%）`,
        });
      }
    });
  }

  if (params.leverLength < 1.5) {
    errors.push({
      id: `err_${errId++}`,
      category: "param_error",
      severity: "warning",
      title: "杠杆长度过短",
      description: `杠杆长度仅 ${params.leverLength}m，机械效益不足`,
      relatedParam: "leverLength",
      suggestion: "建议增加杠杆长度至 3m 以上以获得更好的机械效益",
    });
  }

  if (params.plateDiameter < 0.2) {
    errors.push({
      id: `err_${errId++}`,
      category: "param_error",
      severity: "warning",
      title: "压盘直径过小",
      description: `压盘直径仅 Ø${params.plateDiameter}m，会导致压强过高`,
      relatedParam: "plateDiameter",
      suggestion: "建议增大压盘直径至 0.3m 以上以分散压力",
    });
  }

  if (result) {
    const maxPressure = task.targets.maxPeakPressure ?? 800;
    if (result.peakPressure > maxPressure) {
      errors.push({
        id: `err_${errId++}`,
        category: "result_error",
        severity: result.peakPressure > maxPressure * 1.2 ? "critical" : "warning",
        title: "峰值压力超标",
        description: `峰值压力 ${result.peakPressure.toFixed(0)}kPa 超过安全限制 ${maxPressure}kPa`,
        suggestion: "尝试增大压盘直径、减少压石重量或调整挂点位置以降低压力",
      });
    }

    const minYield = task.targets.minJuiceYield ?? 30;
    if (result.juiceYield < minYield) {
      errors.push({
        id: `err_${errId++}`,
        category: "result_error",
        severity: result.juiceYield < minYield * 0.7 ? "critical" : "warning",
        title: "出汁率未达标",
        description: `实际出汁率 ${result.juiceYield.toFixed(1)}%，低于目标值 ${minYield}%`,
        suggestion: "可以增加压石重量、优化杠杆参数或提高果料含水率来提升出汁率",
      });
    }

    if (task.targets.maxStableJuiceTime && result.stableJuiceTime > task.targets.maxStableJuiceTime) {
      errors.push({
        id: `err_${errId++}`,
        category: "result_error",
        severity: "info",
        title: "稳定出汁时间偏长",
        description: `稳定时间 ${result.stableJuiceTime.toFixed(0)}s 超过目标 ${task.targets.maxStableJuiceTime}s`,
        suggestion: "优化参数组合可以加快压榨进程",
      });
    }
  }

  return errors;
}

export function generateFeedback(
  dimensions: ScoreDimension[],
  errors: TrainingError[],
  task: TrainingTask,
  params: PressParams,
  result: SimulationResult | null
): TrainingFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: TrainingFeedback["suggestions"] = [];
  const knowledgeGaps: string[] = [];
  const nextSteps: string[] = [];

  const paramDim = dimensions.find((d) => d.key === "params")!;
  const pressureDim = dimensions.find((d) => d.key === "pressure")!;
  const efficiencyDim = dimensions.find((d) => d.key === "efficiency")!;
  const structureDim = dimensions.find((d) => d.key === "structure")!;

  if (paramDim.score / paramDim.maxScore >= 0.8) {
    strengths.push("参数设置准确，理解了任务对参数的要求");
  } else {
    weaknesses.push("参数设置存在偏差，未完全按照任务要求配置");
    knowledgeGaps.push("需要加强对各参数含义和合理取值范围的理解");
  }

  if (pressureDim.score / pressureDim.maxScore >= 0.8) {
    strengths.push("压力控制良好，能够在安全范围内运行");
  } else {
    weaknesses.push("压力控制有待改进，存在超压风险");
    knowledgeGaps.push("需要理解压强与压力、受力面积之间的关系（P=F/S）");
  }

  if (efficiencyDim.score / efficiencyDim.maxScore >= 0.8) {
    strengths.push("出汁效率优秀，参数搭配合理");
  } else {
    weaknesses.push("出汁效率未达到理想水平");
    knowledgeGaps.push("需要掌握杠杆原理和多参数协同优化的方法");
  }

  if (structureDim.score / structureDim.maxScore >= 0.8) {
    strengths.push("结构设计合理，机械效益与稳定性平衡良好");
  } else {
    weaknesses.push("结构设计存在优化空间");
    knowledgeGaps.push("需要深入理解杠杆力学和压榨机结构设计原理");
  }

  const criticalErrors = errors.filter((e) => e.severity === "critical");
  const warningErrors = errors.filter((e) => e.severity === "warning");

  criticalErrors.slice(0, 3).forEach((err) => {
    suggestions.push({
      title: `【紧急】${err.title}`,
      description: err.description,
      priority: "high",
      expectedImprovement: err.suggestion,
    });
  });

  warningErrors.slice(0, 3).forEach((err) => {
    suggestions.push({
      title: err.title,
      description: err.description,
      priority: "medium",
      expectedImprovement: err.suggestion,
    });
  });

  if (result && result.juiceYield < 50) {
    suggestions.push({
      title: "提升出汁率优化建议",
      description: `当前出汁率 ${result.juiceYield.toFixed(1)}% 有较大提升空间`,
      priority: "medium",
      expectedImprovement:
        "建议：1) 增加杠杆长度至 4m 以上；2) 将挂点位置调至 75%-85%；3) 适当增加压石重量；4) 确认果料含水率在 70% 以上",
    });
  }

  if (result && result.peakPressure > 600) {
    suggestions.push({
      title: "降低运行压力建议",
      description: `当前峰值压力 ${result.peakPressure.toFixed(0)}kPa 偏高`,
      priority: result.peakPressure > 800 ? "high" : "medium",
      expectedImprovement:
        "建议增大压盘直径以分散压强，或适当降低压石重量。每增加 0.05m 直径，压强可降低约 20%-30%",
    });
  }

  if (strengths.length === 0) {
    nextSteps.push("回顾基础教程，理解各参数的物理含义");
  }
  if (weaknesses.length >= 2) {
    nextSteps.push("针对薄弱环节进行专项练习，每次只调整一个参数观察其影响");
  }
  if (result && result.feasible) {
    nextSteps.push("尝试进一步优化参数，挑战更高的出汁率目标");
  }
  nextSteps.push("完成本任务后，尝试更高难度的训练任务");

  return {
    strengths,
    weaknesses,
    suggestions,
    nextSteps,
    knowledgeGaps,
  };
}

export function calculateTrainingResult(
  task: TrainingTask,
  params: PressParams,
  result: SimulationResult | null,
  timeSpent: number,
  hintsUsed: number
): TrainingResult {
  const paramScore = calculateParamScore(params, task);
  const pressureScore = calculatePressureScore(result, task);
  const efficiencyScore = calculateEfficiencyScore(result, task);
  const structureScore = calculateStructureScore(params, result, task);

  const dimensions = [paramScore, pressureScore, efficiencyScore, structureScore];

  const weightedScore = dimensions.reduce(
    (sum, d) => sum + (d.score / d.maxScore) * d.weight * 100,
    0
  );

  const totalScore = Math.round(weightedScore);
  const maxScore = 100;
  const percentage = totalScore;

  let grade: TrainingResult["grade"];
  if (percentage >= 90) grade = "excellent";
  else if (percentage >= 75) grade = "good";
  else if (percentage >= task.passScore) grade = "pass";
  else grade = "fail";

  const passed = percentage >= task.passScore;
  const errors = detectErrors(params, result, task);
  const feedback = generateFeedback(dimensions, errors, task, params, result);

  return {
    id: `training_result_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    taskId: task.id,
    taskTitle: task.title,
    submittedAt: Date.now(),
    totalScore,
    maxScore,
    percentage,
    grade,
    passed,
    dimensions,
    errors,
    feedback,
    params: { ...params },
    result: result ? { ...result } : null,
    timeSpent,
    hintsUsed,
  };
}
