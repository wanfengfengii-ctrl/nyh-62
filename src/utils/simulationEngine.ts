import {
  PressParams,
  SimulationResult,
  TimeSeriesPoint,
  SIMULATION_DURATION,
  SIMULATION_DT,
  PRESSURE_THRESHOLD,
  JUICE_COEFFICIENT,
  COMPRESSION_TAU,
  GRAVITY,
  computePlateArea,
} from "../types";

export const PLATE_ARM_M = 0.6;

export function computePressure(params: PressParams): number {
  const stoneArmM = params.leverLength * params.fulcrumPosition;
  const mechanicalAdvantage = stoneArmM / PLATE_ARM_M;

  const stoneForce = params.stoneWeight * GRAVITY;
  const pressForce = stoneForce * mechanicalAdvantage;

  const plateArea = computePlateArea(params.plateDiameter);
  const pressurePa = pressForce / plateArea;
  return pressurePa / 1000;
}

export function computeTheoreticalWater(params: PressParams): number {
  return params.fruitWeight * 1000 * (params.moistureContent / 100);
}

export function computeMaxCompression(pressure: number): number {
  const MAX_PRESSURE_FOR_COMPRESSION = 500;
  return Math.min(0.7, pressure / MAX_PRESSURE_FOR_COMPRESSION);
}

export function detectStableJuiceTime(
  series: TimeSeriesPoint[],
  theoreticalWater: number
): number {
  if (series.length < 3) return -1;
  if (theoreticalWater <= 0) return -1;

  const stableThreshold = theoreticalWater * 0.005;
  const stableWindowSize = Math.max(4, Math.ceil(10 / SIMULATION_DT));

  for (let i = stableWindowSize; i < series.length; i++) {
    const windowStart = i - stableWindowSize;
    const startJuice = series[windowStart].juice;
    const endJuice = series[i].juice;
    const delta = endJuice - startJuice;

    if (delta <= stableThreshold && endJuice > theoreticalWater * 0.1) {
      return series[windowStart].time;
    }
  }
  return -1;
}

