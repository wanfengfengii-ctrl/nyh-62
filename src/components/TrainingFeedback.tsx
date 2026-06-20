import {
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Target,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { TrainingResult } from "../types";

const priorityConfig = {
  high: { color: "text-rust-700", bg: "bg-rust-50", border: "border-rust-200", dot: "bg-rust-500", label: "高" },
  medium: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", label: "中" },
  low: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", label: "低" },
};

export default function TrainingFeedbackPanel({ result }: { result: TrainingResult }) {
  const { feedback } = result;

  return (
    <div className="vintage-card p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-wood-200 pb-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center wood-grain shadow-sm">
          <Lightbulb size={18} className="text-parchment" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-wood-800">训练反馈与改进建议</h3>
          <p className="text-xs text-wood-500">基于你的表现自动生成</p>
        </div>
      </div>

      {feedback.strengths.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-olive-100 flex items-center justify-center">
              <ThumbsUp size={14} className="text-olive-700" />
            </div>
            <h4 className="text-sm font-display font-bold text-wood-800">做得好的方面</h4>
            <span className="text-xs text-olive-600 ml-auto bg-olive-50 px-2 py-0.5 rounded-full">
              {feedback.strengths.length}项
            </span>
          </div>
          <div className="space-y-2 ml-9">
            {feedback.strengths.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 bg-olive-50/60 border border-olive-200/50 rounded-md"
              >
                <span className="text-olive-600 mt-0.5">✓</span>
                <p className="text-sm text-wood-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.weaknesses.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-700" />
            </div>
            <h4 className="text-sm font-display font-bold text-wood-800">需要改进的方面</h4>
            <span className="text-xs text-amber-600 ml-auto bg-amber-50 px-2 py-0.5 rounded-full">
              {feedback.weaknesses.length}项
            </span>
          </div>
          <div className="space-y-2 ml-9">
            {feedback.weaknesses.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 bg-amber-50/60 border border-amber-200/50 rounded-md"
              >
                <span className="text-amber-600 mt-0.5">!</span>
                <p className="text-sm text-wood-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.suggestions.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Target size={14} className="text-blue-700" />
            </div>
            <h4 className="text-sm font-display font-bold text-wood-800">具体改进建议</h4>
            <span className="text-xs text-blue-600 ml-auto bg-blue-50 px-2 py-0.5 rounded-full">
              {feedback.suggestions.length}条
            </span>
          </div>
          <div className="space-y-2 ml-9">
            {feedback.suggestions.map((s, i) => {
              const cfg = priorityConfig[s.priority];
              return (
                <div
                  key={i}
                  className={`p-3 rounded-md border ${cfg.bg} ${cfg.border}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-bold ${cfg.color}`}>
                      优先级：{cfg.label}
                    </span>
                    <h5 className="text-sm font-semibold text-wood-800 ml-1">{s.title}</h5>
                  </div>
                  <p className="text-sm text-wood-700 leading-relaxed mb-2">{s.description}</p>
                  {s.expectedImprovement && (
                    <div className="flex items-start gap-1.5 pt-2 border-t border-white/50">
                      <TrendingUp size={12} className="text-olive-600 mt-0.5 flex-shrink-0" />
                      <p className="text-[12px] text-olive-700 leading-relaxed">
                        <span className="font-semibold">预期效果：</span>
                        {s.expectedImprovement}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {feedback.knowledgeGaps.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen size={14} className="text-purple-700" />
            </div>
            <h4 className="text-sm font-display font-bold text-wood-800">知识点补强建议</h4>
          </div>
          <div className="ml-9 bg-purple-50/50 border border-purple-200/50 rounded-md p-3">
            <ul className="space-y-1.5">
              {feedback.knowledgeGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-wood-700">
                  <ChevronRight size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {feedback.nextSteps.length > 0 && (
        <div className="pt-4 border-t border-wood-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-wood-100 flex items-center justify-center">
              <ArrowRight size={14} className="text-wood-700" />
            </div>
            <h4 className="text-sm font-display font-bold text-wood-800">下一步行动</h4>
          </div>
          <div className="ml-9 space-y-2">
            {feedback.nextSteps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 bg-wood-50 border border-wood-200 rounded-md"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-wood-200 flex items-center justify-center text-[11px] font-bold text-wood-700">
                  {i + 1}
                </span>
                <p className="text-sm text-wood-700 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
