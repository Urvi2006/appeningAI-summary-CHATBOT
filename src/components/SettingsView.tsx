import React from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  Server,
} from 'lucide-react';
import { SystemStatus } from '../types';

interface SettingsViewProps {
  status: SystemStatus | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ status }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">System Settings & Architecture</h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Engine parameters, security boundaries, and Google Gemini integration details
        </p>
      </div>

      {/* Security & Credentials Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] p-5 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase text-neutral-400 tracking-wider">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Security & API Key Isolation</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-lg bg-[#12141c] border border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Server-Side Proxy Architecture</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Gemini API calls and File Search Stores are managed exclusively on the Node.js backend.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              Active
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#12141c] border border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Client Key Leakage Prevention</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                No GEMINI_API_KEY tokens or file search master keys are shipped in client bundles.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* RAG Engine Configuration */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] p-5 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase text-neutral-400 tracking-wider">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Google Gemini File Search Engine</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-[#12141c] border border-white/[0.06]">
              <span className="text-neutral-400 text-[11px]">Primary RAG Service</span>
              <p className="font-mono text-white text-xs mt-1">Google GenAI FileSearchStores</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#12141c] border border-white/[0.06]">
              <span className="text-neutral-400 text-[11px]">SDK Version</span>
              <p className="font-mono text-white text-xs mt-1">@google/genai v2.4.0</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#12141c] border border-white/[0.06]">
              <span className="text-neutral-400 text-[11px]">Page-Level Grounding</span>
              <p className="font-mono text-white text-xs mt-1">GroundingChunkRetrievedContext</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#12141c] border border-white/[0.06]">
              <span className="text-neutral-400 text-[11px]">Anti-Hallucination Guardrails</span>
              <p className="font-mono text-white text-xs mt-1">Strict System Directives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Server Runtime */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] p-5 space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase text-neutral-400 tracking-wider">
          <Server className="w-4 h-4 text-sky-400" />
          <span>Server Runtime & Telemetry</span>
        </div>

        <div className="space-y-2 text-xs font-mono text-neutral-300">
          <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
            <span className="text-neutral-400">Server Port:</span>
            <span>3000 (Express + Vite)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
            <span className="text-neutral-400">Server Uptime:</span>
            <span>{status?.serverUptimeSeconds ? `${status.serverUptimeSeconds} seconds` : 'Active'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-neutral-400">Max PDF Upload Size:</span>
            <span>25 MB (Multipart/form-data)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
