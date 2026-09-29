import React from 'react';
import {
  LayoutDashboard,
  Files,
  BotMessageSquare,
  Activity,
  Settings,
  Plus,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Database,
  Layers,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ActiveView, DocumentRecord } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  documents: DocumentRecord[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onOpenUpload: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  documents,
  selectedDocId,
  setSelectedDocId,
  onOpenUpload,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const readyDocs = documents.filter((d) => d.status === 'ready');
  const indexingDocs = documents.filter((d) => d.status === 'indexing' || d.status === 'uploading');

  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'assistant', label: 'AI Assistant', icon: BotMessageSquare },
    { id: 'documents', label: 'Documents', icon: Files, count: documents.length },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'activity', label: 'Query Activity', icon: Activity },
    { id: 'settings', label: 'Settings & Health', icon: Settings },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setIsMobileOpen(false);
  };

  const handleSelectDoc = (id: string | null) => {
    setSelectedDocId(id);
    setActiveView('assistant');
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-[#0d0f14] border-r border-white/[0.08] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Application Navigation"
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-xs shadow-indigo-500/30">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white">Appening AI</span>
                <span className="text-[10px] text-neutral-400 font-mono">v1.0</span>
              </div>
              <p className="text-[11px] text-neutral-400">Document Intelligence</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] lg:hidden cursor-pointer"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onOpenUpload();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer focus-ring"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New PDF</span>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer focus-ring ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[11px] font-mono text-neutral-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Document Selection Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Document Scope
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              {readyDocs.length} indexed
            </span>
          </div>

          <div className="space-y-1">
            {/* Ask Across All Documents option */}
            <button
              onClick={() => handleSelectDoc(null)}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between group cursor-pointer focus-ring ${
                selectedDocId === null && activeView === 'assistant'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold'
                  : 'text-neutral-300 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Layers className={`w-4 h-4 shrink-0 ${selectedDocId === null && activeView === 'assistant' ? 'text-indigo-400' : 'text-neutral-400'}`} />
                <span className="truncate">All Indexed Documents</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {readyDocs.length}
              </span>
            </button>

            {/* Empty state if no documents */}
            {documents.length === 0 ? (
              <div className="p-4 text-center rounded-lg border border-dashed border-white/[0.08] text-neutral-400 my-2">
                <FileText className="w-5 h-5 mx-auto mb-1.5 text-neutral-500" />
                <p className="text-xs text-neutral-300 font-medium">No files uploaded</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Upload a PDF to start</p>
              </div>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDocId === doc.id && activeView === 'assistant';
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors group flex items-start gap-2.5 cursor-pointer focus-ring ${
                      isSelected
                        ? 'bg-white/[0.08] text-white font-medium'
                        : 'text-neutral-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {doc.status === 'ready' && (
                        <FileText className="w-4 h-4 text-indigo-400" />
                      )}
                      {(doc.status === 'indexing' || doc.status === 'uploading') && (
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      )}
                      {doc.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{doc.originalName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-400 font-mono">
                        {doc.status === 'ready' && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Ready
                          </span>
                        )}
                        {doc.status === 'indexing' && (
                          <span className="text-amber-400">
                            Indexing {doc.progressPercent}%
                          </span>
                        )}
                        {doc.status === 'failed' && (
                          <span className="text-rose-400">Error</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{(doc.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer: Quiet connection status */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0a0c10] text-[11px] text-neutral-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Gemini File Search</span>
            </span>
            <span className="font-mono text-emerald-400 text-[10px]">Connected</span>
          </div>
        </div>
      </aside>
    </>
  );
};
