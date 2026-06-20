import { useState, useMemo } from "react";
import {
  History,
  Search,
  Star,
  Filter,
  ArrowUpDown,
  Trash2,
  Award,
  ChevronDown,
  Droplets,
  TrendingUp,
  Gauge,
  Clock,
  Download,
  GitCompare,
  Play,
  RotateCcw,
  Share2,
  CheckSquare,
  Square,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { ReportSortField, RightPanelTab } from "../types";
import BatchExportModal from "./BatchExportModal";

interface ReportHistoryProps {
  onSwitchTab?: (tab: RightPanelTab) => void;
}

export default function ReportHistory({ onSwitchTab }: ReportHistoryProps) {
  const {
    reports,
    currentReport,
    reportFilter,
    setReportFilter,
    setCurrentReport,
    toggleBestReport,
    deleteReport,
    getFilteredReports,
    getBestReport,
    exportReportHTML,
    selectedReportIds,
    toggleReportSelection,
    clearReportSelection,
    selectAllReports,
    loadReportParams,
    replayExperiment,
  } = usePressStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredReports = useMemo(() => getFilteredReports(), [
    reports,
    reportFilter,
  ]);

  const bestReport = getBestReport();

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleSort = (field: ReportSortField) => {
    if (reportFilter.sortBy === field) {
      setReportFilter({
        sortOrder: reportFilter.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      setReportFilter({ sortBy: field, sortOrder: "desc" });
    }
  };

  const handleCompare = () => {
    if (selectedReportIds.length >= 2 && onSwitchTab) {
      onSwitchTab("comparison");
    }
  };

  const handleBatchExport = () => {
    if (selectedReportIds.length > 0) {
      setShowExportModal(true);
    }
  };

  const handleLoadParams = (id: string) => {
    loadReportParams(id);
  };

  const handleReplay = (id: string) => {
    replayExperiment(id);
  };

  const handleExportHTML = (id: string) => {
    const html = exportReportHTML(id);
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name}_报告.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewReport = (id: string) => {
    setCurrentReport(id);
  };

  const ratingColors = {
    excellent: "text-olive-600 bg-olive-50 border-olive-200",
    good: "text-olive-500 bg-olive-50/50 border-olive-200",
    fair: "text-amber-600 bg-amber-50 border-amber-200",
    poor: "text-rust-500 bg-rust-50 border-rust-200",
  };

  const ratingLabels = {
    excellent: "优秀",
    good: "良好",
    fair: "一般",
    poor: "较差",
  };

  const sortOptions: { key: ReportSortField; label: string }[] = [
    { key: "createdAt", label: "创建时间" },
    { key: "juiceYield", label: "出汁率" },
    { key: "totalJuice", label: "总出汁量" },
    { key: "peakPressure", label: "峰值压力" },
    { key: "stableJuiceTime", label: "稳定时间" },
    { key: "overallScore", label: "综合评分" },
  ];

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-olive-500" />
          历史实验报告
        </h2>
        <div className="flex items-center gap-1">
          {filteredReports.length > 0 && (
            <button
              onClick={() => {
                if (selectedReportIds.length === filteredReports.length) {
                  clearReportSelection();
                } else {
                  selectAllReports(filteredReports.map((r) => r.id));
                }
              }}
              className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1"
              title={selectedReportIds.length === filteredReports.length ? "取消全选" : "全选"}
            >
              {selectedReportIds.length === filteredReports.length ? (
                <CheckSquare size={14} />
              ) : (
                <Square size={14} />
              )}
              全选
            </button>
          )}
          {selectedReportIds.length >= 2 && (
            <button
              onClick={handleCompare}
              className="vintage-btn-primary text-xs px-2 py-1 flex items-center gap-1"
            >
              <GitCompare size={14} />
              对比 {selectedReportIds.length}
            </button>
          )}
          {selectedReportIds.length > 0 && (
            <button
              onClick={handleBatchExport}
              className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1"
            >
              <Share2 size={14} />
              批量导出
            </button>
          )}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1 ${
              showFilters || reportFilter.feasibleOnly || reportFilter.bestOnly || reportFilter.minJuiceYield
                ? "text-olive-600"
                : ""
            }`}
          >
            <Filter size={14} />
            筛选
            {showFilters ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronDown size={12} className="rotate-[-90deg]" />
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="搜索报告名称、标签..."
          value={reportFilter.searchText || ""}
          onChange={(e) => setReportFilter({ searchText: e.target.value })}
          className="vintage-input text-sm pl-8 w-full"
        />
      </div>

      {showFilters && (
        <div className="p-3 bg-wood-50 rounded-md border border-wood-200 space-y-3 animate-fade-in">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-wood-700">
              <input
                type="checkbox"
                checked={reportFilter.feasibleOnly || false}
                onChange={(e) =>
                  setReportFilter({ feasibleOnly: e.target.checked })
                }
                className="accent-olive-500"
              />
              仅显示可行方案
            </label>
            <label className="flex items-center gap-1.5 text-xs text-wood-700">
              <input
                type="checkbox"
                checked={reportFilter.bestOnly || false}
                onChange={(e) => setReportFilter({ bestOnly: e.target.checked })}
                className="accent-amber-500"
              />
              仅显示最佳标记
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-wood-700 whitespace-nowrap">
              最低出汁率：
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={reportFilter.minJuiceYield || 0}
              onChange={(e) =>
                setReportFilter({
                  minJuiceYield: parseInt(e.target.value) || 0,
                })
              }
              className="flex-1 accent-olive-500"
            />
            <span className="text-xs text-wood-600 w-10 text-right">
              {reportFilter.minJuiceYield || 0}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-wood-700 whitespace-nowrap">
              排序方式：
            </span>
            <select
              value={reportFilter.sortBy}
              onChange={(e) =>
                setReportFilter({
                  sortBy: e.target.value as ReportSortField,
                })
              }
              className="vintage-input text-xs py-1 px-2 flex-1"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setReportFilter({
                  sortOrder: reportFilter.sortOrder === "asc" ? "desc" : "asc",
                })
              }
              className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1"
            >
              <ArrowUpDown size={12} />
              {reportFilter.sortOrder === "asc" ? "升序" : "降序"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          共 {filteredReports.length} 份报告
          {bestReport && (
            <span className="ml-2 text-amber-600 flex items-center gap-0.5 inline-flex">
              <Award size={12} />
              最佳：{bestReport.name.slice(0, 10)}
              {bestReport.name.length > 10 && "..."}
            </span>
          )}
        </span>
        {selectedReportIds.length > 0 && (
          <span>已选择 {selectedReportIds.length} 份</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredReports.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8 italic">
            <History size={36} className="mx-auto mb-2 opacity-40" />
            <p>暂无历史报告</p>
            <p className="text-xs mt-1">完成模拟后生成报告即可记录</p>
          </div>
        )}

        {filteredReports.map((report) => {
          const isSelected = selectedReportIds.includes(report.id);
          const isCurrent = currentReport?.id === report.id;
          const diagnosis = report.diagnosis;
          const ratingClass = ratingColors[diagnosis.efficiencyRating];

          return (
            <div
              key={report.id}
              className={`rounded-md border p-3 transition-all cursor-pointer ${
                isCurrent
                  ? "border-olive-400 bg-olive-50/50"
                  : isSelected
                  ? "border-olive-300 bg-olive-50/30"
                  : "border-wood-200 bg-wood-50 hover:bg-wood-100"
              }`}
              onClick={() => handleViewReport(report.id)}
            >
              <div className="flex items-start gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleReportSelection(report.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 accent-olive-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-wood-700 text-sm truncate">
                      {report.name}
                    </span>
                    {report.isBest && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-0.5 flex-shrink-0">
                        <Star size={10} fill="currentColor" />
                        最佳
                      </span>
                    )}
                    {!report.result.feasible && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-rust-100 text-rust-600 rounded flex-shrink-0">
                        不可行
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${ratingClass}`}
                    >
                      {ratingLabels[diagnosis.efficiencyRating]}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {formatDate(report.createdAt)} · 综合评分{" "}
                    <span className="text-wood-700 font-semibold">
                      {report.summary.overallScore}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadParams(report.id);
                    }}
                    className="p-1 text-slate-400 hover:text-olive-500 hover:bg-olive-50 rounded transition-colors"
                    title="加载参数"
                  >
                    <RotateCcw size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplay(report.id);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    title="回放实验"
                  >
                    <Play size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBestReport(report.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      report.isBest
                        ? "text-amber-500 bg-amber-50"
                        : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                    }`}
                    title={report.isBest ? "取消最佳" : "标记最佳"}
                  >
                    <Star
                      size={13}
                      fill={report.isBest ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportHTML(report.id);
                    }}
                    className="p-1 text-slate-400 hover:text-wood-600 hover:bg-wood-100 rounded transition-colors"
                    title="导出报告"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReport(report.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rust-500 hover:bg-rust-50 rounded transition-colors"
                    title="删除报告"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[10px] pl-6">
                <div className="flex items-center gap-1 text-slate-500">
                  <Droplets size={11} className="text-amber-500" />
                  <span>
                    {report.result.totalJuice.toFixed(0)}
                    <span className="text-slate-400">mL</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <TrendingUp size={11} className="text-olive-500" />
                  <span>
                    {report.result.juiceYield.toFixed(1)}
                    <span className="text-slate-400">%</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Gauge size={11} className="text-rust-500" />
                  <span>
                    {report.result.peakPressure.toFixed(0)}
                    <span className="text-slate-400">kPa</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock size={11} className="text-blue-500" />
                  <span>
                    {report.result.stableJuiceTime > 0
                      ? `${report.result.stableJuiceTime.toFixed(0)}s`
                      : "未达"}
                  </span>
                </div>
              </div>

              {report.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 pl-6">
                  {report.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 bg-wood-100 text-wood-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {report.tags.length > 3 && (
                    <span className="text-[9px] text-slate-400">
                      +{report.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BatchExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedReportIds={selectedReportIds}
      />
    </div>
  );
}
