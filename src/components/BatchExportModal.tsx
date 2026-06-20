import { useState, useMemo } from "react";
import {
  X,
  Download,
  Share2,
  FileText,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  Copy,
  Clock,
  AlertTriangle,
  CopyCheck,
} from "lucide-react";
import { usePressStore } from "../store/usePressStore";
import { ExportFormat, BatchExportOptions, ShareLinkData } from "../types";

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReportIds: string[];
}

export default function BatchExportModal({ isOpen, onClose, selectedReportIds }: BatchExportModalProps) {
  const { reports, exportReportsBatch, generateShareLink } = usePressStore();

  const [format, setFormat] = useState<ExportFormat>("html");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [includeDiagnosis, setIncludeDiagnosis] = useState(true);
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState<number | undefined>(undefined);

  const selectedReports = useMemo(() => {
    return selectedReportIds
      .map((id) => reports.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);
  }, [selectedReportIds, reports]);

  const shareLinkUrl = useMemo(() => {
    if (!shareLink) return "";
    return window.location.origin + window.location.pathname + "?share=" + shareLink.id;
  }, [shareLink]);

  const handleExport = () => {
    const options: BatchExportOptions = {
      format,
      includeCharts,
      includeRawData,
      includeDiagnosis,
    };
    const content = exportReportsBatch(selectedReportIds, options);
    const mimeTypes: Record<ExportFormat, string> = {
      html: "text/html;charset=utf-8",
      json: "application/json;charset=utf-8",
      csv: "text/csv;charset=utf-8",
      pdf: "application/pdf",
    };
    const extensions: Record<ExportFormat, string> = {
      html: "html",
      json: "json",
      csv: "csv",
      pdf: "pdf",
    };
    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toLocaleDateString("zh-CN").replace(/\//g, "-");
    a.download = `实验报告_${selectedReportIds.length}组_${dateStr}.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateShareLink = () => {
    const link = generateShareLink(selectedReportIds, expiresInHours);
    setShareLink(link);
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLinkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  const formatOptions: { key: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: "html", label: "HTML", icon: <FileText size={18} />, desc: "带样式的网页格式，适合打印和展示" },
    { key: "json", label: "JSON", icon: <FileJson size={18} />, desc: "结构化数据，适合程序处理" },
    { key: "csv", label: "CSV", icon: <FileSpreadsheet size={18} />, desc: "表格格式，适合Excel分析" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="vintage-card w-full max-w-lg animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
        <div className="flex items-center justify-between p-4 border-b border-wood-200">
          <h3 className="font-display font-bold text-xl text-wood-700 flex items-center gap-2">
            <Download size={20} className="text-olive-500" />
            批量导出与分享
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-wood-600 hover:bg-wood-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 bg-wood-50 rounded-md border border-wood-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-wood-700">已选择报告</span>
              <span className="text-xs px-2 py-0.5 bg-olive-100 text-olive-700 rounded-full">
                {selectedReports.length} 份
              </span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto">
              {selectedReports.map((r) => (
                <span
                  key={r.id}
                  className="text-[10px] px-1.5 py-0.5 bg-white border border-wood-200 text-wood-600 rounded"
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-wood-700 mb-2 block">
              导出格式
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFormat(opt.key)}
                  className={`p-3 rounded-md border-2 transition-all text-center ${
                    format === opt.key
                      ? "border-olive-500 bg-olive-50"
                      : "border-wood-200 bg-white hover:border-wood-400"
                  }`}
                >
                  <div className="mb-1 flex justify-center">
                    {opt.icon}
                  </div>
                  <div className="text-xs font-semibold text-wood-700">{opt.label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {format !== "csv" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-wood-700 block">
                导出选项
              </label>
              <label className="flex items-center gap-2 text-xs text-wood-600">
                <input
                  type="checkbox"
                  checked={includeDiagnosis}
                  onChange={(e) => setIncludeDiagnosis(e.target.checked)}
                  className="accent-olive-500"
                />
                包含诊断分析
              </label>
              <label className="flex items-center gap-2 text-xs text-wood-600">
                <input
                  type="checkbox"
                  checked={includeRawData}
                  onChange={(e) => setIncludeRawData(e.target.checked)}
                  className="accent-olive-500"
                />
                包含原始时序数据
              </label>
            </div>
          )}

          <div className="border-t border-wood-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Share2 size={18} className="text-blue-500" />
              <span className="text-sm font-semibold text-wood-700">生成分享链接</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-wood-600">有效期：</span>
              <select
                value={expiresInHours ?? ""}
                onChange={(e) =>
                  setExpiresInHours(e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="vintage-input text-xs py-1 px-2 flex-1"
              >
                <option value="">永久有效</option>
                <option value="24">24 小时</option>
                <option value="72">3 天</option>
                <option value="168">7 天</option>
              </select>
            </div>

            {!shareLink ? (
              <button
                onClick={handleGenerateShareLink}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={16} />
                生成分享链接
              </button>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">
                    链接已生成
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLinkUrl}
                    className="vintage-input text-xs flex-1 py-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <CopyCheck size={14} /> : <Copy size={14} />}
                    {copied ? "已复制" : "复制"}
                  </button>
                </div>
                {shareLink.expiresAt && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-600">
                    <Clock size={10} />
                    有效期至 {new Date(shareLink.expiresAt).toLocaleString("zh-CN")}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedReports.some((r) => r.result.feasible === false) && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">
                  包含不可行方案
                </p>
                <p className="text-[10px] text-amber-700">
                  {selectedReports.filter((r) => !r.result.feasible).length} 份报告包含不可行方案的实验数据
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-wood-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-wood-600 hover:bg-wood-100 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-olive-500 hover:bg-olive-600 text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <Download size={16} />
            导出 {selectedReports.length} 份报告
          </button>
        </div>
      </div>
    </div>
  );
}
