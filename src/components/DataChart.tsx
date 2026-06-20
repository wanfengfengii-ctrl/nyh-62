import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { usePressStore } from "../store/usePressStore";
import { TimeSeriesPoint, ExperimentPlan } from "../types";

const COMPARE_COLORS = [
  "#A0522D",
  "#556B2F",
  "#4682B4",
  "#8B008B",
  "#B8860B",
  "#2F4F4F",
  "#CD853F",
  "#708090",
];

interface MergedPoint extends TimeSeriesPoint {
  planName?: string;
  [key: string]: any;
}

function mergeTimeSeries(
  primary: TimeSeriesPoint[],
  plans: ExperimentPlan[]
): MergedPoint[] {
  const allTimes = new Set<number>();
  primary.forEach((p) => allTimes.add(p.time));
  plans.forEach((plan) => {
    plan.result?.timeSeries.forEach((p) => allTimes.add(p.time));
  });

  const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);

  function findNearest(series: TimeSeriesPoint[], t: number): TimeSeriesPoint {
    let lo = 0;
    let hi = series.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (series[mid].time < t) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0 && Math.abs(series[lo].time - t) > Math.abs(series[lo - 1].time - t)) {
      return series[lo - 1];
    }
    return series[lo];
  }

  return sortedTimes.map((t) => {
    const base = primary.length > 0 ? findNearest(primary, t) : { time: t, pressure: 0, juice: 0, compression: 0 };
    const merged: MergedPoint = { ...base };
    plans.forEach((plan) => {
      if (plan.result) {
        const p = findNearest(plan.result.timeSeries, t);
        merged[`pressure_${plan.id}`] = p.pressure;
        merged[`juice_${plan.id}`] = p.juice;
        merged[`compression_${plan.id}`] = p.compression;
      }
    });
    return merged;
  });
}