export function runFullSimulation(params: PressParams): SimulationResult {
  const pressure = computePressure(params);
  const theoreticalWater = computeTheoreticalWater(params);
  const timeSeries: TimeSeriesPoint[] = [];

  if (pressure < PRESSURE_THRESHOLD) {
    const initialPoint: TimeSeriesPoint = {
      time: 0,
      pressure,
      juice: 0,
      compression: 0,
    };
    return {
      peakPressure: pressure,
      totalJuice: 0,
      theoreticalWater,
      residueMoisture: params.moistureContent,
      juiceYield: 0,
      stableJuiceTime: -1,
      feasible: false,
      infeasibleReason: `压力不足（仅 ${pressure.toFixed(1)} kPa），低于临界阈值 ${PRESSURE_THRESHOLD} kPa，无法产生有效出汁。建议：增加压石重量（当前 ${params.stoneWeight}kg）、加长杠杆（当前 ${params.leverLength}m）、缩小压盘（当前 Ø${params.plateDiameter.toFixed(2)}m）或调高压石挂点（当前 ${(params.fulcrumPosition * 100).toFixed(0)}%）。`,
      timeSeries: [initialPoint],
    };
  }

  if (theoreticalWater <= 0) {
    return {
      peakPressure: pressure,
      totalJuice: 0,
      theoreticalWater: 0,
      residueMoisture: 0,
      juiceYield: 0,
      stableJuiceTime: -1,
      feasible: false,
      infeasibleReason: "果料理论含水量为 0，无汁液可提取。请增加果料重量或提高含水率。",
      timeSeries: [{ time: 0, pressure, juice: 0, compression: 0 }],
    };
  }

  if (params.moistureContent < 20) {
    return {
      peakPressure: pressure,
      totalJuice: 0,
      theoreticalWater,
      residueMoisture: params.moistureContent,
      juiceYield: 0,
      stableJuiceTime: -1,
      feasible: false,
      infeasibleReason: `果料含水率过低（当前 ${params.moistureContent}%），低于 20% 时汁液过于粘稠难以提取。建议将含水率提升至 40% 以上。`,
      timeSeries: [{ time: 0, pressure, juice: 0, compression: 0 }],
    };
  }

  if (pressure > 800) {
    return {
      peakPressure: pressure,
      totalJuice: 0,
      theoreticalWater,
      residueMoisture: params.moistureContent,
      juiceYield: 0,
      stableJuiceTime: -1,
      feasible: false,
      infeasibleReason: `压力过大（当前 ${pressure.toFixed(0)} kPa），超过 800 kPa 可能损坏设备或将果料压成粉末。建议减轻压石重量、缩短杠杆、加大压盘或降低压石挂点比例。`,
      timeSeries: [{ time: 0, pressure, juice: 0, compression: 0 }],
    };
  }

  const maxCompression = computeMaxCompression(pressure);
  let currentJuice = 0;
  let peakPressure = pressure;

  for (let t = 0; t <= SIMULATION_DURATION; t += SIMULATION_DT) {
    const compressionRatio =
      1 - Math.exp(-t / COMPRESSION_TAU) * (1 - maxCompression);

    const effectivePressure = pressure * (0.4 + 0.6 * compressionRatio);
    if (effectivePressure > peakPressure) peakPressure = effectivePressure;

    let dV = 0;
    if (effectivePressure >= PRESSURE_THRESHOLD && currentJuice < theoreticalWater) {
      const remainingCapacity = 1 - currentJuice / theoreticalWater;
      dV =
        JUICE_COEFFICIENT *
        (effectivePressure - PRESSURE_THRESHOLD) *
        remainingCapacity *
        SIMULATION_DT;
      currentJuice = Math.min(theoreticalWater, currentJuice + dV);
    }

    timeSeries.push({
      time: Number(t.toFixed(2)),
      pressure: Number(effectivePressure.toFixed(2)),
      juice: Number(currentJuice.toFixed(2)),
      compression: Number(compressionRatio.toFixed(4)),
    });
  }

  const dryWeight = params.fruitWeight * (1 - params.moistureContent / 100);
  const residueTotalWeight = params.fruitWeight - currentJuice / 1000;
  const residueMoisture =
    residueTotalWeight > 0
      ? ((residueTotalWeight - dryWeight) / residueTotalWeight) * 100
      : 0;

  const juiceYield =
    theoreticalWater > 0 ? (currentJuice / theoreticalWater) * 100 : 0;

  const stableJuiceTime = detectStableJuiceTime(timeSeries, theoreticalWater);

  if (juiceYield < 10) {
    return {
      peakPressure: Number(peakPressure.toFixed(2)),
      totalJuice: Number(currentJuice.toFixed(2)),
      theoreticalWater: Number(theoreticalWater.toFixed(2)),
      residueMoisture: Number(Math.max(0, residueMoisture).toFixed(2)),
      juiceYield: Number(juiceYield.toFixed(2)),
      stableJuiceTime: -1,
      feasible: false,
      infeasibleReason: `出汁率过低（仅 ${juiceYield.toFixed(1)}%），低于 10% 不具备实际生产价值。可能原因：压力不足（${pressure.toFixed(0)}kPa）或含水率偏低（${params.moistureContent}%）。建议增加压石重量或提高果料含水率。`,
      timeSeries,
    };
  }

  return {
    peakPressure: Number(peakPressure.toFixed(2)),
    totalJuice: Number(currentJuice.toFixed(2)),
    theoreticalWater: Number(theoreticalWater.toFixed(2)),
    residueMoisture: Number(Math.max(0, residueMoisture).toFixed(2)),
    juiceYield: Number(juiceYield.toFixed(2)),
    stableJuiceTime: Number(stableJuiceTime.toFixed(2)),
    feasible: true,
    timeSeries,
  };
}
