import React from 'react';
import { Menu, BookOpen, Layers, Plus } from 'lucide-react';
import { ActiveView, DocumentRecord } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  selectedDoc: DocumentRecord | null;
  onOpenUpload: () => void;
  onToggleMobileSidebar: () => void;
  onToggleSourcesPanel?: () => void;
  hasCitations?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  selectedDoc,
  onOpenUpload,
  onToggleMobileSidebar,
  onToggleSourcesPanel,
  hasCitations = false,
}) => {
  const titles: Record<ActiveView, { title: string; subtitle: string }> = {
    assistant: {
      title: 'AI Assistant',
      subtitle: 'Ask grounded questions with verifiable page citations',
    },
    documents: {
      title: 'Document Library',
      subtitle: 'PDF repositories indexed with Gemini File Search',
    },
    dashboard: {
      title: 'System Overview',
      subtitle: 'Real-time telemetry and indexing performance',
    },
    activity: {
      title: 'Query Activity',
      subtitle: 'Full audit history of semantic retrieval requests',
    },
    settings: {
      title: 'Settings & Health',
      subtitle: 'RAG parameters, vector engine status, and diagnostics',
    },
  };

  const { title, subtitle } = titles[activeView];

  return (
    <header className="h-16 px-4 lg:px-6 bg-[#0c0e13]/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Mobile toggle & View title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer focus-ring"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm lg:text-base font-semibold text-white tracking-tight truncate">
              {title}
            </h1>
            {activeView === 'assistant' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-400 font-normal">
                <span aria-hidden="true">/</span>
                <span className="truncate max-w-[240px] text-neutral-300">
                  {selectedDoc ? selectedDoc.originalName : 'All Documents'}
                </span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 hidden md:block">{subtitle}</p>
        </div>
      </div>

      {/* Zone 3: Actions (Mobile sources inspector + Upload) */}
      <div className="flex items-center gap-2 shrink-0">
        {activeView === 'assistant' && onToggleSourcesPanel && (
          <button
            onClick={onToggleSourcesPanel}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors lg:hidden min-h-[44px] cursor-pointer focus-ring ${
              hasCitations
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 font-semibold'
                : 'bg-white/[0.04] border-white/[0.08] text-neutral-300'
            }`}
            aria-label="View source citations"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Sources</span>
            {hasCitations && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        )}

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer min-h-[40px] focus-ring"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload PDF</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>
    </header>
  );
};
