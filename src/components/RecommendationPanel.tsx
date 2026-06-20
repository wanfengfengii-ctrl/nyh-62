import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Cell,
} from "recharts";
import {
  Sparkles,
  Trophy,
  Zap,
  Shield,
  Clock,
  Scale,
  Play,
  Settings,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { RecommendationAnalysis, RecommendationResult, RecommendationCategory } from "../types";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  recommendation: RecommendationResult;
  onLoadParams: () => void;
  onReplay: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryCard({
  title,
  icon,
  color,
  recommendation,
  onLoadParams,
  onReplay,
  isExpanded,
  onToggle,
}: CategoryCardProps) {
  const { report, score, rank, highlights, tradeoffs } = recommendation;
  const colorClasses: Record<string, string> = {
    olive: "bg-olive-50 border-olive-200 text-olive-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    rust: "bg-rust-50 border-rust-200 text-rust-700",
  };

  return (
    <div className={`rounded-md border ${colorClasses[color]} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white/60">{icon}</div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm">{title}</span>
              {rank === 1 && (
                <Trophy size={12} className="text-amber-600" fill="currentColor" />
              )}
            </div>
            <div className="text-[10px] opacity-75">
              {report.name} · {score.toFixed(1)} 分
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-white/60 px-2 py-0.5 rounded">
            #{rank}
          </span>
          {isExpanded ? (
            <ChevronDown size={16} className="opacity-60" />
          ) : (
            <ChevronUp size={16} className="opacity-60" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-current/20 bg-white/40">
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="p-2 bg-white/60 rounded">
              <div className="text-[9px] opacity-75">出汁率</div>
              <div className="font-bold text-sm">{report.result.juiceYield.toFixed(1)}%</div>
            </div>
            <div className="p-2 bg-white/60 rounded">
              <div className="text-[9px] opacity-75">峰值压力</div>
              <div className="font-bold text-sm">{report.result.peakPressure.toFixed(0)}kPa</div>
            </div>
            <div className="p-2 bg-white/60 rounded">
              <div className="text-[9px] opacity-75">稳定时间</div>
              <div className="font-bold text-sm">
                {report.result.stableJuiceTime > 0 ? `${report.result.stableJuiceTime.toFixed(0)}s` : "未达"}
              </div>
            </div>
          </div>

          {highlights.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] font-semibold mb-1 flex items-center gap-1">
                <CheckCircle size={10} />
                优势
              </div>
              <div className="flex flex-wrap gap-1">
                {highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 bg-white/70 rounded border border-current/20"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tradeoffs.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle size={10} />
                权衡
              </div>
              <div className="flex flex-wrap gap-1">
                {tradeoffs.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 bg-white/70 rounded border border-rust-300/50 text-rust-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onLoadParams}
              className="flex-1 py-1.5 px-2 text-xs rounded bg-white hover:bg-wood-50 border border-current/30 flex items-center justify-center gap-1 transition-colors"
            >
              <Settings size={12} />
              加载参数
            </button>
            <button
              onClick={onReplay}
              className="flex-1 py-1.5 px-2 text-xs rounded bg-white hover:bg-wood-50 border border-current/30 flex items-center justify-center gap-1 transition-colors"
            >
              <Play size={12} />
              回放实验
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendationPanel() {
  const { reports, getRecommendationAnalysis, loadReportParams, replayExperiment, setCurrentReport } =
    usePressStore();

  const [expandedCategory, setExpandedCategory] = useState<RecommendationCategory | null>("balance");
  const [showInsights, setShowInsights] = useState(true);

  const analysis = useMemo<RecommendationAnalysis | null>(() => {
    return getRecommendationAnalysis();
  }, [reports]);

  const feasibleReports = useMemo(() => reports.filter((r) => r.result.feasible), [reports]);

  const categoryConfig: Record<RecommendationCategory, { label: string; icon: React.ReactNode; color: string }> = {
    efficiency: { label: "效率最优", icon: <Zap size={16} className="text-amber-600" />, color: "amber" },
    safety: { label: "安全优先", icon: <Shield size={16} className="text-blue-600" />, color: "blue" },
    stability: { label: "稳定可靠", icon: <Clock size={16} className="text-olive-600" />, color: "olive" },
    balance: { label: "综合均衡", icon: <Scale size={16} className="text-rust-600" />, color: "rust" },
  };

  const radarData = useMemo(() => {
    if (!analysis) return [];
    const categories: RecommendationCategory[] = ["efficiency", "safety", "stability", "balance"];
    return categories.map((cat) => {
      const rec = analysis.recommendations.find((r) => r.category === cat && r.rank === 1);
      const data: Record<string, any> = {
        category: categoryConfig[cat].label,
        score: rec?.score || 0,
        fill: categoryConfig[cat].color === "olive" ? "#556B2F" : categoryConfig[cat].color === "amber" ? "#DAA520" : categoryConfig[cat].color === "blue" ? "#4682B4" : "#8B4513",
      };
      return data;
    });
  }, [analysis]);

  const comparisonMatrixData = useMemo(() => {
    if (!analysis) return [];
    const { reportIds, matrix } = analysis.comparisonMatrix;
    return reportIds.map((id, i) => {
      const report = reports.find((r) => r.id === id);
      const row: Record<string, any> = {
        name: report?.name?.slice(0, 8) || `方案${i + 1}`,
      };
      reportIds.forEach((_, j) => {
        row[`vs_${j}`] = matrix[i][j];
      });
      return row;
    });
  }, [analysis, reports]);

  if (!analysis || feasibleReports.length === 0) {
    return (
      <div className="vintage-card p-4 flex flex-col gap-4 h-full">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-olive-500" />
          最佳方案推荐
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Sparkles size={48} className="mb-3 opacity-40" />
          <p className="text-sm">暂无推荐数据</p>
          <p className="text-xs mt-1">请先完成至少 1 次可行的模拟实验</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-olive-500" />
          最佳方案推荐
        </h2>
        <span className="text-xs px-2 py-0.5 bg-olive-100 text-olive-700 rounded-full">
          {feasibleReports.length} 个可行方案
        </span>
      </div>

      <div className="relative p-4 bg-gradient-to-r from-olive-50 via-amber-50 to-olive-50 border border-olive-200 rounded-md overflow-hidden">
        <div className="absolute top-2 right-2">
          <Award size={24} className="text-amber-500 opacity-30" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} className="text-amber-600" fill="currentColor" />
            <span className="font-display font-bold text-olive-800 text-sm">
              🏆 综合最佳方案
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-wood-800 mb-1">
            {analysis.overallBest.report.name}
          </h3>
          <p className="text-xs text-wood-600 mb-3">
            综合评分 <span className="font-bold text-olive-700">{analysis.overallBest.score.toFixed(1)} 分</span>
            {" · "}
            出汁率 {analysis.overallBest.report.result.juiceYield.toFixed(1)}%
            {" · "}
            峰值压力 {analysis.overallBest.report.result.peakPressure.toFixed(0)} kPa
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                loadReportParams(analysis.overallBest.report.id);
                setCurrentReport(analysis.overallBest.report.id);
              }}
              className="px-3 py-1.5 text-xs bg-olive-500 hover:bg-olive-600 text-white rounded-md flex items-center gap-1 transition-colors"
            >
              <Settings size={12} />
              加载参数
            </button>
            <button
              onClick={() => replayExperiment(analysis.overallBest.report.id)}
              className="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-md flex items-center gap-1 transition-colors"
            >
              <Play size={12} />
              回放实验
            </button>
          </div>
        </div>
      </div>

      {analysis.insights.length > 0 && (
        <div className="border border-amber-200 rounded-md overflow-hidden">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-600" />
              <span className="font-display font-bold text-amber-800 text-sm">
                数据洞察 ({analysis.insights.length})
              </span>
            </div>
            {showInsights ? (
              <ChevronDown size={16} className="text-amber-600" />
            ) : (
              <ChevronUp size={16} className="text-amber-600" />
            )}
          </button>
          {showInsights && (
            <div className="p-3 space-y-2 bg-white">
              {analysis.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-wood-700"
                >
                  <TrendingUp size={12} className="text-olive-500 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <div className="border border-wood-200 rounded-md overflow-hidden">
          <div className="bg-wood-50 p-3 border-b border-wood-200">
            <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
              <Target size={14} className="text-amber-500" />
              各维度最佳方案评分
            </h3>
          </div>
          <div className="h-[160px] p-2 bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radarData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4B98C" opacity={0.4} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "#6B3410" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#6B3410" }}
                  label={{
                    value: "评分",
                    angle: -90,
                    position: "insideLeft",
                    offset: 8,
                    fill: "#6B3410",
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#F5F0E6",
                    border: "1px solid #8B4513",
                    borderRadius: 4,
                    fontSize: 11,
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} 分`, "评分"]}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {radarData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {analysis.comparisonMatrix.reportIds.length >= 2 && (
          <div className="border border-wood-200 rounded-md overflow-hidden">
            <div className="bg-wood-50 p-3 border-b border-wood-200">
              <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
                <Scale size={14} className="text-blue-500" />
                方案对比矩阵（分差）
              </h3>
            </div>
            <div className="p-2 bg-white overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr>
                    <th className="p-1.5 text-left text-wood-600">vs</th>
                    {analysis.comparisonMatrix.reportIds.map((id, i) => {
                      const report = reports.find((r) => r.id === id);
                      return (
                        <th key={i} className="p-1.5 text-center text-wood-600 min-w-[50px]">
                          {report?.name?.slice(0, 4) || `S${i + 1}`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrixData.map((row, i) => (
                    <tr key={i} className="hover:bg-wood-50/50">
                      <td className="p-1.5 font-semibold text-wood-700">{row.name}</td>
                      {analysis.comparisonMatrix.reportIds.map((_, j) => {
                        const val = row[`vs_${j}`];
                        return (
                          <td
                            key={j}
                            className={`p-1.5 text-center font-mono ${
                              i === j
                                ? "bg-wood-100/50 text-slate-400"
                                : val > 0
                                ? "text-olive-600"
                                : val < 0
                                ? "text-rust-600"
                                : "text-slate-500"
                            }`}
                          >
                            {i === j ? "-" : val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <h3 className="font-display font-bold text-wood-700 text-sm">
            分类推荐
          </h3>
          {(Object.keys(categoryConfig) as RecommendationCategory[]).map((cat) => {
            const rec = analysis.recommendations.find((r) => r.category === cat && r.rank === 1);
            if (!rec) return null;
            return (
              <CategoryCard
                key={cat}
                title={categoryConfig[cat].label}
                icon={categoryConfig[cat].icon}
                color={categoryConfig[cat].color}
                recommendation={rec}
                onLoadParams={() => {
                  loadReportParams(rec.report.id);
                  setCurrentReport(rec.report.id);
                }}
                onReplay={() => replayExperiment(rec.report.id)}
                isExpanded={expandedCategory === cat}
                onToggle={() =>
                  setExpandedCategory(expandedCategory === cat ? null : cat)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
