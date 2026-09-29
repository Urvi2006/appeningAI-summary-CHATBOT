import React from 'react';
import {
  Files,
  BotMessageSquare,
  Plus,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DocumentRecord, SystemStatus } from '../types';

interface DashboardViewProps {
  status: SystemStatus | null;
  documents: DocumentRecord[];
  selectedDoc: DocumentRecord | null;
  onOpenUpload: () => void;
  onSelectDoc: (id: string | null) => void;
  onNavigateToAssistant: () => void;
  onGenerateSample: () => Promise<void>;
  isGeneratingSample: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  documents,
  selectedDoc,
  onOpenUpload,
  onSelectDoc,
  onNavigateToAssistant,
  onGenerateSample,
  isGeneratingSample,
}) => {
  const readyDocs = documents.filter((d) => d.status === 'ready');
  const indexingDocs = documents.filter((d) => d.status === 'indexing' || d.status === 'uploading');
  const totalQuestions = status?.totalQuestions || 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 bg-[#0e1017] border border-white/[0.08] shadow-xs">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Appening AI Document Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Enterprise document search grounded in Google Gemini File Search. Upload PDF policies,
            reports, and manuals to retrieve fact-based answers with page citations.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer focus-ring"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF Document</span>
            </button>
            <button
              onClick={onNavigateToAssistant}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-[#141722] hover:bg-[#1a1e2c] text-neutral-200 text-xs font-medium transition-colors cursor-pointer focus-ring"
            >
              <BotMessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Open AI Assistant</span>
            </button>
            {documents.length === 0 && (
              <button
                onClick={onGenerateSample}
                disabled={isGeneratingSample}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 focus-ring"
              >
                {isGeneratingSample ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span>Generate Test Handbook</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real Application Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e1017] space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Documents</span>
            <Files className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{documents.length}</div>
          <div className="text-[11px] text-neutral-400">
            {readyDocs.length} ready · {indexingDocs.length} processing
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e1017] space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Questions Answered</span>
            <BotMessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalQuestions}</div>
          <div className="text-[11px] text-neutral-400">Recorded in audit log</div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e1017] space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Selected Context</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-white truncate font-sans">
            {selectedDoc ? selectedDoc.originalName : 'All Documents'}
          </div>
          <div className="text-[11px] text-neutral-400">
            {selectedDoc ? `${(selectedDoc.size / 1024).toFixed(0)} KB` : 'Multi-document scope'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0e1017] space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Vector Engine</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Online</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">Gemini File Search</div>
        </div>
      </div>

      {/* System Telemetry */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] p-5 space-y-3">
        <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Verified System Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#12141c] border border-white/[0.06]">
            <span className="text-neutral-400 block text-[11px]">Retrieval Engine</span>
            <span className="text-white font-mono font-medium mt-1 block">
              Google Gemini File Search
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#12141c] border border-white/[0.06]">
            <span className="text-neutral-400 block text-[11px]">Primary Model</span>
            <span className="text-white font-mono font-medium mt-1 block">
              gemini-3.1-flash-lite / flash-latest
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#12141c] border border-white/[0.06]">
            <span className="text-neutral-400 block text-[11px]">Security Isolation</span>
            <span className="text-emerald-400 font-mono font-medium mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Server-Side Isolated</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Files className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Indexed Documents</h3>
            <span className="text-[11px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-white/[0.06]">
              {documents.length}
            </span>
          </div>
          <button
            onClick={onOpenUpload}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer focus-ring"
          >
            + Add PDF
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-300 font-medium">No documents uploaded yet</p>
            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
              Upload any PDF or generate the test handbook to test real vector search and citations.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer focus-ring"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
                      {doc.originalName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 font-mono">
                      <span>{(doc.size / 1024).toFixed(0)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.questionsCount || 0} questions asked</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {doc.status === 'ready' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </span>
                  )}
                  {(doc.status === 'indexing' || doc.status === 'uploading') && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Indexing {doc.progressPercent}%</span>
                    </span>
                  )}
                  {doc.status === 'failed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Failed</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      onSelectDoc(doc.id);
                      onNavigateToAssistant();
                    }}
                    disabled={doc.status !== 'ready'}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-colors cursor-pointer focus-ring"
                    title="Ask questions about this document"
                    aria-label={`Ask questions about ${doc.originalName}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
