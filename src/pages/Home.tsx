import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, FileText, History, FolderOpen, GitCompare, TrendingUp, Award } from "lucide-react";
import PressSideView from "../components/PressSideView";
import ControlPanel from "../components/ControlPanel";
import DataChart from "../components/DataChart";
import ResultMetrics from "../components/ResultMetrics";
import PlanManager from "../components/PlanManager";
import ExperimentReportView from "../components/ExperimentReport";
import ReportHistory from "../components/ReportHistory";
import ReportComparison from "../components/ReportComparison";
import AdjustmentTrajectory from "../components/AdjustmentTrajectory";
import RecommendationPanel from "../components/RecommendationPanel";
import useSimulationLoop from "../hooks/useSimulationLoop";
import { RightPanelTab } from "../types";

export default function Home() {
  useSimulationLoop();
  const [rightTab, setRightTab] = useState<RightPanelTab>("report");
  const [showRightPanel, setShowRightPanel] = useState(true);

  return (
    <div className="min-h-screen w-full text-parchment font-body">
      <header className="w-full border-b border-wood-700/50 backdrop-blur-sm" style={{ background: "rgba(26, 11, 3, 0.7)" }}>
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center wood-grain shadow-vintage">
              <BookOpen size={22} className="text-parchment" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-wide text-wood-100">
                传统压榨机出汁效率模拟系统
              </h1>
              <p className="text-xs text-wood-300 italic">
                Traditional Press Juice Extraction Simulator
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-wood-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rust-500" />
              杠杆力学
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              压力传递
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-olive-500" />
              出汁模型
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          <section className="lg:col-span-3 flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0.05s", opacity: 0 }}>
            <div className="min-h-[560px]">
              <ControlPanel />
            </div>
          </section>

          <section className="lg:col-span-5 flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s", opacity: 0 }}>
            <div className="min-h-[520px]">
              <PressSideView />
            </div>
            <ResultMetrics />
          </section>

          <section className="lg:col-span-4 flex flex-col gap-4 animate-fade-in-up" style={{ animationDelay: "0.25s", opacity: 0 }}>
            <DataChart />
            <div className="flex flex-col">
              <button
                onClick={() => setShowRightPanel((v) => !v)}
                className="vintage-card w-full p-3 flex items-center justify-between hover:bg-wood-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-olive-500" />
                  <span className="font-display font-bold text-wood-700">
                    实验报告与诊断
                  </span>
                </div>
                {showRightPanel ? <ChevronDown size={18} className="text-wood-600" /> : <ChevronRight size={18} className="text-wood-600" />}
              </button>
              {showRightPanel && (
                <div className="mt-2 min-h-[480px] animate-fade-in">
                  <div className="flex flex-wrap gap-x-1 border-b border-wood-200 mb-2">
                    <button
                      onClick={() => setRightTab("report")}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-display font-semibold border-b-2 transition-colors ${
                        rightTab === "report"
                          ? "border-olive-500 text-olive-600"
                          : "border-transparent text-slate-500 hover:text-wood-600"
                      }`}
                    >
                      <FileText size={13} />
                      当前报告
                    </button>
                    <button
                      onClick={() => setRightTab("history")}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-display font-semibold border-b-2 transition-colors ${
                        rightTab === "history"
                          ? "border-olive-500 text-olive-600"
                          : "border-transparent text-slate-500 hover:text-wood-600"
                      }`}
                    >
                      <History size={13} />
                      历史记录
                    </button>
                    <button
                      onClick={() => setRightTab("comparison")}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-display font-semibold border-b-2 transition-colors ${
                        rightTab === "comparison"
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-slate-500 hover:text-wood-600"
                      }`}
                    >
                      <GitCompare size={13} />
                      对比分析
                    </button>
                    <button
                      onClick={() => setRightTab("trajectory")}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-display font-semibold border-b-2 transition-colors ${
                        rightTab === "trajectory"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-wood-600"
                      }`}
                    >
                      <TrendingUp size={13} />
                      调整轨迹
                    </button>
                    <button
                      onClick={() => setRightTab("recommendation")}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-display font-semibold border-b-2 transition-colors ${
                        rightTab === "recommendation"
                          ? "border-rust-500 text-rust-600"
                          : "border-transparent text-slate-500 hover:text-wood-600"
                      }`}
                    >
                      <Award size={13} />
                      方案推荐
                    </button>
                    <button
                      onClick={() => setRightTab("plans")}
                      className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-display font-semibold border-b-2 transition-colors ${
                        rightTab === "plans"
                          ? "border-olive-500 text-olive-600"
                          : "border-transparent text-slate-500 hover:text-wood-600"
                      }`}
                    >
                      <FolderOpen size={13} />
                      方案管理
                    </button>
                  </div>
                  <div className="min-h-[420px]">
                    {rightTab === "report" && <ExperimentReportView />}
                    {rightTab === "history" && <ReportHistory onSwitchTab={setRightTab} />}
                    {rightTab === "comparison" && <ReportComparison />}
                    {rightTab === "trajectory" && <AdjustmentTrajectory />}
                    {rightTab === "recommendation" && <RecommendationPanel />}
                    {rightTab === "plans" && (
                      <div className="min-h-[360px]">
                        <PlanManager />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 pb-4 text-center text-xs text-wood-400/70 border-t border-wood-800/40 pt-4">
          <p>
            物理模型基于杠杆原理与渗流力学简化模型 · 结果仅供教学与研究参考
          </p>
        </footer>
      </main>
    </div>
  );
}
