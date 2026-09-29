import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { documentStore } from './server/documentStore.js';
import {
  createDocumentStore,
  deleteDocumentStore,
  indexPdfInStore,
  queryDocumentRAG,
} from './server/gemini.js';
import { generateSamplePdf } from './server/sampleGenerator.js';
import { DocumentRecord } from './server/types.js';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer storage setup
const uploadsDir = documentStore.getUploadsDir();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeBase = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeBase}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only valid PDF documents (.pdf) are supported.'));
    }
  },
});

// Helper: validate PDF magic header (%PDF-)
function isValidPdfBuffer(filePath: string): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, 5, 0);
    fs.closeSync(fd);
    return buffer.toString('utf-8').startsWith('%PDF');
  } catch {
    return false;
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. System Status
app.get('/api/status', async (_req: Request, res: Response) => {
  const docs = documentStore.getAll();
  const logs = documentStore.getAuditLogs();
  const totalQuestions = logs.length;
  const readyDocs = docs.filter((d) => d.status === 'ready');

  res.json({
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    systemHealthy: true,
    totalDocuments: docs.length,
    readyDocuments: readyDocs.length,
    totalQuestions,
    lastActiveDocument: docs[0]?.originalName || null,
    ragEngine: 'Google Gemini File Search + Vector Grounding',
    serverUptimeSeconds: Math.floor(process.uptime()),
  });
});

// 2. List all Documents
app.get('/api/documents', (_req: Request, res: Response) => {
  const docs = documentStore.getAll();
  res.json({ documents: docs });
});

// 3. Get single Document
app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = documentStore.getById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  res.json({ document: doc });
});

// 4. Upload & Index PDF
app.post(
  '/api/documents/upload',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message || 'Invalid upload' });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No PDF file was uploaded.' });
        return;
      }

      // Check empty file
      if (file.size === 0) {
        fs.unlinkSync(file.path);
        res.status(400).json({ error: 'The uploaded file is empty (0 bytes).' });
        return;
      }

      // Validate magic bytes
      if (!isValidPdfBuffer(file.path)) {
        fs.unlinkSync(file.path);
        res.status(400).json({
          error: 'The uploaded file does not contain a valid PDF signature (%PDF).',
        });
        return;
      }

      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const originalName = file.originalname || 'document.pdf';

      // 1. Create File Search Store in Gemini
      let fileSearchStoreName = '';
      try {
        fileSearchStoreName = await createDocumentStore(originalName);
      } catch (err: any) {
        fs.unlinkSync(file.path);
        res.status(500).json({
          error: `Failed to initialize Gemini File Search store: ${err.message}`,
        });
        return;
      }

      // Create initial record
      const initialRecord: DocumentRecord = {
        id: docId,
        name: originalName.replace(/\.pdf$/i, ''),
        originalName,
        size: file.size,
        mimeType: 'application/pdf',
        filePath: file.path,
        fileSearchStoreName,
        status: 'indexing',
        progressPercent: 30,
        statusStep: 'Uploading and indexing into Gemini File Search...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        questionsCount: 0,
      };

      documentStore.add(initialRecord);

      // Return immediately with document in indexing state
      res.status(201).json({
        document: initialRecord,
        message: 'File uploaded and Gemini File Search indexing in progress.',
      });

      // Background indexing
      (async () => {
        try {
          const indexResult = await indexPdfInStore(
            fileSearchStoreName,
            file.path,
            originalName,
            (step, percent) => {
              documentStore.update(docId, {
                statusStep: step,
                progressPercent: percent,
              });
            }
          );

          documentStore.update(docId, {
            status: 'ready',
            progressPercent: 100,
            statusStep: 'Indexing complete. Ready for questions.',
            documentResourceName: indexResult.documentResourceName,
          });
        } catch (idxErr: any) {
          console.error(`Indexing failed for doc ${docId}:`, idxErr);
          documentStore.update(docId, {
            status: 'failed',
            statusStep: 'Indexing failed',
            errorMessage: idxErr.message || 'Error occurred during Gemini indexing.',
          });
        }
      })();
    } catch (err: any) {
      console.error('Upload endpoint error:', err);
      res.status(500).json({ error: err.message || 'Server error uploading file' });
    }
  }
);

