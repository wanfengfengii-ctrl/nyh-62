import { useState } from "react";
import {
  Save,
  FolderOpen,
  Trash2,
  GitCompare,
  X,
  Check,
  Download,
  Copy,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { ExperimentPlan } from "../types";

export default function PlanManager() {
  const {
    plans,
    selectedPlanIds,
    savePlan,
    loadPlan,
    deletePlan,
    duplicatePlan,
    exportPlans,
    togglePlanSelection,
    clearSelection,
    simulationResult,
  } = usePressStore();

  const [planName, setPlanName] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSave = () => {
    const id = savePlan(planName);
    if (id) {
      setPlanName("");
    }
  };

  const handleDuplicate = (id: string) => {
    duplicatePlan(id);
  };

  const handleExport = (format: "json" | "csv") => {
    const data = exportPlans(
      selectedPlanIds.length >= 2 ? selectedPlanIds : [],
      format
    );
    const mime = format === "json" ? "application/json" : "text/csv;charset=utf-8";
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `press_experiments_${new Date()
      .toISOString()
      .slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const selectedPlans = plans.filter((p) => selectedPlanIds.includes(p.id));

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const bestOf = (key: keyof ExperimentPlan["result"] & string) => {
    const values = selectedPlans
      .filter((p) => p.result?.feasible)
      .map((p) => p.result?.[key] as number | undefined);
    if (values.length === 0 || values.some((v) => v === undefined)) return null;
    if (
      key === "residueMoisture" ||
      key === "stableJuiceTime"
    ) {
      const filtered = (values as number[]).filter((v) => v > 0);
      if (filtered.length === 0) return null;
      return Math.min(...filtered);
    }
    return Math.max(...(values as number[]));
  };

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-wood-500" />
          实验方案
        </h2>
        <div className="flex items-center gap-1">
          {plans.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1"
                title="导出方案"
              >
                <Download size={14} />
                导出
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-wood-50 border border-wood-300 rounded-md shadow-lg overflow-hidden">
                  <button
                    onClick={() => handleExport("json")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-wood-700 hover:bg-wood-100 text-left whitespace-nowrap"
                  >
                    <FileJson size={14} />
                    导出 JSON
                    {selectedPlanIds.length >= 2 && (
                      <span className="text-[10px] text-olive-600 ml-1">
                        (已选 {selectedPlanIds.length})
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-wood-700 hover:bg-wood-100 text-left whitespace-nowrap border-t border-wood-200"
                  >
                    <FileSpreadsheet size={14} />
                    导出 CSV
                    {selectedPlanIds.length >= 2 && (
                      <span className="text-[10px] text-olive-600 ml-1">
                        (已选 {selectedPlanIds.length})
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          {selectedPlanIds.length >= 2 && (
            <button
              onClick={() => setShowCompare((v) => !v)}
              className="vintage-btn-primary text-xs px-3 py-1 flex items-center gap-1"
            >
              <GitCompare size={14} />
              {showCompare ? "关闭对比" : `对比 ${selectedPlanIds.length} 个方案`}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="输入方案名称..."
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="vintage-input text-sm"
        />
        <button
          onClick={handleSave}
          disabled={!simulationResult}
          className="vintage-btn-primary text-sm px-3 flex items-center gap-1 whitespace-nowrap"
        >
          <Save size={16} />
          保存
        </button>
      </div>

      {!simulationResult && (
        <p className="text-xs text-rust-500 -mt-1">请先完成一次模拟后再保存方案</p>
      )}

      {showCompare && selectedPlans.length >= 2 && (
        <div className="border border-wood-300 rounded-md bg-wood-50 p-3 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-1">
              <GitCompare size={14} />
              方案对比
            </h3>
            <div className="flex gap-1">
              <button
                onClick={clearSelection}
                className="text-xs text-slate-500 hover:text-rust-500 underline px-2 py-0.5"
              >
                清除选择
              </button>
              <button
                onClick={() => setShowCompare(false)}
                className="text-slate-500 hover:text-rust-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <table className="w-full text-xs border-collapse min-w-[520px]">
            <thead>
              <tr className="text-wood-700 border-b border-wood-200">
                <th className="text-left p-2 font-display">指标</th>
                {selectedPlans.map((p) => (
                  <th
                    key={p.id}
                    className="text-center p-2 font-display whitespace-nowrap"
                  >
                    {p.name.slice(0, 12)}
                    {!p.result?.feasible && (
                      <span className="ml-1 text-[9px] text-rust-500 font-normal">
                        (不可行)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body">
              {[
                { key: "leverLength", label: "杠杆长度", unit: "m", param: true },
                {
                  key: "fulcrumPosition",
                  label: "挂点位置",
                  unit: "%",
                  param: true,
                  pct: true,
                },
                { key: "plateDiameter", label: "压盘直径", unit: "m", param: true },
                { key: "stoneWeight", label: "压石重量", unit: "kg", param: true },
                { key: "fruitWeight", label: "果料重量", unit: "kg", param: true },
                { key: "moistureContent", label: "含水率", unit: "%", param: true },
                {
                  key: "peakPressure",
                  label: "峰值压力",
                  unit: "kPa",
                  param: false,
                },
                {
                  key: "totalJuice",
                  label: "总出汁量",
                  unit: "mL",
                  param: false,
                },
                {
                  key: "juiceYield",
                  label: "出汁率",
                  unit: "%",
                  param: false,
                },
                {
                  key: "residueMoisture",
                  label: "残渣含水率",
                  unit: "%",
                  param: false,
                  lowerBetter: true,
                },
                {
                  key: "stableJuiceTime",
                  label: "稳定出汁时间",
                  unit: "s",
                  param: false,
                  lowerBetter: true,
                  isTime: true,
                },
              ].map((row) => {
                const best =
                  !row.param && selectedPlans.every((p) => p.result?.feasible)
                    ? bestOf(row.key as any)
                    : null;
                return (
                  <tr key={row.key} className="border-b border-wood-100">
                    <td className="p-2 text-wood-700 font-semibold whitespace-nowrap">
                      {row.label}
                      <span className="text-slate-400 text-[10px] ml-1">
                        ({row.unit})
                      </span>
                    </td>
                    {selectedPlans.map((p) => {
                      let val: number | undefined | string;
                      if (row.param) {
                        val = (p.params as unknown as Record<string, number>)[
                          row.key
                        ];
                        if (row.pct) val = val * 100;
                      } else {
                        val = (
                          p.result as unknown as
                            | Record<string, number>
                            | undefined
                        )?.[row.key];
                      }
                      const feasible = p.result?.feasible;
                      const isBest =
                        best !== null && typeof val === "number" && val === best;
                      const displayVal =
                        typeof val === "number"
                          ? row.isTime
                            ? val > 0
                              ? val.toFixed(1)
                              : "未达成"
                            : val.toFixed(1)
                          : "—";
                      return (
                        <td
                          key={p.id}
                          className={`text-center p-2 ${
                            isBest
                              ? "bg-olive-400/20 text-olive-600 font-bold"
                              : !feasible && !row.param
                              ? "text-rust-500"
                              : "text-slate-700"
                          }`}
                        >
                          {displayVal}
                          {isBest && (
                            <Check size={10} className="inline ml-0.5" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-b border-wood-100 bg-wood-100/50">
                <td className="p-2 text-wood-700 font-semibold">可行性</td>
                {selectedPlans.map((p) => (
                  <td
                    key={p.id}
                    className={`text-center p-2 font-semibold ${
                      p.result?.feasible ? "text-olive-600" : "text-rust-500"
                    }`}
                  >
                    {p.result?.feasible ? "可行 ✓" : "不可行 ✕"}
                  </td>
                ))}
              </tr>
              {selectedPlans.some((p) => !p.result?.feasible) && (
                <tr className="bg-amber-50/50">
                  <td className="p-2 text-rust-600 font-semibold align-top">
                    不可行原因
                  </td>
                  {selectedPlans.map((p) => (
                    <td
                      key={p.id}
                      className="text-left p-2 text-[10px] text-rust-600 align-top"
                    >
                      {p.result?.feasible ? "—" : p.result?.infeasibleReason}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {plans.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8 italic">
            暂无已保存方案
            <br />
            <span className="text-xs">完成模拟后点击保存即可记录方案</span>
          </div>
        )}
        {plans.map((plan) => {
          const isSelected = selectedPlanIds.includes(plan.id);
          return (
            <div
              key={plan.id}
              className={`rounded-md border p-3 transition-all ${
                isSelected
                  ? "border-olive-400 bg-olive-400/10"
                  : "border-wood-200 bg-wood-50 hover:bg-wood-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePlanSelection(plan.id)}
                    className="mt-1 accent-olive-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-wood-700 truncate text-sm">
                      {plan.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {formatDate(plan.createdAt)}
                      {plan.result?.feasible ? (
                        <span className="ml-2 text-olive-500">● 可行</span>
                      ) : plan.result ? (
                        <span className="ml-2 text-rust-500">● 不可行</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => handleDuplicate(plan.id)}
                    className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-0.5"
                    title="复制方案"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => loadPlan(plan.id)}
                    className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-0.5"
                    title="加载方案"
                  >
                    <FolderOpen size={13} />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="vintage-btn-danger text-xs px-2 py-1 flex items-center gap-0.5"
                    title="删除方案"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pl-6">
                <span>
                  杠杆{" "}
                  <span className="text-wood-700 font-semibold">
                    {plan.params.leverLength}m
                  </span>
                </span>
                <span>
                  挂点{" "}
                  <span className="text-wood-700 font-semibold">
                    {(plan.params.fulcrumPosition * 100).toFixed(0)}%
                  </span>
                </span>
                <span>
                  压盘{" "}
                  <span className="text-wood-700 font-semibold">
                    Ø{plan.params.plateDiameter.toFixed(2)}m
                  </span>
                </span>
                <span>
                  压石{" "}
                  <span className="text-wood-700 font-semibold">
                    {plan.params.stoneWeight}kg
                  </span>
                </span>
                <span>
                  果料{" "}
                  <span className="text-wood-700 font-semibold">
                    {plan.params.fruitWeight}kg / {plan.params.moistureContent}%
                  </span>
                </span>
                {plan.result?.feasible && (
                  <span className="ml-auto text-amber-700 font-semibold flex items-center gap-0.5">
                    <Download size={10} />
                    {plan.result.totalJuice.toFixed(0)}mL ·{" "}
                    {plan.result.juiceYield.toFixed(0)}% ·{" "}
                    {plan.result.stableJuiceTime > 0
                      ? `${plan.result.stableJuiceTime.toFixed(0)}s稳`
                      : "未稳"}
                  </span>
                )}
              </div>
              {plan.result && !plan.result.feasible && (
                <div className="mt-1 pl-6 text-[10px] text-rust-500 italic">
                  {plan.result.infeasibleReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
