import { Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { validateParams } from "../utils/validateParams";

export default function ControlPanel() {
  const {
    params,
    simulationState,
    simulationResult,
    dirtyParams,
    setParam,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
  } = usePressStore();

  const validation = validateParams(params);
  const { status } = simulationState;

  const paramFields = [
    {
      key: "leverLength" as const,
      label: "杠杆长度",
      unit: "m",
      min: 0.5,
      max: 6,
      step: 0.1,
      description: "更长的杠杆产生更大的机械增益",
    },
    {
      key: "stoneWeight" as const,
      label: "压石重量",
      unit: "kg",
      min: 5,
      max: 500,
      step: 5,
      description: "压石越重，产生的压力越大",
    },
    {
      key: "fruitWeight" as const,
      label: "果料重量",
      unit: "kg",
      min: 1,
      max: 200,
      step: 1,
      description: "待压榨的果料总重量",
    },
    {
      key: "moistureContent" as const,
      label: "果料含水率",
      unit: "%",
      min: 0,
      max: 100,
      step: 1,
      description: "果料中水分所占的质量百分比",
    },
  ];

  const handleStart = () => {
    const ok = startSimulation();
    if (!ok) {
      // validation already reflected in UI
    }
  };

  const statusLabel =
    status === "idle"
      ? "待启动"
      : status === "running"
      ? "运行中"
      : status === "paused"
      ? "已暂停"
      : "已完成";

  const statusColor =
    status === "idle"
      ? "text-wood-600"
      : status === "running"
      ? "text-olive-500"
      : status === "paused"
      ? "text-amber-600"
      : "text-rust-500";

  return (
    <div className="vintage-card p-4 flex flex-col gap-4 h-full">
      <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
        参数控制
      </h2>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-slate-600">模拟状态</span>
        <span className={`font-display font-semibold ${statusColor}`}>
          {statusLabel}
          {dirtyParams && status !== "running" && (
            <span className="ml-2 text-xs text-rust-500">· 参数已变更</span>
          )}
        </span>
      </div>

      <div className="w-full bg-wood-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-200"
          style={{
            width: `${Math.min(100, (simulationState.currentTime / 120) * 100)}%`,
            background:
              status === "running"
                ? "linear-gradient(90deg, #556B2F, #7B8F3F)"
                : status === "finished"
                ? "linear-gradient(90deg, #8B4513, #DAA520)"
                : "linear-gradient(90deg, #B8956A, #D4B98C)",
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 -mt-2 px-1">
        <span>0s</span>
        <span>{simulationState.currentTime.toFixed(1)}s</span>
        <span>120s</span>
      </div>

      {!validation.valid && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-rust-400 text-rust-600 text-sm">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <ul className="space-y-0.5">
            {validation.errors.map((e, i) => (
              <li key={i}>· {e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {simulationResult && !simulationResult.feasible && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-400 text-amber-800 text-sm">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">不可行方案</p>
            <p>{simulationResult.infeasibleReason}</p>
          </div>
        </div>
      )}

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {paramFields.map((f) => {
          const hasError = validation.errors.some((e) => e.field === f.key);
          return (
            <div key={f.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-display font-semibold text-wood-700 text-sm">
                  {f.label}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={params[f.key]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setParam(f.key, v);
                    }}
                    className={`vintage-input w-20 text-right text-sm ${
                      hasError ? "error" : ""
                    }`}
                  />
                  <span className="text-xs text-slate-500 w-6">{f.unit}</span>
                </div>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={params[f.key]}
                onChange={(e) => setParam(f.key, parseFloat(e.target.value))}
                className="vintage-slider"
                disabled={status === "running"}
              />
              <div className="flex justify-between text-[10px] text-slate-400 -mt-0.5">
                <span>
                  {f.min}
                  {f.unit}
                </span>
                <span className="text-slate-500 italic">{f.description}</span>
                <span>
                  {f.max}
                  {f.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-wood-200">
        {status === "idle" || status === "finished" ? (
          <button
            className="vintage-btn-primary col-span-2"
            onClick={handleStart}
            disabled={!validation.valid}
          >
            <span className="flex items-center justify-center gap-2">
              <Play size={16} />
              启动模拟
            </span>
          </button>
        ) : status === "running" ? (
          <button className="vintage-btn-secondary col-span-2" onClick={pauseSimulation}>
            <span className="flex items-center justify-center gap-2">
              <Pause size={16} />
              暂停
            </span>
          </button>
        ) : (
          <button className="vintage-btn-primary col-span-2" onClick={resumeSimulation}>
            <span className="flex items-center justify-center gap-2">
              <Play size={16} />
              继续
            </span>
          </button>
        )}
        <button
          className="vintage-btn-secondary"
          onClick={resetSimulation}
          disabled={status === "idle"}
        >
          <span className="flex items-center justify-center gap-1">
            <RotateCcw size={16} />
            重置
          </span>
        </button>
      </div>
    </div>
  );
}
