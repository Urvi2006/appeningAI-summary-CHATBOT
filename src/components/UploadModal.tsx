import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DocumentRecord } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File, onProgress: (pct: number) => void) => Promise<DocumentRecord>;
  onGenerateSample: () => Promise<DocumentRecord>;
  onSuccess: (doc: DocumentRecord) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onGenerateSample,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing]);

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF documents (.pdf) are supported.';
    }
    if (file.size === 0) {
      return 'The selected file is empty (0 bytes).';
    }
    if (file.size > 25 * 1024 * 1024) {
      return 'File size exceeds maximum allowed limit of 25 MB.';
    }
    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const err = validateFile(file);
      if (err) {
        setErrorMsg(err);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const err = validateFile(file);
      if (err) {
        setErrorMsg(err);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setStatusText('Uploading PDF to Gemini File Search...');
    setUploadProgress(15);

    try {
      const doc = await onUploadFile(selectedFile, (percent) => {
        setUploadProgress(Math.max(15, Math.min(85, percent)));
      });
      setUploadProgress(100);
      setStatusText('Indexing complete!');
      onSuccess(doc);
      setTimeout(() => {
        handleClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload and index document.');
      setIsProcessing(false);
    }
  };

  const handleSampleClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setStatusText('Generating and indexing Apex Global Handbook...');
    setUploadProgress(35);

    try {
      const doc = await onGenerateSample();
      setUploadProgress(100);
      setStatusText('Sample indexed successfully!');
      onSuccess(doc);
      setTimeout(() => {
        handleClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate sample document.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setSelectedFile(null);
    setUploadProgress(0);
    setStatusText('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#0e1017] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 id="upload-modal-title" className="text-sm font-semibold text-white">
                Upload PDF Document
              </h2>
              <p className="text-[11px] text-neutral-400">
                Index vectors using Google Gemini File Search
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 cursor-pointer focus-ring"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : selectedFile
                ? 'border-white/[0.15] bg-[#141722]'
                : 'border-white/[0.08] hover:border-white/[0.15] bg-[#12141c]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB · PDF Document
                  </p>
                </div>
                <span className="inline-block text-[11px] text-indigo-400 font-medium">
                  Click to choose a different PDF
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-200">
                    Drop your PDF here, or <span className="text-indigo-400">browse files</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Standard PDF documents up to 25 MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Processing / Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>{statusText}</span>
                </span>
                <span className="font-mono text-indigo-400">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleStartUpload}
              disabled={!selectedFile || isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-colors cursor-pointer flex items-center justify-center gap-2 focus-ring"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Indexing Document...</span>
                </>
              ) : (
                <>
                  <span>Index PDF Document</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick 1-Click Sample Button */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-[#0e1017] px-2 text-neutral-400 font-medium">
                  or test with pre-built handbook
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSampleClick}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl border border-white/[0.08] bg-[#12141c] hover:bg-[#181b24] text-neutral-200 text-xs font-medium transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-40 focus-ring"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Apex Global Policy Manual (4 pages)</div>
                  <div className="text-[11px] text-neutral-400">
                    Domestic per diem, internet reimbursement, filing deadlines
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="px-5 py-3 bg-[#0a0c10] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server-side isolated indexing</span>
          </span>
          <span className="font-mono text-[10px]">PDF format · Max 25MB</span>
        </div>
      </div>
    </div>
  );
};
