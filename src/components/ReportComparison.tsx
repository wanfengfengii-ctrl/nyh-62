import { useMemo, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  GitCompare,
  Trophy,
  TrendingUp,
  Download,
  Play,
  Settings,
  X,
  Check,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { ReportComparisonData, ExperimentReport } from "../types";

interface ComparisonTableProps {
  title: string;
  rows: {
    label: string;
    unit: string;
    values: (number | string)[];
    bestIndex?: number;
    isBetterHigher?: boolean;
  }[];
  reports: ExperimentReport[];
  onLoadParams: (id: string) => void;
  onReplay: (id: string) => void;
}

function ComparisonTable({
  title,
  rows,
  reports,
  onLoadParams,
  onReplay,
}: ComparisonTableProps) {
  return (
    <div className="border border-wood-200 rounded-md overflow-hidden">
      <div className="bg-wood-50 p-3 border-b border-wood-200">
        <h3 className="font-display font-bold text-wood-700 text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-wood-50/50">
              <th className="text-left p-2 font-semibold text-wood-600 border-b border-wood-100 sticky left-0 bg-wood-50/90 z-10">
                指标
              </th>
              {reports.map((report, idx) => (
                <th
                  key={report.id}
                  className="p-2 font-semibold text-wood-600 border-b border-wood-100 text-center min-w-[120px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="truncate max-w-[100px]" title={report.name}>
                      {report.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {!report.result.feasible && (
                        <span className="text-[9px] px-1 py-0.5 bg-rust-100 text-rust-600 rounded">
                          不可行
                        </span>
                      )}
                      {report.isBest && (
                        <span className="text-[9px] px-1 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-0.5">
                          <Trophy size={8} fill="currentColor" />
                          最佳
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onLoadParams(report.id)}
                        className="p-1 text-slate-400 hover:text-olive-600 hover:bg-olive-50 rounded transition-colors"
                        title="加载参数"
                      >
                        <Settings size={10} />
                      </button>
                      <button
                        onClick={() => onReplay(report.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="回放实验"
                      >
                        <Play size={10} />
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-wood-50/30 transition-colors">
                <td className="p-2 border-b border-wood-100 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-1">
                    <span className="text-wood-700 font-medium">{row.label}</span>
                    <span className="text-slate-400 text-[10px]">({row.unit})</span>
                  </div>
                </td>
                {row.values.map((val, valIdx) => {
                  const isBest = row.bestIndex === valIdx;
                  return (
                    <td
                      key={valIdx}
                      className={`p-2 border-b border-wood-100 text-center font-mono ${
                        isBest
                          ? "bg-olive-50 font-bold text-olive-700"
                          : "text-wood-700"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isBest && <Check size={12} className="text-olive-600" />}
                        <span>{val}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportComparison() {
  const {
    reports,
    selectedReportIds,
    compareReports,
    toggleReportSelection,
    clearReportSelection,
    selectAllReports,
    loadReportParams,
    replayExperiment,
    getFilteredReports,
    exportReportsBatch,
    setCurrentReport,
  } = usePressStore();

  const [showWinnerBanner, setShowWinnerBanner] = useState(true);

  const filteredReports = useMemo(() => getFilteredReports(), [reports]);

  const comparisonData = useMemo<ReportComparisonData | null>(() => {
    if (selectedReportIds.length < 2) return null;
    return compareReports(selectedReportIds);
  }, [selectedReportIds, reports]);

  const handleExportComparison = () => {
    if (selectedReportIds.length === 0) return;
    const content = exportReportsBatch(selectedReportIds, {
      format: "html",
      includeCharts: true,
      includeDiagnosis: true,
    });
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `对比报告_${selectedReportIds.length}组_${new Date().toLocaleDateString("zh-CN")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (filteredReports.length === 0) {
    return (
      <div className="vintage-card p-4 flex flex-col gap-4 h-full">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          多报告联动对比
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <GitCompare size={48} className="mb-3 opacity-40" />
          <p className="text-sm">暂无实验报告</p>
          <p className="text-xs mt-1">请先完成模拟并生成报告</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          多报告联动对比
        </h2>
        {selectedReportIds.length >= 2 && (
          <button
            onClick={handleExportComparison}
            className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1"
          >
            <Download size={14} />
            导出对比
          </button>
        )}
      </div>

      {comparisonData?.winnerId && showWinnerBanner && (
        <div className="relative p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 rounded-md animate-fade-in">
          <button
            onClick={() => setShowWinnerBanner(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
          <div className="flex items-start gap-2">
            <Trophy size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-amber-800 text-sm">
                🏆 最优方案：{comparisonData.reports.find((r) => r.id === comparisonData.winnerId)?.name}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">{comparisonData.winnerReason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>已选择 {selectedReportIds.length} 份报告</span>
          {selectedReportIds.length < 2 && (
            <span className="text-amber-600 flex items-center gap-0.5">
              <AlertTriangle size={12} />
              至少选择 2 份进行对比
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => selectAllReports(getFilteredReports().map((r) => r.id))}
            className="text-xs text-olive-600 hover:text-olive-700 px-2 py-0.5 hover:bg-olive-50 rounded transition-colors"
          >
            全选
          </button>
          <button
            onClick={clearReportSelection}
            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-0.5 hover:bg-slate-50 rounded transition-colors"
          >
            清空
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-wood-200">
        {filteredReports.map((report) => {
          const isSelected = selectedReportIds.includes(report.id);
          return (
            <button
              key={report.id}
              onClick={() => {
                toggleReportSelection(report.id);
                if (!isSelected) setCurrentReport(report.id);
              }}
              className={`text-[10px] px-2 py-1 rounded border transition-all ${
                isSelected
                  ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold"
                  : "bg-wood-50 border-wood-200 text-wood-600 hover:border-wood-400"
              }`}
            >
              <span className="truncate max-w-[80px]">{report.name}</span>
              {isSelected && <Check size={10} className="inline ml-1" />}
            </button>
          );
        })}
      </div>

      {comparisonData && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {comparisonData.radarData.datasets.length > 0 && (
            <div className="border border-wood-200 rounded-md overflow-hidden">
              <div className="bg-wood-50 p-3 border-b border-wood-200">
                <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" />
                  多维能力雷达图
                </h3>
              </div>
              <div className="h-[280px] p-2 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={comparisonData.radarData.labels.map((label, i) => ({
                    label,
                    ...Object.fromEntries(
                      comparisonData.radarData.datasets.map((ds) => [ds.label, ds.data[i]])
                    ),
                  }))}>
                    <PolarGrid stroke="#D4B98C" strokeOpacity={0.5} />
                    <PolarAngleAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#5C4033", fontFamily: "Source Serif Pro, serif" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#8B7355" }}
                    />
                    {comparisonData.radarData.datasets.map((dataset) => (
                      <Radar
                        key={dataset.label}
                        name={dataset.label}
                        dataKey={dataset.label}
                        stroke={dataset.color}
                        fill={dataset.color}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{
                        fontFamily: "Source Serif Pro, serif",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#F5F0E6",
                        border: "1px solid #8B4513",
                        borderRadius: 4,
                        fontFamily: "Source Serif Pro, serif",
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}分`, ""]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <ComparisonTable
            title="📊 参数对比"
            rows={comparisonData.paramComparison}
            reports={comparisonData.reports}
            onLoadParams={loadReportParams}
            onReplay={replayExperiment}
          />

          <ComparisonTable
            title="📈 结果对比"
            rows={comparisonData.resultComparison}
            reports={comparisonData.reports}
            onLoadParams={loadReportParams}
            onReplay={replayExperiment}
          />

          <div className="border border-wood-200 rounded-md overflow-hidden">
            <div className="bg-wood-50 p-3 border-b border-wood-200">
              <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-olive-500" />
                环比变化分析
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {comparisonData.reports.length >= 2 && (
                <>
                  {comparisonData.resultComparison
                    .filter((row) => row.bestIndex !== undefined)
                    .map((row, idx) => {
                      const baseline = row.values[0];
                      const baselineNum = typeof baseline === "string" && baseline !== "未达成"
                        ? parseFloat(baseline)
                        : 0;
                      const bestVal = row.values[row.bestIndex!];
                      const bestNum = typeof bestVal === "string" && bestVal !== "未达成"
                        ? parseFloat(bestVal)
                        : 0;
                      const delta = bestNum - baselineNum;
                      const deltaPercent = baselineNum > 0 ? (delta / baselineNum) * 100 : 0;
                      const isPositive = row.isBetterHigher ? delta > 0 : delta < 0;

                      if (Math.abs(delta) < 0.01) return null;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-wood-50 rounded text-xs"
                        >
                          <span className="text-wood-700">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <ArrowRight size={12} className="text-slate-400" />
                            <span
                              className={`font-mono font-semibold ${
                                isPositive ? "text-olive-600" : "text-rust-600"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {delta.toFixed(2)} {row.unit}
                              <span className="text-[10px] ml-1 opacity-75">
                                ({isPositive ? "+" : ""}
                                {deltaPercent.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!comparisonData && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <GitCompare size={48} className="mb-3 opacity-40" />
          <p className="text-sm">选择 2 份以上报告开始对比</p>
          <p className="text-xs mt-1">点击上方标签选择要对比的报告</p>
        </div>
      )}
    </div>
  );
}
