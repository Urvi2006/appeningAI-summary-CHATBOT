import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  BotMessageSquare,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { DocumentRecord } from '../types';

interface DocumentsViewProps {
  documents: DocumentRecord[];
  selectedDocId: string | null;
  onSelectDoc: (id: string | null) => void;
  onDeleteDoc: (id: string) => Promise<void>;
  onOpenUpload: () => void;
  onNavigateToAssistant: () => void;
  onGenerateSample: () => Promise<void>;
  isGeneratingSample: boolean;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onDeleteDoc,
  onOpenUpload,
  onNavigateToAssistant,
  onGenerateSample,
  isGeneratingSample,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this document and delete its Gemini File Search store?')) {
      return;
    }
    setDeletingId(id);
    try {
      await onDeleteDoc(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Document Repository
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            PDF documents indexed into Google Gemini File Search vector stores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerateSample}
            disabled={isGeneratingSample}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.08] bg-[#12141c] hover:bg-[#181b24] text-neutral-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 focus-ring"
          >
            {isGeneratingSample ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Sample Handbook</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer focus-ring"
          >
            <Plus className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents by filename..."
          className="w-full bg-[#0e1017] border border-white/[0.08] rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          aria-label="Filter documents by name"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#0e1017] space-y-3">
          <FileText className="w-8 h-8 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-200">
            {searchQuery ? 'No documents match your search' : 'No documents in repository'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Try another search term or clear the filter query.'
              : 'Upload a PDF or generate the test handbook to begin indexing.'}
          </p>
          {!searchQuery && (
            <div className="pt-2">
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer focus-ring"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <div
                key={doc.id}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#141722] border-indigo-500/60 ring-1 ring-indigo-500/20'
                    : 'bg-[#0e1017] border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>

                    <div>
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
                    </div>
                  </div>

                  {/* Title and metadata */}
                  <h3 className="text-xs sm:text-sm font-semibold text-white truncate mb-2">
                    {doc.originalName}
                  </h3>
                  <div className="space-y-1 text-[11px] text-neutral-400 font-mono">
                    <div className="flex items-center justify-between">
                      <span>Size:</span>
                      <span className="text-neutral-300">{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Format:</span>
                      <span className="text-neutral-300">PDF Document</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Added:</span>
                      <span className="text-neutral-300">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Questions asked:</span>
                      <span className="text-indigo-400 font-semibold">{doc.questionsCount || 0}</span>
                    </div>
                  </div>

                  {doc.status === 'indexing' && (
                    <div className="mt-3 space-y-1">
                      <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                          style={{ width: `${doc.progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{doc.statusStep}</p>
                    </div>
                  )}

                  {doc.errorMessage && (
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                      {doc.errorMessage}
                    </div>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectDoc(doc.id);
                      onNavigateToAssistant();
                    }}
                    disabled={doc.status !== 'ready'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-colors disabled:opacity-30 cursor-pointer focus-ring"
                  >
                    <BotMessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Questions</span>
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-white/[0.06] transition-colors disabled:opacity-40 cursor-pointer focus-ring"
                    title="Delete document and store"
                    aria-label={`Delete ${doc.originalName}`}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