// 5. Seed / Generate Sample PDF Document
app.post('/api/documents/sample', async (_req: Request, res: Response): Promise<void> => {
  try {
    const filename = `Apex-Global-Handbook-${Date.now()}.pdf`;
    const destPath = path.join(uploadsDir, filename);
    const originalName = 'Apex Global Technologies — Policy Manual 2026.pdf';

    const fileSize = await generateSamplePdf(destPath);
    const docId = `doc-sample-${Date.now()}`;

    // Create store
    const fileSearchStoreName = await createDocumentStore(originalName);

    const initialRecord: DocumentRecord = {
      id: docId,
      name: 'Apex Global Technologies — Policy Manual 2026',
      originalName,
      size: fileSize,
      mimeType: 'application/pdf',
      filePath: destPath,
      fileSearchStoreName,
      status: 'indexing',
      progressPercent: 30,
      statusStep: 'Indexing sample policy handbook into Gemini File Search...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questionsCount: 0,
    };

    documentStore.add(initialRecord);

    res.status(201).json({
      document: initialRecord,
      message: 'Sample PDF generated and indexing initiated.',
    });

    // Run indexing
    (async () => {
      try {
        const indexResult = await indexPdfInStore(
          fileSearchStoreName,
          destPath,
          originalName,
          (step, percent) => {
            documentStore.update(docId, {
              statusStep: step,
              progressPercent: percent,
            });
          }
        );

        documentStore.update(docId, {
          status: 'ready',
          progressPercent: 100,
          statusStep: 'Ready for questions.',
          documentResourceName: indexResult.documentResourceName,
        });
      } catch (err: any) {
        console.error('Failed to index sample PDF:', err);
        documentStore.update(docId, {
          status: 'failed',
          errorMessage: err.message || 'Failed to index sample PDF.',
        });
      }
    })();
  } catch (err: any) {
    console.error('Error generating sample doc:', err);
    res.status(500).json({ error: err.message || 'Failed to generate sample PDF' });
  }
});

// 6. Delete Document
app.delete('/api/documents/:id', async (req: Request, res: Response) => {
  const doc = documentStore.getById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  // Delete from Gemini
  if (doc.fileSearchStoreName) {
    await deleteDocumentStore(doc.fileSearchStoreName);
  }

  documentStore.remove(req.params.id);
  res.json({ success: true, message: 'Document removed successfully.' });
});

// 7. Chat / Question Answering RAG
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { question, documentId, documentIds, history = [] } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Please enter a valid question.' });
      return;
    }

    // Resolve target documents
    let targetDocs: DocumentRecord[] = [];
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      targetDocs = documentIds
        .map((id: string) => documentStore.getById(id))
        .filter((d: any): d is DocumentRecord => !!d && d.status === 'ready');
    } else if (documentId) {
      const doc = documentStore.getById(documentId);
      if (doc && doc.status === 'ready') {
        targetDocs = [doc];
      }
    }

    // Fallback: if no specific doc provided, pick first ready doc
    if (targetDocs.length === 0) {
      const readyDocs = documentStore.getAll().filter((d) => d.status === 'ready');
      if (readyDocs.length === 0) {
        res.status(400).json({
          error:
            'No indexed document is ready yet. Please upload a PDF or wait for indexing to finish.',
        });
        return;
      }
      targetDocs = [readyDocs[0]];
    }

    // Run RAG query
    const ragResult = await queryDocumentRAG(question.trim(), targetDocs, history);

    // Update stats
    for (const doc of targetDocs) {
      documentStore.incrementQuestionCount(doc.id);
    }

    const latencyMs = Date.now() - startTime;

    // Audit log
    documentStore.addAuditLog({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      question: question.trim(),
      documentId: targetDocs[0].id,
      documentName: targetDocs.map((d) => d.originalName).join(', '),
      timestamp: new Date().toISOString(),
      citationsCount: ragResult.citations.length,
      latencyMs,
      success: true,
    });

    res.json({
      answer: ragResult.answer,
      citations: ragResult.citations,
      activitySteps: ragResult.activitySteps,
      isGrounded: ragResult.isGrounded,
      modelUsed: ragResult.modelUsed,
      documentId: targetDocs[0].id,
      documentName: targetDocs.map((d) => d.originalName).join(', '),
      latencyMs,
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      error:
        err.message ||
        'An error occurred while analyzing the document. Please try again.',
    });
  }
});

// 8. Audit Activity Log
app.get('/api/activity', (_req: Request, res: Response) => {
  const logs = documentStore.getAuditLogs();
  res.json({ logs });
});

// ==========================================
// FRONTEND SERVING (Vite dev or production)
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  // Generic error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
      error: err.message || 'An internal server error occurred.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Appening AI] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
