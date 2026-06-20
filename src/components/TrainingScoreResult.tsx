import {
  Trophy,
  Award,
  Clock,
  Lightbulb,
  BarChart3,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { TrainingResult } from "../types";

const gradeConfig = {
  excellent: { label: "优秀", color: "text-olive-700", bg: "bg-olive-100", ring: "ring-olive-400" },
  good: { label: "良好", color: "text-blue-700", bg: "bg-blue-100", ring: "ring-blue-400" },
  pass: { label: "及格", color: "text-amber-700", bg: "bg-amber-100", ring: "ring-amber-400" },
  fail: { label: "未通过", color: "text-rust-700", bg: "bg-rust-100", ring: "ring-rust-400" },
};

const severityColors = {
  critical: "bg-rust-100 text-rust-700 border-rust-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

const severityLabels = {
  critical: "严重",
  warning: "警告",
  info: "提示",
};

export default function TrainingScoreResult({ result }: { result: TrainingResult }) {
  const grade = gradeConfig[result.grade];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}分${sec}秒`;
  };

  return (
    <div className="vintage-card p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div
            className={`relative w-20 h-20 rounded-full flex items-center justify-center ${grade.bg} ring-4 ${grade.ring} ring-opacity-30`}
          >
            <Trophy size={32} className={grade.color} />
            <div
              className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center ${grade.bg} border-2 border-white shadow-sm`}
            >
              {result.passed ? (
                <CheckCircle size={16} className="text-olive-600" />
              ) : (
                <XCircle size={16} className="text-rust-600" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-xl text-wood-800">
                {result.totalScore}
                <span className="text-sm font-normal text-wood-500 ml-1">/ {result.maxScore}分</span>
              </h3>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${grade.bg} ${grade.color}`}>
                {grade.label}
              </span>
            </div>
            <p className="text-sm text-wood-600 mb-2">{result.taskTitle}</p>
            <div className="flex items-center gap-4 text-xs text-wood-500">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                用时 {formatTime(result.timeSpent)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Lightbulb size={12} />
                提示 {result.hintsUsed}次
              </span>
              <span className="inline-flex items-center gap-1">
                <Award size={12} />
                {result.passed ? "已通过" : "未通过"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-5xl font-display font-bold" style={{ color: result.passed ? "#65a30d" : "#dc2626" }}>
            {result.percentage}
            <span className="text-xl text-wood-400 font-normal">%</span>
          </div>
          <p className="text-xs text-wood-500 mt-1">综合得分率</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="h-3 w-full bg-wood-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              result.grade === "excellent"
                ? "bg-gradient-to-r from-olive-500 to-olive-400"
                : result.grade === "good"
                ? "bg-gradient-to-r from-blue-500 to-blue-400"
                : result.grade === "pass"
                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : "bg-gradient-to-r from-rust-500 to-rust-400"
            }`}
            style={{ width: `${result.percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={15} className="text-wood-600" />
        <h4 className="text-sm font-display font-bold text-wood-800">各维度评分</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {result.dimensions.map((dim) => {
          const percent = (dim.score / dim.maxScore) * 100;
          return (
            <div
              key={dim.key}
              className="p-3 bg-parchment/50 border border-wood-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-wood-700">{dim.label}</span>
                <span className="text-xs font-mono font-bold text-wood-800">
                  {dim.score}/{dim.maxScore}
                </span>
              </div>
              <div className="h-2 bg-wood-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full ${
                    percent >= 80
                      ? "bg-olive-500"
                      : percent >= 60
                      ? "bg-amber-500"
                      : "bg-rust-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[10px] text-wood-500 leading-snug line-clamp-2">{dim.details}</p>
            </div>
          );
        })}
      </div>

      {result.result && (
        <div className="pt-4 border-t border-wood-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-wood-600" />
            <h4 className="text-sm font-display font-bold text-wood-800">实验数据摘要</h4>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MetricItem label="峰值压力" value={`${result.result.peakPressure.toFixed(0)}`} unit="kPa" />
            <MetricItem label="出汁率" value={`${result.result.juiceYield.toFixed(1)}`} unit="%" />
            <MetricItem label="总出汁量" value={`${result.result.totalJuice.toFixed(0)}`} unit="mL" />
            <MetricItem
              label="稳定时间"
              value={result.result.stableJuiceTime > 0 ? result.result.stableJuiceTime.toFixed(0) : "未达成"}
              unit={result.result.stableJuiceTime > 0 ? "s" : ""}
            />
          </div>
        </div>
      )}

      {result.errors.length > 0 && (
        <div className="pt-4 mt-4 border-t border-wood-100">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={15} className="text-rust-600" />
            <h4 className="text-sm font-display font-bold text-wood-800">
              检测到的问题 ({result.errors.length})
            </h4>
          </div>
          <div className="space-y-2">
            {result.errors.map((err) => (
              <div
                key={err.id}
                className={`p-2.5 rounded-md border ${severityColors[err.severity]}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-white/60">
                    {severityLabels[err.severity]}
                  </span>
                  <span className="text-xs font-semibold">{err.title}</span>
                </div>
                <p className="text-[11px] opacity-80">{err.description}</p>
                <p className="text-[11px] mt-1 opacity-90 font-medium">
                  💡 {err.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="text-center p-2 bg-parchment/40 rounded-md">
      <div className="text-[10px] text-wood-500 mb-0.5">{label}</div>
      <div className="text-sm font-mono font-bold text-wood-800">
        {value}
        <span className="text-[10px] font-normal text-wood-500 ml-0.5">{unit}</span>
      </div>
    </div>
  );
}
