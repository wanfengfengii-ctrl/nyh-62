import { useState } from "react";
import {
  FileText,
  Download,
  Star,
  Tag,
  Edit3,
  Trash2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  Droplets,
  Gauge,
  BarChart3,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Award,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { ExperimentReport, AnomalyIssue, OptimizationSuggestion } from "../types";

interface ReportSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ReportSection({ title, icon, children, defaultOpen = true }: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-wood-200 rounded-md overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 bg-wood-50 hover:bg-wood-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-wood-600">{icon}</span>
          <span className="font-display font-bold text-wood-700 text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-wood-500" />
        ) : (
          <ChevronRight size={16} className="text-wood-500" />
        )}
      </button>
      {isOpen && <div className="p-3 border-t border-wood-200 bg-white">{children}</div>}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  icon,
  color = "wood",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: "wood" | "olive" | "amber" | "rust" | "blue";
}) {
  const colorClasses = {
    wood: "text-wood-600 bg-wood-50 border-wood-200",
    olive: "text-olive-600 bg-olive-50 border-olive-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    rust: "text-rust-600 bg-rust-50 border-rust-200",
    blue: "text-blue-600 bg-blue-50 border-blue-200",
  };
  
  return (
    <div className={`p-3 rounded-md border ${colorClasses[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] font-medium opacity-80">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-display font-bold">{value}</span>
        {unit && <span className="text-[10px] opacity-70">{unit}</span>}
      </div>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: AnomalyIssue }) {
  const severityConfig = {
    critical: {
      bg: "bg-red-50",
      border: "border-red-300",
      text: "text-red-700",
      icon: <AlertCircle size={16} className="text-red-600" />,
      label: "严重",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700",
      icon: <AlertCircle size={16} className="text-amber-600" />,
      label: "警告",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      text: "text-blue-700",
      icon: <AlertCircle size={16} className="text-blue-600" />,
      label: "提示",
    },
  };
  
  const config = severityConfig[anomaly.severity];
  
  return (
    <div className={`p-3 rounded-md border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-display font-bold text-sm ${config.text}`}>
              {anomaly.title}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.text} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-slate-600">{anomaly.description}</p>
          <div className="text-[10px] text-slate-400 mt-1">
            类别：{anomaly.category}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: OptimizationSuggestion }) {
  const priorityConfig = {
    high: {
      bg: "bg-rust-50",
      border: "border-rust-300",
      text: "text-rust-700",
      label: "高优先级",
    },
    medium: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700",
      label: "中优先级",
    },
    low: {
      bg: "bg-olive-50",
      border: "border-olive-300",
      text: "text-olive-700",
      label: "低优先级",
    },
  };
  
  const config = priorityConfig[suggestion.priority];
  
  return (
    <div className={`p-3 rounded-md border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-2">
        <Lightbulb size={16} className={`mt-0.5 ${config.text}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-display font-bold text-sm ${config.text}`}>
              {suggestion.title}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.text} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-2">{suggestion.description}</p>
          <div className="flex items-center gap-1 text-[11px] text-olive-600">
            <TrendingUp size={12} />
            <span>预期效果：{suggestion.expectedImprovement}</span>
          </div>
          {suggestion.paramAdjustments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-wood-200/50">
              <span className="text-[10px] text-slate-500">建议调整参数：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestion.paramAdjustments.map((adj, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-wood-200 text-wood-600"
                  >
                    {adj.direction === "increase" ? "↑" : "↓"} {adj.key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExperimentReportView() {
  const {
    currentReport,
    simulationResult,
    params,
    generateReport,
    toggleBestReport,
    deleteReport,
    renameReport,
    addReportTag,
    removeReportTag,
    updateReportNotes,
    exportReportHTML,
  } = usePressStore();

  const [reportName, setReportName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const handleGenerateReport = () => {
    const id = generateReport(reportName);
    if (id) {
      setReportName("");
    }
  };

  const handleExportHTML = () => {
    if (!currentReport) return;
    const html = exportReportHTML(currentReport.id);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentReport.name}_报告.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartRename = () => {
    if (!currentReport) return;
    setEditNameValue(currentReport.name);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (!currentReport || !editNameValue.trim()) return;
    renameReport(currentReport.id, editNameValue);
    setIsEditingName(false);
  };

  const handleAddTag = () => {
    if (!currentReport || !newTag.trim()) return;
    addReportTag(currentReport.id, newTag.trim());
    setNewTag("");
  };

  const handleStartEditNotes = () => {
    if (!currentReport) return;
    setNotesValue(currentReport.notes || "");
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    if (!currentReport) return;
    updateReportNotes(currentReport.id, notesValue);
    setIsEditingNotes(false);
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const ratingConfig = {
    excellent: { label: "优秀", color: "text-olive-600", bg: "bg-olive-100" },
    good: { label: "良好", color: "text-olive-500", bg: "bg-olive-50" },
    fair: { label: "一般", color: "text-amber-600", bg: "bg-amber-50" },
    poor: { label: "较差", color: "text-rust-500", bg: "bg-rust-50" },
  };

  if (!currentReport && !simulationResult) {
    return (
      <div className="vintage-card p-4 flex flex-col gap-4 h-full">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          实验报告与诊断
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <FileText size={48} className="mb-3 opacity-40" />
          <p className="text-sm">请先完成模拟以生成报告</p>
          <p className="text-xs mt-1">启动模拟后可查看完整分析</p>
        </div>
      </div>
    );
  }

  const report = currentReport;
  const summary = report?.summary;
  const stageAnalysis = report?.stageAnalysis || [];
  const diagnosis = report?.diagnosis;

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          实验报告与诊断
        </h2>
        {report && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleBestReport(report.id)}
              className={`p-1.5 rounded-md transition-colors ${
                report.isBest
                  ? "text-amber-500 bg-amber-50"
                  : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
              }`}
              title={report.isBest ? "取消最佳标记" : "标记为最佳"}
            >
              <Star size={16} fill={report.isBest ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleExportHTML}
              className="vintage-btn-secondary text-xs px-2 py-1 flex items-center gap-1"
              title="导出报告"
            >
              <Download size={14} />
              导出
            </button>
          </div>
        )}
      </div>

      {!report && simulationResult && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="输入报告名称..."
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="vintage-input text-sm flex-1"
          />
          <button
            onClick={handleGenerateReport}
            className="vintage-btn-primary text-sm px-3 flex items-center gap-1 whitespace-nowrap"
          >
            <FileText size={14} />
            生成报告
          </button>
        </div>
      )}

      {report && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="vintage-input text-sm flex-1"
                  autoFocus
                />
                <button onClick={handleSaveRename} className="text-olive-600 p-1">
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-rust-500 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-wood-700 truncate">
                  {report.name}
                </h3>
                <button
                  onClick={handleStartRename}
                  className="text-slate-400 hover:text-wood-600"
                >
                  <Edit3 size={12} />
                </button>
                {report.isBest && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-0.5">
                    <Award size={10} />
                    最佳
                  </span>
                )}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              {formatDate(report.createdAt)}
            </p>
          </div>
          <button
            onClick={() => deleteReport(report.id)}
            className="text-slate-400 hover:text-rust-500 p-1"
            title="删除报告"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {report && report.tags && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag size={12} className="text-slate-400" />
          {report.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-wood-100 text-wood-600 rounded flex items-center gap-0.5"
            >
              {tag}
              <button
                onClick={() => removeReportTag(report.id, tag)}
                className="hover:text-rust-500"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="添加标签..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              className="w-20 text-[10px] px-1.5 py-0.5 border border-wood-200 rounded bg-white"
            />
            <button
              onClick={handleAddTag}
              className="text-[10px] text-olive-600 hover:text-olive-700"
            >
              添加
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {summary && diagnosis && (
          <ReportSection title="实验总览" icon={<BarChart3 size={16} />}>
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-display font-bold px-2 py-0.5 rounded ${ratingConfig[diagnosis.efficiencyRating].color} ${ratingConfig[diagnosis.efficiencyRating].bg}`}
                >
                  效率评级：{ratingConfig[diagnosis.efficiencyRating].label}
                </span>
                <span className="text-xs text-slate-500">
                  综合评分：{summary.overallScore} 分
                </span>
              </div>
              <p className="text-xs text-slate-600">{diagnosis.overallAssessment}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SummaryCard
                label="总出汁量"
                value={summary.totalJuice.toFixed(0)}
                unit="mL"
                icon={<Droplets size={14} />}
                color="amber"
              />
              <SummaryCard
                label="出汁率"
                value={summary.juiceYield.toFixed(1)}
                unit="%"
                icon={<TrendingUp size={14} />}
                color="olive"
              />
              <SummaryCard
                label="峰值压力"
                value={summary.peakPressure.toFixed(0)}
                unit="kPa"
                icon={<Gauge size={14} />}
                color="rust"
              />
              <SummaryCard
                label="残渣含水率"
                value={summary.residueMoisture.toFixed(1)}
                unit="%"
                icon={<Droplets size={14} />}
                color="wood"
              />
              <SummaryCard
                label="稳定时间"
                value={summary.stableJuiceTime > 0 ? summary.stableJuiceTime.toFixed(0) : "未达"}
                unit="s"
                icon={<Clock size={14} />}
                color="blue"
              />
              <SummaryCard
                label="总时长"
                value={summary.totalDuration.toFixed(0)}
                unit="s"
                icon={<Clock size={14} />}
                color="wood"
              />
            </div>
          </ReportSection>
        )}

        <ReportSection title="关键参数" icon={<Gauge size={16} />}>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-wood-100">
                <td className="py-1.5 text-slate-500 w-24">结构参数</td>
                <td className="py-1.5 text-wood-700">
                  杠杆长度 {(report?.params || params).leverLength}m ·
                  挂点位置 {((report?.params || params).fulcrumPosition * 100).toFixed(0)}% ·
                  压盘 Ø{(report?.params || params).plateDiameter.toFixed(2)}m
                </td>
              </tr>
              <tr className="border-b border-wood-100">
                <td className="py-1.5 text-slate-500">载荷参数</td>
                <td className="py-1.5 text-wood-700">
                  压石重量 {(report?.params || params).stoneWeight}kg
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-slate-500">物料参数</td>
                <td className="py-1.5 text-wood-700">
                  果料 {(report?.params || params).fruitWeight}kg ·
                  含水率 {(report?.params || params).moistureContent}%
                </td>
              </tr>
            </tbody>
          </table>
        </ReportSection>

        {stageAnalysis.length > 0 && (
          <ReportSection title="压榨阶段分析" icon={<BarChart3 size={16} />}>
            <div className="space-y-2">
              {stageAnalysis.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-wood-50 rounded-md border border-wood-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-semibold text-sm text-wood-700">
                      {stage.stageName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {stage.startTime.toFixed(0)}s - {stage.endTime.toFixed(0)}s
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] mb-1.5">
                    <div>
                      <span className="text-slate-500">平均压力</span>
                      <div className="font-semibold text-wood-700">
                        {stage.avgPressure.toFixed(1)} kPa
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">产汁量</span>
                      <div className="font-semibold text-amber-600">
                        {stage.juiceProduced.toFixed(0)} mL
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">出汁速率</span>
                      <div className="font-semibold text-olive-600">
                        {stage.juiceRate.toFixed(2)} mL/s
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">{stage.description}</p>
                </div>
              ))}
            </div>
          </ReportSection>
        )}

        {diagnosis && diagnosis.anomalies.length > 0 && (
          <ReportSection
            title={`异常检测 (${diagnosis.anomalies.length})`}
            icon={<AlertCircle size={16} />}
            defaultOpen={diagnosis.anomalies.some((a) => a.severity === "critical")}
          >
            <div className="space-y-2">
              {diagnosis.anomalies.map((anomaly) => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          </ReportSection>
        )}

        {diagnosis && diagnosis.suggestions.length > 0 && (
          <ReportSection
            title={`优化建议 (${diagnosis.suggestions.length})`}
            icon={<Lightbulb size={16} />}
          >
            <div className="space-y-2">
              {diagnosis.suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          </ReportSection>
        )}

        {report && (
          <ReportSection title="实验备注" icon={<Edit3 size={16} />} defaultOpen={false}>
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="vintage-input text-sm w-full h-24 resize-none"
                  placeholder="记录实验观察、注意事项等..."
                />
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="vintage-btn-secondary text-xs px-2 py-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="vintage-btn-primary text-xs px-2 py-1"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleStartEditNotes}
                className="cursor-pointer min-h-[40px] text-sm text-slate-600 hover:bg-wood-50 rounded p-2 -m-2"
              >
                {report.notes || (
                  <span className="text-slate-400 italic text-xs">
                    点击添加备注...
                  </span>
                )}
              </div>
            )}
          </ReportSection>
        )}
      </div>
    </div>
  );
}
