import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import PressSideView from "../components/PressSideView";
import ControlPanel from "../components/ControlPanel";
import DataChart from "../components/DataChart";
import ResultMetrics from "../components/ResultMetrics";
import PlanManager from "../components/PlanManager";
import useSimulationLoop from "../hooks/useSimulationLoop";

export default function Home() {
  useSimulationLoop();
  const [showPlans, setShowPlans] = useState(true);

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
                onClick={() => setShowPlans((v) => !v)}
                className="vintage-card w-full p-3 flex items-center justify-between hover:bg-wood-100 transition-colors"
              >
                <span className="font-display font-bold text-wood-700 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-wood-500" />
                  实验方案管理
                  <span className="text-xs text-slate-500 font-normal">
                    （点击展开/收起）
                  </span>
                </span>
                {showPlans ? <ChevronDown size={18} className="text-wood-600" /> : <ChevronRight size={18} className="text-wood-600" />}
              </button>
              {showPlans && (
                <div className="mt-2 min-h-[360px] animate-fade-in">
                  <PlanManager />
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
