import fs from 'fs';
import path from 'path';
import { DocumentRecord, QueryAuditLog } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DOCS_FILE = path.resolve(DATA_DIR, 'documents.json');
const LOGS_FILE = path.resolve(DATA_DIR, 'logs.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class DocumentStore {
  private documents: Map<string, DocumentRecord> = new Map();
  private auditLogs: QueryAuditLog[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(DOCS_FILE)) {
        const raw = fs.readFileSync(DOCS_FILE, 'utf-8');
        const list: DocumentRecord[] = JSON.parse(raw);
        for (const doc of list) {
          this.documents.set(doc.id, doc);
        }
      }
      if (fs.existsSync(LOGS_FILE)) {
        const rawLogs = fs.readFileSync(LOGS_FILE, 'utf-8');
        this.auditLogs = JSON.parse(rawLogs);
      }
    } catch (err) {
      console.error('Error loading documents store:', err);
    }
  }

  private save(): void {
    try {
      const list = Array.from(this.documents.values());
      fs.writeFileSync(DOCS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.auditLogs.slice(-100), null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving documents store:', err);
    }
  }

  public getAll(): DocumentRecord[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  public add(doc: DocumentRecord): void {
    this.documents.set(doc.id, doc);
    this.save();
  }

  public update(id: string, updates: Partial<DocumentRecord>): DocumentRecord | undefined {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    const updated: DocumentRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.documents.set(id, updated);
    this.save();
    return updated;
  }

  public remove(id: string): boolean {
    const existing = this.documents.get(id);
    if (!existing) return false;
    // Attempt removing local file if exists
    if (existing.filePath && fs.existsSync(existing.filePath)) {
      try {
        fs.unlinkSync(existing.filePath);
      } catch (err) {
        console.warn('Could not remove file at', existing.filePath, err);
      }
    }
    const res = this.documents.delete(id);
    this.save();
    return res;
  }

  public incrementQuestionCount(id: string): void {
    const doc = this.documents.get(id);
    if (doc) {
      doc.questionsCount = (doc.questionsCount || 0) + 1;
      doc.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  public addAuditLog(log: QueryAuditLog): void {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.save();
  }

  public getAuditLogs(): QueryAuditLog[] {
    return this.auditLogs;
  }

  public getUploadsDir(): string {
    return UPLOADS_DIR;
  }
}

export const documentStore = new DocumentStore();
