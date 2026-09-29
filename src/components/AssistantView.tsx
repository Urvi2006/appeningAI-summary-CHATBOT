import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  RotateCcw,
  BookOpen,
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Plus,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { ChatMessage, CitationItem, DocumentRecord } from '../types';
import { AgentActivityIndicator } from './AgentActivityIndicator';

interface AssistantViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isGenerating: boolean;
  selectedDoc: DocumentRecord | null;
  documents: DocumentRecord[];
  onSelectDoc: (id: string | null) => void;
  onClearChat: () => void;
  onSelectCitation: (id: string | null) => void;
  selectedCitationId: string | null;
  onOpenUpload: () => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  messages,
  onSendMessage,
  isGenerating,
  selectedDoc,
  documents,
  onSelectDoc,
  onClearChat,
  onSelectCitation,
  selectedCitationId,
  onOpenUpload,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const readyDocs = documents.filter((d) => d.status === 'ready');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const promptCategories = [
    {
      category: 'Travel & Per Diems',
      prompts: [
        'What is the maximum daily meal per diem for domestic travel?',
        'What are the hotel and lodging caps for tier-1 cities?',
      ],
    },
    {
      category: 'Remote Work & Equipment',
      prompts: [
        'What is the monthly home internet reimbursement stipend?',
        'How much is the one-time home office setup grant?',
      ],
    },
    {
      category: 'Deadlines & Approvals',
      prompts: [
        'What are the expense report submission deadlines?',
        'What are the approval tiers for expenses exceeding $2,500?',
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#090a0e]">
      {/* Scope Sub-Header */}
      <div className="px-4 py-2 bg-[#0d0f14] border-b border-white/[0.08] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-neutral-400 font-medium shrink-0">Document Context:</span>
          <div className="relative">
            <select
              value={selectedDoc?.id || ''}
              onChange={(e) => onSelectDoc(e.target.value || null)}
              className="appearance-none bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium rounded-lg pl-2.5 pr-7 py-1.5 text-white cursor-pointer focus-ring max-w-[280px] sm:max-w-md truncate"
              aria-label="Select active document scope"
            >
              <option value="" className="bg-[#12141a] text-white">
                All Indexed Documents ({readyDocs.length})
              </option>
              {readyDocs.map((doc) => (
                <option key={doc.id} value={doc.id} className="bg-[#12141a] text-white">
                  {doc.originalName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] text-xs font-medium transition-colors cursor-pointer focus-ring"
              title="Clear conversation history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto space-y-6">
        {messages.length === 0 ? (
          <div className="py-6 sm:py-10 space-y-8 max-w-2xl mx-auto">
            {/* Header info */}
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ask questions about your documents
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg mx-auto">
                Answers are grounded strictly in the uploaded PDF using Google Gemini File Search.
                Page numbers and exact source passages are cited automatically.
              </p>
            </div>

            {/* Active Document Info Card */}
            {selectedDoc ? (
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#12141c] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/15 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-white truncate">
                      {selectedDoc.originalName}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <span>{(selectedDoc.size / 1024).toFixed(0)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 font-medium">Ready for questions</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : readyDocs.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/[0.1] bg-[#12141c]/50 text-center space-y-3">
                <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
                <div>
                  <h3 className="text-sm font-semibold text-white">No documents ready yet</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Upload a PDF document to begin asking grounded questions.
                  </p>
                </div>
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer focus-ring"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload PDF Document</span>
                </button>
              </div>
            ) : null}

            {/* Structured Prompt Recommendations */}
            <div className="space-y-4">
              <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase block text-center">
                Sample Questions
              </span>

              <div className="space-y-3">
                {promptCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-400 block px-1">
                      {cat.category}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.prompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            setInputText(prompt);
                            textareaRef.current?.focus();
                          }}
                          className="text-left p-3 rounded-lg border border-white/[0.08] bg-[#12141c] hover:bg-[#181b24] text-xs text-neutral-300 transition-colors flex items-start justify-between gap-2 group cursor-pointer focus-ring"
                        >
                          <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-indigo-400 shrink-0 mt-0.5 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    A
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-xl p-4 space-y-3 ${
                    isUser
                      ? 'bg-[#1e2230] text-white border border-white/[0.08]'
                      : 'bg-[#12141c] border border-white/[0.08] text-neutral-100 shadow-xs'
                  }`}
                >
                  {/* Header info for Assistant response */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px] text-neutral-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Appening AI</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[200px] text-neutral-300">
                          {message.documentName || 'Document Context'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyMessage(message.id, message.content)}
                        className="text-neutral-400 hover:text-white p-1 rounded transition-colors cursor-pointer focus-ring"
                        title="Copy answer text"
                        aria-label="Copy answer to clipboard"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="text-[13.5px] leading-relaxed font-sans">
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none text-[13.5px] space-y-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>
                            ),
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">{children}</strong>
                            ),
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 rounded bg-black/40 text-indigo-300 font-mono text-xs">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Citations section on Assistant messages */}
                  {!isUser && message.citations && message.citations.length > 0 && (
                    <div className="pt-2.5 border-t border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Sources Cited ({message.citations.length})</span>
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          Click to inspect passage
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {message.citations.map((cite) => {
                          const isSelected = selectedCitationId === cite.id;
                          return (
                            <button
                              key={cite.id}
                              onClick={() => {
                                onSelectCitation(cite.id);
                                const el = document.getElementById(`source-card-${cite.id}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer focus-ring ${
                                isSelected
                                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 border border-white/[0.08]'
                              }`}
                              title={`Inspect source passage from ${cite.documentName}`}
                            >
                              <span className="font-bold text-[11px] text-indigo-300">
                                #{cite.index}
                              </span>
                              <span className="truncate max-w-[130px] font-sans">
                                {cite.documentName}
                              </span>
                              {cite.pageNumber !== null && cite.pageNumber !== undefined && (
                                <span className="text-neutral-400 font-normal">
                                  p.{cite.pageNumber}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Anti-hallucination note if ungrounded */}
                  {!isUser && message.isGrounded === false && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <span>
                        The system confirmed that this question is not supported by the document.
                        No speculative or non-document facts were generated.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading state with agent activity */}
        {isGenerating && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              A
            </div>
            <div className="max-w-[90%] sm:max-w-[82%] rounded-xl p-4 bg-[#12141c] border border-white/[0.08] space-y-3">
              <AgentActivityIndicator
                steps={[
                  { id: '1', label: 'Analyzing natural language question', status: 'completed' },
                  { id: '2', label: 'Searching document vector store', status: 'in_progress' },
                  { id: '3', label: 'Retrieving grounded sections & citations', status: 'pending' },
                  { id: '4', label: 'Composing verified response', status: 'pending' },
                ]}
                currentStatusText="Searching Gemini File Search Store..."
                isGenerating={true}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-[#0d0f14]/90 backdrop-blur-md border-t border-white/[0.08] max-w-4xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDoc
                ? `Ask anything about "${selectedDoc.originalName}"...`
                : 'Ask anything across indexed documents...'
            }
            rows={2}
            disabled={isGenerating}
            className="w-full bg-[#12141c] border border-white/[0.08] rounded-xl px-4 py-3 pr-14 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none disabled:opacity-50"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-colors cursor-pointer focus-ring"
              aria-label="Send question to assistant"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict RAG: Answers verified against document text</span>
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-neutral-400">
            Enter ↵ to submit · Shift+Enter for newline
          </span>
        </div>
      </div>
    </div>
  );
};
