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

export default function DataChart() {
  const { simulationState, simulationResult } = usePressStore();
  const data = simulationState.displayedPoints;

  const theoreticalMax = simulationResult?.theoreticalWater ?? 0;
  const maxPressure = simulationResult?.peakPressure
    ? Math.max(100, simulationResult.peakPressure * 1.15)
    : 300;

  return (
    <div className="vintage-card p-4 flex flex-col gap-2">
      <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-olive-500" />
        实时数据曲线
      </h2>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          >
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
              domain={[0, Math.ceil(Math.max(100, theoreticalMax) / 100) * 100]}
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
            <Tooltip
              contentStyle={{
                background: "#F5F0E6",
                border: "1px solid #8B4513",
                borderRadius: 4,
                fontFamily: "Source Serif Pro, serif",
                fontSize: 12,
                color: "#2C1405",
              }}
              formatter={(value: number, name: string) => [
                name === "pressure"
                  ? `${value.toFixed(1)} kPa`
                  : `${value.toFixed(1)} mL`,
                name === "pressure" ? "压力" : "累积出汁量",
              ]}
              labelFormatter={(t) => `时间: ${t} s`}
            />
            <Legend
              wrapperStyle={{
                fontFamily: "Source Serif Pro, serif",
                fontSize: 12,
              }}
              formatter={(value) =>
                value === "pressure" ? "压力 (kPa)" : "累积出汁量 (mL)"
              }
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
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, fill: "#A0522D", stroke: "#F5EFE3", strokeWidth: 1.5 }}
            />
            <Line
              yAxisId="juice"
              type="monotone"
              dataKey="juice"
              stroke="#B8860B"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, fill: "#B8860B", stroke: "#F5EFE3", strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
