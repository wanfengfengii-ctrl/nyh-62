import { useState } from "react";
import { Save, FolderOpen, Trash2, GitCompare, X, Check, Download } from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { ExperimentPlan } from "../types";

export default function PlanManager() {
  const {
    plans,
    selectedPlanIds,
    savePlan,
    loadPlan,
    deletePlan,
    togglePlanSelection,
    clearSelection,
    simulationResult,
  } = usePressStore();

  const [planName, setPlanName] = useState("");
  const [showCompare, setShowCompare] = useState(false);

  const handleSave = () => {
    const id = savePlan(planName);
    if (id) {
      setPlanName("");
    }
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
    if (key === "residueMoisture") return Math.min(...(values as number[]));
    return Math.max(...(values as number[]));
  };

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-wood-500" />
          实验方案
        </h2>
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
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-wood-700 border-b border-wood-200">
                <th className="text-left p-2 font-display">指标</th>
                {selectedPlans.map((p) => (
                  <th key={p.id} className="text-center p-2 font-display">
                    {p.name.slice(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-body">
              {[
                { key: "leverLength", label: "杠杆长度", unit: "m", param: true },
                { key: "fulcrumPosition", label: "挂点位置", unit: "%", param: true, pct: true },
                { key: "plateDiameter", label: "压盘直径", unit: "m", param: true },
                { key: "stoneWeight", label: "压石重量", unit: "kg", param: true },
                { key: "fruitWeight", label: "果料重量", unit: "kg", param: true },
                { key: "moistureContent", label: "含水率", unit: "%", param: true },
                { key: "peakPressure", label: "峰值压力", unit: "kPa", param: false },
                { key: "totalJuice", label: "总出汁量", unit: "mL", param: false },
                { key: "residueMoisture", label: "残渣含水率", unit: "%", param: false, lowerBetter: true },
                { key: "juiceYield", label: "出汁率", unit: "%", param: false },
              ].map((row) => {
                const best =
                  !row.param && selectedPlans.every((p) => p.result?.feasible)
                    ? bestOf(row.key as any)
                    : null;
                return (
                  <tr key={row.key} className="border-b border-wood-100">
                    <td className="p-2 text-wood-700 font-semibold">
                      {row.label}
                      <span className="text-slate-400 text-[10px] ml-1">({row.unit})</span>
                    </td>
                    {selectedPlans.map((p) => {
                      let val: number | undefined;
                      if (row.param) {
                        val = (p.params as unknown as Record<string, number>)[row.key];
                        if (row.pct) val = val * 100;
                      } else {
                        val = (p.result as unknown as Record<string, number> | undefined)?.[row.key];
                      }
                      const isBest = best !== null && val === best;
                      const feasible = p.result?.feasible;
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
                          {typeof val === "number"
                            ? val.toFixed(1)
                            : "—"}
                          {isBest && <Check size={10} className="inline ml-0.5" />}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {plans.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8 italic">
            暂无已保存方案<br />
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
                <div className="flex gap-1 flex-shrink-0">
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
                  杠杆 <span className="text-wood-700 font-semibold">{plan.params.leverLength}m</span>
                </span>
                <span>
                  压盘 <span className="text-wood-700 font-semibold">Ø{plan.params.plateDiameter.toFixed(2)}m</span>
                </span>
                <span>
                  压石 <span className="text-wood-700 font-semibold">{plan.params.stoneWeight}kg</span>
                </span>
                <span>
                  果料 <span className="text-wood-700 font-semibold">{plan.params.fruitWeight}kg</span>
                </span>
                <span>
                  含水 <span className="text-wood-700 font-semibold">{plan.params.moistureContent}%</span>
                </span>
                {plan.result?.feasible && (
                  <span className="ml-auto text-amber-700 font-semibold flex items-center gap-0.5">
                    <Download size={10} />
                    {plan.result.totalJuice.toFixed(0)}mL · {plan.result.juiceYield.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
