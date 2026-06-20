import { Gauge, Droplets, Leaf, TrendingUp, Scale, Timer } from "lucide-react";
import { usePressStore } from "../store/usePressStore";

export default function ResultMetrics() {
  const { simulationResult, simulationState } = usePressStore();

  const showResults =
    simulationState.status === "finished" || simulationResult !== null;

  const peakPressure = simulationResult?.peakPressure ?? 0;
  const totalJuice = simulationResult?.totalJuice ?? 0;
  const theoreticalWater = simulationResult?.theoreticalWater ?? 0;
  const residueMoisture = simulationResult?.residueMoisture ?? 0;
  const juiceYield = simulationResult?.juiceYield ?? 0;
  const stableJuiceTime = simulationResult?.stableJuiceTime ?? -1;

  const metrics = [
    {
      label: "峰值压力",
      value: showResults ? peakPressure.toFixed(1) : "—",
      unit: "kPa",
      icon: Gauge,
      color: "text-rust-500",
      borderColor: "border-rust-400",
      highlight: peakPressure >= 200,
    },
    {
      label: "总出汁量",
      value: showResults ? totalJuice.toFixed(1) : "—",
      unit: "mL",
      icon: Droplets,
      color: "text-amber-600",
      borderColor: "border-amber-400",
      highlight: totalJuice > theoreticalWater * 0.6,
    },
    {
      label: "理论含水量",
      value: showResults ? theoreticalWater.toFixed(1) : "—",
      unit: "mL",
      icon: Scale,
      color: "text-wood-600",
      borderColor: "border-wood-400",
    },
    {
      label: "残渣含水率",
      value: showResults ? residueMoisture.toFixed(1) : "—",
      unit: "%",
      icon: Leaf,
      color: "text-olive-500",
      borderColor: "border-olive-400",
      highlight: showResults && residueMoisture < 50,
      lowerBetter: true,
    },
    {
      label: "出汁率",
      value: showResults ? juiceYield.toFixed(1) : "—",
      unit: "%",
      icon: TrendingUp,
      color: "text-wood-700",
      borderColor: "border-wood-500",
      highlight: showResults && juiceYield >= 60,
    },
    {
      label: "稳定出汁时间",
      value: showResults
        ? stableJuiceTime > 0
          ? stableJuiceTime.toFixed(1)
          : "未达成"
        : "—",
      unit: stableJuiceTime > 0 ? "s" : "",
      icon: Timer,
      color: "text-slate-600",
      borderColor: "border-slate-400",
      highlight: showResults && stableJuiceTime > 0 && stableJuiceTime < 60,
      lowerBetter: true,
    },
  ];

  return (
    <div className="vintage-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-rust-500" />
          结果指标
        </h2>
        {showResults && simulationResult && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-display font-semibold ${
              simulationResult.feasible
                ? "bg-olive-400/20 text-olive-600 border border-olive-400"
                : "bg-rust-400/20 text-rust-600 border border-rust-400"
            }`}
          >
            {simulationResult.feasible ? "✓ 方案可行" : "✕ 方案不可行"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`metric-card flex flex-col items-center justify-center gap-1 transition-all py-3 ${
                m.highlight
                  ? `ring-2 ${m.borderColor.replace("border-", "ring-")} bg-white`
                  : ""
              }`}
            >
              <Icon size={18} className={m.color} strokeWidth={2} />
              <div className="text-[10px] text-slate-500 font-display font-semibold tracking-wide text-center">
                {m.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`font-display font-bold text-lg ${m.color}`}>
                  {m.value}
                </span>
                <span className="text-[9px] text-slate-400">{m.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      {!showResults && (
        <p className="text-xs text-center text-slate-500 italic pt-1">
          启动模拟后显示完整结果
        </p>
      )}
      {showResults && simulationResult && !simulationResult.feasible && (
        <div className="text-xs text-center text-rust-500 italic pt-1 border-t border-wood-200 pt-2">
          <p className="font-semibold mb-0.5">该方案不可行</p>
          <p>{simulationResult.infeasibleReason}</p>
        </div>
      )}
    </div>
  );
}
