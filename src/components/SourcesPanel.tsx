import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { CitationItem } from '../types';

interface SourcesPanelProps {
  citations: CitationItem[];
  selectedCitationId: string | null;
  onSelectCitation: (id: string | null) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  citations,
  selectedCitationId,
  onSelectCitation,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyExcerpt = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const panelContent = (
    <div className="h-full flex flex-col bg-[#0d0f14] border-l border-white/[0.08]">
      {/* Header */}
      <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white tracking-tight truncate">
              Source Citations
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              {citations.length} grounded passage{citations.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] lg:hidden cursor-pointer focus-ring"
          aria-label="Close sources panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Citations List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {citations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.08] rounded-xl my-auto">
            <FileText className="w-8 h-8 text-neutral-600 mb-2" />
            <h3 className="text-xs font-semibold text-neutral-300">No Sources Active</h3>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[220px]">
              When you ask a question, retrieved document passages and page references will appear here.
            </p>
          </div>
        ) : (
          citations.map((cite) => {
            const isSelected = selectedCitationId === cite.id;
            const isExpanded = !!expandedIds[cite.id] || isSelected;

            return (
              <div
                key={cite.id}
                id={`source-card-${cite.id}`}
                onClick={() => onSelectCitation(cite.id)}
                className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#181b24] border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-[#12141c] hover:bg-[#151821] border-white/[0.06]'
                }`}
              >
                {/* Source Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                      {cite.index}
                    </span>
                    <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                      {cite.documentName}
                    </span>
                  </div>

                  {cite.pageNumber !== null && cite.pageNumber !== undefined && (
                    <span className="text-[11px] font-mono text-neutral-300 px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] shrink-0">
                      Page {cite.pageNumber}
                    </span>
                  )}
                </div>

                {/* Excerpt quote */}
                <div className="border-l-2 border-indigo-500/50 pl-2.5 py-0.5 my-2">
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans line-clamp-3 select-text">
                    "{cite.excerpt}"
                  </p>
                </div>

                {/* Expanded full excerpt details */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Gemini Grounded Match</span>
                      </span>
                      {cite.confidence && (
                        <span className="font-mono text-neutral-400">
                          {Math.round(cite.confidence * 100)}% relevance
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] font-mono text-[11px] text-neutral-300 whitespace-pre-wrap leading-relaxed select-text">
                      {cite.excerpt}
                    </div>

                    {cite.fileSearchStore && (
                      <div className="text-[10px] font-mono text-neutral-500 truncate">
                        Store: {cite.fileSearchStore}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom actions */}
                <div className="mt-2 flex items-center justify-between pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(cite.id);
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-indigo-400 font-medium cursor-pointer transition-colors focus-ring"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        <span>Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        <span>Inspect passage</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleCopyExcerpt(cite.excerpt, cite.id, e)}
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer focus-ring"
                    title="Copy excerpt to clipboard"
                    aria-label="Copy excerpt"
                  >
                    {copiedId === cite.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quiet verification footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0a0c10] text-[11px] text-neutral-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Verifiable Grounding</span>
        </span>
        <span className="font-mono text-[10px] text-neutral-400">Gemini File Search</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Panel */}
      <aside className="hidden lg:block w-80 xl:w-96 h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        {panelContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm h-full z-10 shadow-2xl">
            {panelContent}
          </div>
        </div>
      )}
    </>
  );
};
