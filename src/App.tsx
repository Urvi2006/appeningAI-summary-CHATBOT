import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AssistantView } from './components/AssistantView';
import { SourcesPanel } from './components/SourcesPanel';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { UploadModal } from './components/UploadModal';
import {
  ActiveView,
  DocumentRecord,
  ChatMessage,
  CitationItem,
  SystemStatus,
} from './types';
import { api } from './api/client';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('assistant');
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileSourcesOpen, setIsMobileSourcesOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [selectedCitationId, setSelectedCitationId] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState<boolean>(false);

  // Load documents and status on initial load
  const loadData = useCallback(async () => {
    try {
      const [docs, sysStatus] = await Promise.all([
        api.getDocuments(),
        api.getStatus().catch(() => null),
      ]);
      setDocuments(docs);
      if (sysStatus) {
        setStatus(sysStatus);
      }

      // Default select first ready document if none selected
      if (!selectedDocId && docs.length > 0) {
        const firstReady = docs.find((d) => d.status === 'ready');
        if (firstReady) {
          setSelectedDocId(firstReady.id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [selectedDocId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling for indexing documents
  useEffect(() => {
    const hasPending = documents.some(
      (d) => d.status === 'indexing' || d.status === 'uploading'
    );
    if (!hasPending) return;

    const interval = setInterval(async () => {
      try {
        const docs = await api.getDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error('Polling documents error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [documents]);

  const selectedDoc = useMemo(
    () => (selectedDocId ? documents.find((d) => d.id === selectedDocId) || null : null),
    [selectedDocId, documents]
  );

  // Find latest citations from the most recent assistant message
  const activeCitations = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].citations?.length) {
        return messages[i].citations || [];
      }
    }
    return [];
  }, [messages]);

  // Chat message sending
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      documentId: selectedDoc?.id,
      documentName: selectedDoc?.originalName || 'All Documents',
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage(
        text,
        selectedDoc?.id,
        undefined,
        history
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toISOString(),
        documentId: res.documentId,
        documentName: res.documentName,
        citations: res.citations,
        activitySteps: res.activitySteps,
        isGrounded: res.isGrounded,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (res.citations && res.citations.length > 0) {
        setSelectedCitationId(res.citations[0].id);
      }

      // Refresh documents questions count and status
      loadData();
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to retrieve answer from document. Please try again.'}`,
        timestamp: new Date().toISOString(),
        isGrounded: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    await api.deleteDocument(id);
    if (selectedDocId === id) {
      setSelectedDocId(null);
    }
    await loadData();
  };

  const handleGenerateSample = async () => {
    setIsGeneratingSample(true);
    try {
      const newDoc = await api.generateSampleDocument();
      await loadData();
      setSelectedDocId(newDoc.id);
      setActiveView('assistant');
    } catch (err: any) {
      alert(`Failed to generate sample: ${err.message}`);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleUploadSuccess = (doc: DocumentRecord) => {
    setDocuments((prev) => [doc, ...prev]);
    setSelectedDocId(doc.id);
    setActiveView('assistant');
    loadData();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0d] text-neutral-100 font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        documents={documents}
        selectedDocId={selectedDocId}
        setSelectedDocId={setSelectedDocId}
        onOpenUpload={() => setIsUploadOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeView={activeView}
          selectedDoc={selectedDoc}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onToggleSourcesPanel={() => setIsMobileSourcesOpen((prev) => !prev)}
          hasCitations={activeCitations.length > 0}
        />

        {/* View Router with 3-part layout when in Assistant view */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Area */}
          {activeView === 'dashboard' && (
            <DashboardView
              status={status}
              documents={documents}
              selectedDoc={selectedDoc}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectDoc={(id) => setSelectedDocId(id)}
              onNavigateToAssistant={() => setActiveView('assistant')}
              onGenerateSample={handleGenerateSample}
              isGeneratingSample={isGeneratingSample}
            />
          )}

          {activeView === 'documents' && (
            <DocumentsView
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={(id) => setSelectedDocId(id)}
              onDeleteDoc={handleDeleteDoc}
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigateToAssistant={() => setActiveView('assistant')}
              onGenerateSample={handleGenerateSample}
              isGeneratingSample={isGeneratingSample}
            />
          )}

          {activeView === 'assistant' && (
            <>
              <AssistantView
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                selectedDoc={selectedDoc}
                documents={documents}
                onSelectDoc={(id) => setSelectedDocId(id)}
                onClearChat={() => setMessages([])}
                onSelectCitation={(id) => setSelectedCitationId(id)}
                selectedCitationId={selectedCitationId}
                onOpenUpload={() => setIsUploadOpen(true)}
              />

              {/* 3. Right Sources Panel */}
              <SourcesPanel
                citations={activeCitations}
                selectedCitationId={selectedCitationId}
                onSelectCitation={setSelectedCitationId}
                isOpenMobile={isMobileSourcesOpen}
                onCloseMobile={() => setIsMobileSourcesOpen(false)}
              />
            </>
          )}

          {activeView === 'activity' && <ActivityView />}

          {activeView === 'settings' && <SettingsView status={status} />}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadFile={(file, onProgress) => api.uploadPdf(file, onProgress)}
        onGenerateSample={api.generateSampleDocument}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
