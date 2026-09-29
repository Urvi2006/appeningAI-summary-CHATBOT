export type DocumentStatus = 'uploading' | 'processing' | 'indexing' | 'ready' | 'failed';

export interface DocumentRecord {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  fileSearchStoreName: string;
  fileUri?: string;
  fileName?: string;
  documentResourceName?: string;
  status: DocumentStatus;
  progressPercent: number;
  statusStep: string;
  pageCount?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  questionsCount: number;
}

export interface CitationItem {
  id: string;
  index: number;
  documentId: string;
  documentName: string;
  pageNumber?: number | null;
  excerpt: string;
  confidence?: number;
  fileSearchStore?: string;
}

export interface ActivityStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  documentId?: string;
  citations?: CitationItem[];
  activitySteps?: ActivityStep[];
  isGrounded?: boolean;
  documentName?: string;
}

export interface SystemStatus {
  geminiConfigured: boolean;
  systemHealthy: boolean;
  totalDocuments: number;
  readyDocuments: number;
  totalQuestions: number;
  lastActiveDocument: string | null;
  ragEngine: string;
  serverUptimeSeconds: number;
}

export interface QueryAuditLog {
  id: string;
  question: string;
  documentId: string;
  documentName: string;
  timestamp: string;
  citationsCount: number;
  latencyMs: number;
  success: boolean;
}

export type ActiveView = 'dashboard' | 'documents' | 'assistant' | 'activity' | 'settings';
