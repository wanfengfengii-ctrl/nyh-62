import { useState } from "react";
import {
  GraduationCap,
  Target,
  Clock,
  Star,
  ChevronRight,
  BookOpen,
  ClipboardList,
  Award,
  Search,
  Filter,
  Zap,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { TrainingTask, TrainingDifficulty, TrainingMode } from "../types";

const difficultyConfig: Record<TrainingDifficulty, { label: string; color: string; bg: string; stars: number }> = {
  beginner: { label: "入门", color: "text-olive-700", bg: "bg-olive-100", stars: 1 },
  intermediate: { label: "进阶", color: "text-amber-700", bg: "bg-amber-100", stars: 2 },
  advanced: { label: "高级", color: "text-rust-700", bg: "bg-rust-100", stars: 3 },
};

const modeConfig: Record<TrainingMode, { label: string; icon: typeof BookOpen; color: string }> = {
  teaching: { label: "教学模式", icon: BookOpen, color: "text-blue-600" },
  practice: { label: "练习模式", icon: Zap, color: "text-amber-600" },
  exam: { label: "考核模式", icon: Award, color: "text-rust-600" },
};

export default function TrainingTaskSelector() {
  const { getTrainingTaskList, startTrainingTask, training } = usePressStore();
  const [searchText, setSearchText] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<TrainingDifficulty | "all">("all");
  const [filterMode, setFilterMode] = useState<TrainingMode | "all">("all");

  const tasks = getTrainingTaskList();

  const filteredTasks = tasks.filter((task) => {
    if (searchText) {
      const search = searchText.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(search);
      const matchDesc = task.description.toLowerCase().includes(search);
      const matchTags = task.tags.some((t) => t.toLowerCase().includes(search));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    if (filterDifficulty !== "all" && task.difficulty !== filterDifficulty) return false;
    if (filterMode !== "all" && task.mode !== filterMode) return false;
    return true;
  });

  const handleStartTask = (taskId: string) => {
    startTrainingTask(taskId);
  };

  return (
    <div className="vintage-card p-5">
      <div className="flex items-center gap-2 mb-4 border-b border-wood-200 pb-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center wood-grain shadow-sm">
          <GraduationCap size={18} className="text-parchment" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-wood-800">实验训练任务</h2>
          <p className="text-xs text-wood-500">选择任务开始训练与考核</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索任务名称、描述或标签..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-parchment/50 border border-wood-200 rounded-md text-wood-700 placeholder:text-wood-400 focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500/30"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-wood-400" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as TrainingDifficulty | "all")}
              className="pl-8 pr-3 py-2 text-sm bg-parchment/50 border border-wood-200 rounded-md text-wood-700 focus:outline-none focus:border-olive-500 appearance-none cursor-pointer"
            >
              <option value="all">全部难度</option>
              <option value="beginner">入门</option>
              <option value="intermediate">进阶</option>
              <option value="advanced">高级</option>
            </select>
          </div>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as TrainingMode | "all")}
            className="px-3 py-2 text-sm bg-parchment/50 border border-wood-200 rounded-md text-wood-700 focus:outline-none focus:border-olive-500 appearance-none cursor-pointer"
          >
            <option value="all">全部模式</option>
            <option value="teaching">教学</option>
            <option value="practice">练习</option>
            <option value="exam">考核</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-wood-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">没有找到匹配的任务</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onStart={() => handleStartTask(task.id)} />
          ))
        )}
      </div>

      {training.trainingResults.length > 0 && (
        <div className="mt-4 pt-4 border-t border-wood-200">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-amber-600" />
            <span className="text-sm font-display font-semibold text-wood-700">训练记录</span>
            <span className="text-xs text-wood-400">({training.trainingResults.length} 次)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {training.trainingResults.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="px-2.5 py-1 text-xs bg-parchment/60 border border-wood-200 rounded-full text-wood-600"
                title={r.taskTitle}
              >
                <span className={r.passed ? "text-olive-600 font-semibold" : "text-rust-600 font-semibold"}>
                  {r.totalScore}分
                </span>
                <span className="mx-1 text-wood-300">·</span>
                <span className="truncate max-w-[100px] inline-block align-bottom">{r.taskTitle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onStart }: { task: TrainingTask; onStart: () => void }) {
  const diffCfg = difficultyConfig[task.difficulty];
  const modeCfg = modeConfig[task.mode];
  const ModeIcon = modeCfg.icon;

  const formatTarget = () => {
    const parts: string[] = [];
    if (task.targets.minJuiceYield) parts.push(`出汁率≥${task.targets.minJuiceYield}%`);
    if (task.targets.maxPeakPressure) parts.push(`压力≤${task.targets.maxPeakPressure}kPa`);
    if (task.targets.minTotalJuice) parts.push(`出汁量≥${task.targets.minTotalJuice}mL`);
    if (task.targets.maxStableJuiceTime) parts.push(`稳定≤${task.targets.maxStableJuiceTime}s`);
    if (task.targets.targetParams) parts.push(`按指定参数设置`);
    return parts.length > 0 ? parts.join(" / ") : "自由探索";
  };

  return (
    <div className="group p-4 bg-parchment/40 border border-wood-200 rounded-lg hover:border-olive-400 hover:bg-parchment/80 transition-all duration-200 cursor-pointer"
      onClick={onStart}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${diffCfg.bg} ${diffCfg.color}`}>
              {diffCfg.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] ${modeCfg.color}`}>
              <ModeIcon size={11} />
              {modeCfg.label}
            </span>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < diffCfg.stars ? "text-amber-500 fill-amber-500" : "text-wood-300"}
                />
              ))}
            </span>
          </div>
          <h3 className="font-display font-semibold text-wood-800 text-sm mb-1 group-hover:text-olive-700 transition-colors">
            {task.title}
          </h3>
          <p className="text-xs text-wood-500 line-clamp-2 mb-2">{task.description}</p>

          <div className="flex items-center gap-3 text-[11px] text-wood-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {task.duration}分钟
            </span>
            <span className="inline-flex items-center gap-1">
              <Target size={11} />
              {task.steps.length}个步骤
            </span>
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={11} />
              及格 {task.passScore}分
            </span>
          </div>

          {formatTarget() && (
            <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200/50 rounded text-[11px] text-amber-700">
              🎯 {formatTarget()}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <ChevronRight
            size={18}
            className="text-wood-300 group-hover:text-olive-600 transition-colors mt-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {task.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-[10px] bg-wood-100 text-wood-600 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