export default function DataChart() {
  const { simulationState, simulationResult, plans, selectedPlanIds } =
    usePressStore();
  const [showCompare, setShowCompare] = useState(true);

  const selectedPlans = useMemo(
    () => plans.filter((p) => selectedPlanIds.includes(p.id) && p.result?.feasible),
    [plans, selectedPlanIds]
  );

  const displayData = useMemo(() => {
    if (showCompare && selectedPlans.length > 0) {
      return mergeTimeSeries(simulationState.displayedPoints, selectedPlans);
    }
    return simulationState.displayedPoints;
  }, [simulationState.displayedPoints, selectedPlans, showCompare]);

  const theoreticalMax = simulationResult?.theoreticalWater ?? 0;
  const maxPressure = useMemo(() => {
    let max = simulationResult?.peakPressure ?? 0;
    selectedPlans.forEach((p) => {
      if (p.result?.peakPressure && p.result.peakPressure > max) {
        max = p.result.peakPressure;
      }
    });
    return Math.max(100, max * 1.15);
  }, [simulationResult, selectedPlans]);

  const maxJuice = useMemo(() => {
    let max = theoreticalMax;
    selectedPlans.forEach((p) => {
      if (p.result?.totalJuice && p.result.totalJuice > max) {
        max = p.result.totalJuice;
      }
    });
    return Math.max(100, max * 1.05);
  }, [theoreticalMax, selectedPlans]);

  return (
    <div className="vintage-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-olive-500" />
          实时数据曲线
        </h2>
        {selectedPlans.length > 0 && (
          <button
            onClick={() => setShowCompare((v) => !v)}
            className="text-xs vintage-btn-secondary px-2 py-1 flex items-center gap-1"
          >
            {showCompare
              ? `隐藏 ${selectedPlans.length} 组对比`
              : `叠加 ${selectedPlans.length} 组对比`}
          </button>
        )}
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D4B98C" opacity={0.6} />
            <XAxis
              dataKey="time"
              label={{
                value: "时间 (s)",
                position: "insideBottomRight",
                offset: -2,
                fill: "#6B3410",
                fontSize: 11,
                fontFamily: "Source Serif Pro, serif",
              }}
              stroke="#6B3410"
              tick={{ fontSize: 10, fill: "#6B3410" }}
            />
            <YAxis
              yAxisId="pressure"
              orientation="left"
              stroke="#A0522D"
              tick={{ fontSize: 10, fill: "#A0522D" }}
              domain={[0, Math.ceil(maxPressure / 50) * 50]}
              label={{
                value: "压力 (kPa)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fill: "#A0522D",
                fontSize: 11,
                fontFamily: "Source Serif Pro, serif",
              }}
            />
            <YAxis
              yAxisId="juice"
              orientation="right"
              stroke="#B8860B"
              tick={{ fontSize: 10, fill: "#B8860B" }}
              domain={[0, Math.ceil(Math.max(100, maxJuice) / 100) * 100]}
              label={{
                value: "出汁量 (mL)",
                angle: 90,
                position: "insideRight",
                offset: 10,
                fill: "#B8860B",
                fontSize: 11,
                fontFamily: "Source Serif Pro, serif",
              }}
            />
            <YAxis
              yAxisId="compression"
              orientation="right"
              stroke="#556B2F"
              tick={{ fontSize: 10, fill: "#556B2F" }}
              domain={[0, 1]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              label={{
                value: "压缩率 (%)",
                angle: 90,
                position: "insideRight",
                offset: 56,
                fill: "#556B2F",
                fontSize: 11,
                fontFamily: "Source Serif Pro, serif",
              }}
            />
            <Tooltip
              contentStyle={{
                background: "#F5F0E6",
                border: "1px solid #8B4513",
                borderRadius: 4,
                fontFamily: "Source Serif Pro, serif",
                fontSize: 12,
                color: "#2C1405",
                maxHeight: 260,
                overflowY: "auto",
              }}
              formatter={(value: number, name: string) => {
                if (name.startsWith("pressure")) return [`${value.toFixed(1)} kPa`, name === "pressure" ? "压力 (当前)" : `压力 ${name.split("_").slice(1).join("_")}`];
                if (name.startsWith("juice")) return [`${value.toFixed(1)} mL`, name === "juice" ? "累积出汁 (当前)" : `出汁 ${name.split("_").slice(1).join("_")}`];
                if (name.startsWith("compression")) return [`${(value * 100).toFixed(1)}%`, name === "compression" ? "压缩率 (当前)" : `压缩率 ${name.split("_").slice(1).join("_")}`];
                return [value, name];
              }}
              labelFormatter={(t) => `时间: ${t} s`}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "Source Serif Pro, serif",
                fontSize: 11,
              }}
              formatter={(value: string) => {
                if (value === "pressure") return "压力 (kPa)";
                if (value === "juice") return "累积出汁 (mL)";
                if (value === "compression") return "压缩率 (%)";
                const planId = value.split("_").slice(1).join("_");
                const plan = selectedPlans.find((p) => p.id === planId);
                const label = plan?.name?.slice(0, 8) ?? value;
                const type = value.startsWith("pressure_")
                  ? "压力"
                  : value.startsWith("juice_")
                  ? "出汁"
                  : "压缩";
                return `${type}·${label}`;
              }}
            />
            <ReferenceLine
              yAxisId="pressure"
              y={50}
              stroke="#A0522D"
              strokeDasharray="4 3"
              strokeWidth={1}
              label={{
                value: "临界压力 50kPa",
                position: "insideTopRight",
                fill: "#A0522D",
                fontSize: 10,
                fontFamily: "Source Serif Pro, serif",
              }}
            />
            <Line
              yAxisId="pressure"
              type="monotone"
              dataKey="pressure"
              stroke="#A0522D"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#A0522D", stroke: "#F5EFE3", strokeWidth: 1.5 }}
            />
            <Line
              yAxisId="juice"
              type="monotone"
              dataKey="juice"
              stroke="#B8860B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#B8860B", stroke: "#F5EFE3", strokeWidth: 1.5 }}
            />
            <Line
              yAxisId="compression"
              type="monotone"
              dataKey="compression"
              stroke="#556B2F"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 3.5, fill: "#556B2F", stroke: "#F5EFE3", strokeWidth: 1.5 }}
            />
            {showCompare &&
              selectedPlans.map((plan, idx) => {
                const color = COMPARE_COLORS[idx % COMPARE_COLORS.length];
                return (
                  <g key={`compare-${plan.id}`}>
                    <Line
                      yAxisId="pressure"
                      type="monotone"
                      dataKey={`pressure_${plan.id}`}
                      stroke={color}
                      strokeWidth={1.6}
                      strokeOpacity={0.75}
                      dot={false}
                      connectNulls
                    />
                    <Line
                      yAxisId="juice"
                      type="monotone"
                      dataKey={`juice_${plan.id}`}
                      stroke={color}
                      strokeWidth={1.6}
                      strokeOpacity={0.75}
                      strokeDasharray="3 2"
                      dot={false}
                      connectNulls
                    />
                    <Line
                      yAxisId="compression"
                      type="monotone"
                      dataKey={`compression_${plan.id}`}
                      stroke={color}
                      strokeWidth={1.2}
                      strokeOpacity={0.55}
                      strokeDasharray="2 2"
                      dot={false}
                      connectNulls
                    />
                  </g>
                );
              })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
