import { DocumentRecord, SystemStatus, QueryAuditLog, ChatMessage, CitationItem, ActivityStep } from '../types';

export interface ChatResponse {
  answer: string;
  citations: CitationItem[];
  activitySteps: ActivityStep[];
  isGrounded: boolean;
  modelUsed: string;
  documentId: string;
  documentName: string;
  latencyMs: number;
}

export const api = {
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/status');
    if (!res.ok) {
      throw new Error(`Failed to fetch system status: ${res.statusText}`);
    }
    return res.json();
  },

  async getDocuments(): Promise<DocumentRecord[]> {
    const res = await fetch('/api/documents');
    if (!res.ok) {
      throw new Error(`Failed to fetch documents: ${res.statusText}`);
    }
    const data = await res.json();
    return data.documents || [];
  },

  async getDocument(id: string): Promise<DocumentRecord> {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch document: ${res.statusText}`);
    }
    const data = await res.json();
    return data.document;
  },

  async uploadPdf(file: File, onProgress?: (percent: number) => void): Promise<DocumentRecord> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open('POST', '/api/documents/upload');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data.document);
          } catch {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Failed to upload document'));
          } catch {
            reject(new Error(`Server error: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during PDF upload'));
      };

      xhr.send(formData);
    });
  },

  async generateSampleDocument(): Promise<DocumentRecord> {
    const res = await fetch('/api/documents/sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate sample document');
    }
    const data = await res.json();
    return data.document;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete document');
    }
  },

  async sendChatMessage(
    question: string,
    documentId?: string,
    documentIds?: string[],
    history: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<ChatResponse> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        documentId,
        documentIds,
        history,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get answer from AI Assistant.');
    }

    return res.json();
  },

  async getActivityLogs(): Promise<QueryAuditLog[]> {
    const res = await fetch('/api/activity');
    if (!res.ok) {
      throw new Error('Failed to fetch activity logs');
    }
    const data = await res.json();
    return data.logs || [];
  },
};
