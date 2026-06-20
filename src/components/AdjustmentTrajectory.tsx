import { useMemo, useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Route,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  TrendingUp,
  Lightbulb,
  Settings,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { TrajectoryAnalysis, StructureAdjustmentRecord } from "../types";

interface RecordCardProps {
  record: StructureAdjustmentRecord;
  index: number;
  isActive: boolean;
  isOptimal: boolean;
  onClick: () => void;
  onLoadParams: () => void;
}

function RecordCard({
  record,
  index,
  isActive,
  isOptimal,
  onClick,
  onLoadParams,
}: RecordCardProps) {
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-md border cursor-pointer transition-all ${
        isActive
          ? "border-olive-400 bg-olive-50/50 shadow-sm"
          : isOptimal
          ? "border-amber-300 bg-amber-50/50"
          : "border-wood-200 bg-wood-50 hover:bg-wood-100"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-wood-200 text-wood-700 flex items-center justify-center text-[10px] font-bold">
            #{index + 1}
          </span>
          {isOptimal && (
            <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded flex items-center gap-0.5">
              <Zap size={8} fill="currentColor" />
              最优
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoadParams();
          }}
          className="p-1 text-slate-400 hover:text-olive-600 hover:bg-olive-50 rounded transition-colors"
          title="加载此参数"
        >
          <Settings size={12} />
        </button>
      </div>

      <div className="text-[10px] text-slate-500 mb-2">{formatDate(record.timestamp)}</div>

      {record.improvementScore !== 0 && (
        <div className="flex items-center gap-1 mb-2">
          <TrendingUp
            size={12}
            className={record.improvementScore > 0 ? "text-olive-500" : "text-rust-500"}
          />
          <span
            className={`text-[11px] font-bold ${
              record.improvementScore > 0 ? "text-olive-600" : "text-rust-600"
            }`}
          >
            {record.improvementScore > 0 ? "+" : ""}
            {record.improvementScore.toFixed(1)} 分
          </span>
        </div>
      )}

      <div className="space-y-1">
        {record.paramChanges
          .filter((c) => c.delta !== 0)
          .slice(0, 3)
          .map((change, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px]">
              <span className="text-slate-600">{change.paramLabel}</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">{change.oldValue.toFixed(2)}</span>
                <ArrowRight size={10} className="text-slate-400" />
                <span
                  className={`font-mono font-semibold ${
                    change.impact === "positive"
                      ? "text-olive-600"
                      : change.impact === "negative"
                      ? "text-rust-600"
                      : "text-slate-700"
                  }`}
                >
                  {change.newValue.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        {record.paramChanges.filter((c) => c.delta !== 0).length > 3 && (
          <div className="text-[10px] text-slate-400">
            +{record.paramChanges.filter((c) => c.delta !== 0).length - 3} 项变更
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdjustmentTrajectory() {
  const {
    adjustmentRecords,
    getTrajectoryAnalysis,
    playbackState,
    startPlayback,
    pausePlayback,
    stepPlayback,
    setPlaybackSpeed,
    resetPlayback,
    applyPlaybackState,
    loadReportParams,
    setParams,
  } = usePressStore();

  const [expandedInsights, setExpandedInsights] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("overallScore");
  const playbackIntervalRef = useRef<number | null>(null);

  const trajectoryData = useMemo<TrajectoryAnalysis | null>(() => {
    return getTrajectoryAnalysis();
  }, [adjustmentRecords]);

  useEffect(() => {
    if (playbackState.isPlaying && playbackState.history.length > 0) {
      playbackIntervalRef.current = window.setInterval(() => {
        const { currentIndex, history } = playbackState;
        if (currentIndex < history.length - 1) {
          stepPlayback("forward");
        } else {
          pausePlayback();
        }
      }, 2000 / playbackState.speed);
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    };
  }, [playbackState.isPlaying, playbackState.speed, playbackState.history.length, playbackState.currentIndex]);

  const handleLoadRecordParams = (record: StructureAdjustmentRecord) => {
    setParams({ ...record.newParams });
  };

  const handleApplyPlayback = () => {
    applyPlaybackState(playbackState.currentIndex);
  };

  const metricInfo = useMemo(() => {
    const metrics = [
      { key: "overallScore", label: "综合评分", color: "#556B2F", unit: "分" },
      { key: "juiceYield", label: "出汁率", color: "#8B4513", unit: "%" },
      { key: "totalJuice", label: "总出汁量", color: "#DAA520", unit: "mL" },
      { key: "peakPressure", label: "峰值压力", color: "#CD5C5C", unit: "kPa" },
      { key: "stableJuiceTime", label: "稳定时间", color: "#4682B4", unit: "s" },
    ];
    return metrics.find((m) => m.key === selectedMetric) || metrics[0];
  }, [selectedMetric]);

  const trendChartData = useMemo(() => {
    if (!trajectoryData) return [];
    const metricTrend = trajectoryData.resultTrends.find(
      (t) => t.metricKey === selectedMetric
    );
    if (!metricTrend) return [];
    return metricTrend.values.map((v, idx) => ({
      index: idx + 1,
      value: v.value,
      delta: v.delta,
      timestamp: new Date(v.timestamp).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [trajectoryData, selectedMetric]);

  const paramTrendChartData = useMemo(() => {
    if (!trajectoryData) return [];
    return trajectoryData.records.map((record, idx) => ({
      index: idx + 1,
      improvement: record.improvementScore,
      timestamp: new Date(record.timestamp).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }, [trajectoryData]);

  if (!trajectoryData || trajectoryData.records.length === 0) {
    return (
      <div className="vintage-card p-4 flex flex-col gap-4 h-full">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          结构调整轨迹分析
        </h2>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Route size={48} className="mb-3 opacity-40" />
          <p className="text-sm">暂无调整轨迹</p>
          <p className="text-xs mt-1">修改参数并生成报告后将自动记录调整轨迹</p>
        </div>
      </div>
    );
  }

  const optimalIds = new Set(trajectoryData.optimalPath.map((r) => r.id));

  return (
    <div className="vintage-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-wood-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          结构调整轨迹分析
        </h2>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500">共 {trajectoryData.records.length} 次调整</span>
          {trajectoryData.overallImprovement !== 0 && (
            <span
              className={`px-2 py-0.5 rounded font-semibold ${
                trajectoryData.overallImprovement > 0
                  ? "bg-olive-100 text-olive-700"
                  : "bg-rust-100 text-rust-700"
              }`}
            >
              {trajectoryData.overallImprovement > 0 ? "+" : ""}
              {trajectoryData.overallImprovement.toFixed(1)} 分
            </span>
          )}
        </div>
      </div>

      {trajectoryData.keyInsights.length > 0 && (
        <div className="border border-amber-200 rounded-md overflow-hidden">
          <button
            onClick={() => setExpandedInsights(!expandedInsights)}
            className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-600" />
              <span className="font-display font-bold text-amber-800 text-sm">
                关键洞察 ({trajectoryData.keyInsights.length})
              </span>
            </div>
            {expandedInsights ? (
              <ChevronDown size={16} className="text-amber-600" />
            ) : (
              <ChevronUp size={16} className="text-amber-600" />
            )}
          </button>
          {expandedInsights && (
            <div className="p-3 space-y-2 bg-white">
              {trajectoryData.keyInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-wood-700"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border border-wood-200 rounded-md p-3 bg-wood-50/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
            <Target size={14} className="text-blue-500" />
            参数回放控制
          </h3>
          <select
            value={playbackState.speed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="vintage-input text-[10px] py-0.5 px-1.5"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={resetPlayback}
            className="p-1.5 rounded-md bg-wood-100 hover:bg-wood-200 text-wood-700 transition-colors"
            title="重置"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => stepPlayback("backward")}
            disabled={playbackState.currentIndex === 0}
            className="p-1.5 rounded-md bg-wood-100 hover:bg-wood-200 text-wood-700 transition-colors disabled:opacity-40"
            title="上一步"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={playbackState.isPlaying ? pausePlayback : startPlayback}
            className="p-2 rounded-md bg-olive-500 hover:bg-olive-600 text-white transition-colors"
            title={playbackState.isPlaying ? "暂停" : "播放"}
          >
            {playbackState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => stepPlayback("forward")}
            disabled={playbackState.currentIndex >= playbackState.history.length - 1}
            className="p-1.5 rounded-md bg-wood-100 hover:bg-wood-200 text-wood-700 transition-colors disabled:opacity-40"
            title="下一步"
          >
            <SkipForward size={14} />
          </button>
          <button
            onClick={handleApplyPlayback}
            className="px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs transition-colors flex items-center gap-1"
          >
            <Settings size={12} />
            应用
          </button>
        </div>

        <div className="text-center text-xs text-slate-500">
          第 {playbackState.currentIndex + 1} / {playbackState.history.length} 次调整
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <div className="border border-wood-200 rounded-md overflow-hidden">
          <div className="bg-wood-50 p-3 border-b border-wood-200 flex items-center justify-between">
            <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
              <TrendingUp size={14} className="text-olive-500" />
              指标趋势变化
            </h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="vintage-input text-[10px] py-0.5 px-1.5"
            >
              <option value="overallScore">综合评分</option>
              <option value="juiceYield">出汁率</option>
              <option value="totalJuice">总出汁量</option>
              <option value="peakPressure">峰值压力</option>
              <option value="stableJuiceTime">稳定时间</option>
            </select>
          </div>
          <div className="h-[180px] p-2 bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4B98C" opacity={0.4} />
                <XAxis
                  dataKey="index"
                  tick={{ fontSize: 10, fill: "#6B3410" }}
                  label={{
                    value: "调整次数",
                    position: "insideBottomRight",
                    offset: -2,
                    fill: "#6B3410",
                    fontSize: 10,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6B3410" }}
                  label={{
                    value: metricInfo.unit,
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
                  formatter={(value: number) => [`${value.toFixed(2)} ${metricInfo.unit}`, metricInfo.label]}
                />
                <ReferenceLine
                  y={trendChartData[0]?.value}
                  stroke="#9CA3AF"
                  strokeDasharray="4 3"
                  label={{
                    value: "基线",
                    position: "insideTopLeft",
                    fill: "#9CA3AF",
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metricInfo.color}
                  strokeWidth={2.5}
                  dot={{ fill: metricInfo.color, r: 4 }}
                  activeDot={{ r: 6, fill: metricInfo.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-wood-200 rounded-md overflow-hidden">
          <div className="bg-wood-50 p-3 border-b border-wood-200">
            <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2">
              <Gauge size={14} className="text-amber-500" />
              每次调整效果评分
            </h3>
          </div>
          <div className="h-[150px] p-2 bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paramTrendChartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4B98C" opacity={0.4} />
                <XAxis
                  dataKey="index"
                  tick={{ fontSize: 10, fill: "#6B3410" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6B3410" }}
                  label={{
                    value: "提升分数",
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
                  formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(1)} 分`, "效果"]}
                />
                <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={1} />
                <Bar dataKey="improvement" radius={[4, 4, 0, 0]}>
                  {paramTrendChartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.improvement >= 0 ? "#556B2F" : "#CD5C5C"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-display font-bold text-wood-700 text-sm flex items-center gap-2 pt-2">
            <Route size={14} className="text-wood-500" />
            调整历史记录
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {trajectoryData.records.map((record, idx) => (
              <RecordCard
                key={record.id}
                record={record}
                index={idx}
                isActive={playbackState.history[playbackState.currentIndex]?.id === record.id}
                isOptimal={optimalIds.has(record.id)}
                onClick={() => {
                  const historyIndex = playbackState.history.findIndex((h) => h.id === record.id);
                  if (historyIndex >= 0) {
                    applyPlaybackState(historyIndex);
                  }
                }}
                onLoadParams={() => handleLoadRecordParams(record)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
