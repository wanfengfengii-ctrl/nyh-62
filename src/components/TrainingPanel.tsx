import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  X,
  Target,
  Send,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  EyeOff,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import TrainingScoreResult from "./TrainingScoreResult";
import TrainingFeedbackPanel from "./TrainingFeedback";

export default function TrainingPanel() {
  const {
    training,
    nextTrainingStep,
    prevTrainingStep,
    setCurrentTrainingStep,
    toggleTrainingHints,
    useHint,
    submitTrainingResult,
    resetTraining,
    simulationState,
  } = usePressStore();

  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const { activeTask, currentStepIndex, status, startTime, hintsUsed, showHints, lastResult } = training;

  useEffect(() => {
    if (status !== "in_progress" || !startTime) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [status, startTime]);

  useEffect(() => {
    setShowHint(false);
  }, [currentStepIndex]);

  if (!activeTask) return null;

  const currentStep = activeTask.steps[currentStepIndex];
  const isLastStep = currentStepIndex === activeTask.steps.length - 1;
  const isCompleted = status === "completed";

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const formatTargetSummary = () => {
    const parts: string[] = [];
    const t = activeTask.targets;
    if (t.minJuiceYield) parts.push(`出汁率 ≥ ${t.minJuiceYield}%`);
    if (t.maxPeakPressure) parts.push(`峰值压力 ≤ ${t.maxPeakPressure}kPa`);
    if (t.minTotalJuice) parts.push(`出汁量 ≥ ${t.minTotalJuice}mL`);
    if (t.maxStableJuiceTime) parts.push(`稳定时间 ≤ ${t.maxStableJuiceTime}s`);
    if (t.maxResidueMoisture) parts.push(`残渣含水率 ≤ ${t.maxResidueMoisture}%`);
    if (t.targetParams) parts.push("按指定参数设置");
    return parts;
  };

  const canSubmit = isLastStep && simulationState.status === "finished";

  const handleSubmit = () => {
    submitTrainingResult();
  };

  const handleRevealHint = () => {
    if (!showHint) {
      useHint();
      setShowHint(true);
    }
  };

  if (isCompleted && lastResult) {
    return (
      <div className="space-y-4">
        <div className="vintage-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-wood-800">训练完成</h3>
            <button
              onClick={resetTraining}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-wood-600 hover:text-wood-800 bg-wood-100 hover:bg-wood-200 rounded-md transition-colors"
            >
              <X size={13} />
              返回任务列表
            </button>
          </div>
        </div>
        <TrainingScoreResult result={lastResult} />
        <TrainingFeedbackPanel result={lastResult} />
      </div>
    );
  }

  return (
    <div className="vintage-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-wood-200">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-md flex items-center justify-center wood-grain shadow-sm">
              <BookOpen size={15} className="text-parchment" />
            </div>
            <div>
              <h3 className="font-display font-bold text-wood-800 text-sm leading-tight">
                {activeTask.title}
              </h3>
              <p className="text-[11px] text-wood-500">
                {activeTask.mode === "teaching" ? "教学模式" : activeTask.mode === "practice" ? "练习模式" : "考核模式"}
                {" · "}及格 {activeTask.passScore}分
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-wood-100 rounded-md">
            <Clock size={13} className="text-wood-500" />
            <span className="text-xs font-mono font-semibold text-wood-700">
              {formatTime(elapsed)}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-md">
            <Lightbulb size={13} className="text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">提示 {hintsUsed}</span>
          </div>
          <button
            onClick={resetTraining}
            className="p-1.5 rounded-md hover:bg-wood-100 text-wood-500 hover:text-wood-700 transition-colors"
            title="退出训练"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-wood-600">训练进度</span>
          <span className="text-xs text-wood-500">
            {currentStepIndex + 1} / {activeTask.steps.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {activeTask.steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentTrainingStep(idx)}
              className="flex-1 group relative"
              title={step.title}
            >
              <div
                className={`h-2 rounded-full transition-all ${
                  idx < currentStepIndex
                    ? "bg-olive-500"
                    : idx === currentStepIndex
                    ? "bg-amber-500"
                    : "bg-wood-200"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {activeTask.steps.map((step, idx) => (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1"
            >
              {idx <= currentStepIndex ? (
                <CheckCircle2 size={14} className={idx < currentStepIndex ? "text-olive-600" : "text-amber-600"} />
              ) : (
                <Circle size={14} className="text-wood-300" />
              )}
              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  idx <= currentStepIndex ? "text-wood-700" : "text-wood-400"
                }`}
              >
                步骤{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Target size={13} className="text-amber-700" />
          <span className="text-xs font-semibold text-amber-800">任务目标</span>
        </div>
        <ul className="space-y-0.5">
          {formatTargetSummary().map((item, i) => (
            <li key={i} className="text-[11px] text-amber-700 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              {item}
            </li>
          ))}
          {formatTargetSummary().length === 0 && (
            <li className="text-[11px] text-amber-700">自由探索，完成一次完整实验</li>
          )}
        </ul>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-display font-bold text-wood-800">
            步骤 {currentStepIndex + 1}：{currentStep.title}
          </h4>
          {showHints && currentStep.hint && (
            <button
              onClick={handleRevealHint}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded transition-colors"
            >
              {showHint ? <Eye size={12} /> : <EyeOff size={12} />}
              {showHint ? "隐藏提示" : "查看提示"}
            </button>
          )}
        </div>
        <p className="text-sm text-wood-600 leading-relaxed mb-2">{currentStep.description}</p>

        {showHint && currentStep.hint && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3 animate-fade-in">
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-amber-800 mb-0.5">操作提示</p>
                <p className="text-[12px] text-amber-700 leading-relaxed">{currentStep.hint}</p>
              </div>
            </div>
          </div>
        )}

        {currentStep.paramTargets && Object.keys(currentStep.paramTargets).length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(currentStep.paramTargets).map(([key, val]) => {
              const labels: Record<string, { label: string; unit: string }> = {
                leverLength: { label: "杠杆长度", unit: "m" },
                fulcrumPosition: { label: "挂点位置", unit: "%" },
                plateDiameter: { label: "压盘直径", unit: "m" },
                stoneWeight: { label: "压石重量", unit: "kg" },
                fruitWeight: { label: "果料重量", unit: "kg" },
                moistureContent: { label: "含水率", unit: "%" },
              };
              const info = labels[key] || { label: key, unit: "" };
              const displayVal = key === "fulcrumPosition" ? `${(val as number) * 100}%` : `${val}${info.unit}`;
              return (
                <div
                  key={key}
                  className="px-2.5 py-1.5 bg-parchment/60 border border-wood-200 rounded text-center"
                >
                  <div className="text-[10px] text-wood-500">{info.label}</div>
                  <div className="text-xs font-semibold text-wood-700">{displayVal}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {currentStep.expectedAction === "start_simulation" && simulationState.status !== "finished" && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <AlertCircle size={14} className="text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            参数设置完成后，请在左侧控制面板点击「开始模拟」按钮启动实验
          </p>
        </div>
      )}

      {currentStep.expectedAction === "check_result" && simulationState.status === "finished" && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-olive-50 border border-olive-200 rounded-md">
          <CheckCircle2 size={14} className="text-olive-600 flex-shrink-0" />
          <p className="text-xs text-olive-700">实验已完成！检查结果后可提交评分</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-wood-100">
        <button
          onClick={prevTrainingStep}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-wood-100 text-wood-700 hover:bg-wood-200"
        >
          <ArrowLeft size={13} />
          上一步
        </button>

        <button
          onClick={toggleTrainingHints}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-wood-500 hover:text-wood-700 hover:bg-wood-50 rounded-md transition-colors"
        >
          {showHints ? <EyeOff size={13} /> : <Eye size={13} />}
          {showHints ? "关闭提示" : "开启提示"}
        </button>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-olive-600 text-white hover:bg-olive-700 shadow-sm"
          >
            <Send size={13} />
            提交评分
            {!canSubmit && simulationState.status !== "finished" && (
              <span className="text-[10px] opacity-80">(需完成模拟)</span>
            )}
          </button>
        ) : (
          <button
            onClick={nextTrainingStep}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors bg-olive-600 text-white hover:bg-olive-700 shadow-sm"
          >
            下一步
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {activeTask.learningObjectives && activeTask.learningObjectives.length > 0 && (
        <div className="mt-4 pt-4 border-t border-wood-100">
          <p className="text-[10px] font-semibold text-wood-500 uppercase tracking-wide mb-1.5">
            学习目标
          </p>
          <ul className="space-y-0.5">
            {activeTask.learningObjectives.map((obj, i) => (
              <li key={i} className="text-[11px] text-wood-600 flex items-start gap-1.5">
                <span className="text-olive-500 mt-0.5">✓</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
