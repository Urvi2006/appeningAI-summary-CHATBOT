import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { ActivityStep } from '../types';

interface AgentActivityIndicatorProps {
  steps: ActivityStep[];
  currentStatusText?: string;
  isGenerating?: boolean;
}

export const AgentActivityIndicator: React.FC<AgentActivityIndicatorProps> = ({
  steps,
  currentStatusText,
  isGenerating = false,
}) => {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0e1017] p-3.5 space-y-2.5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <span className="text-xs font-semibold text-neutral-200">
          Agent Execution Pipeline
        </span>
        {isGenerating ? (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-400 font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {steps.map((step) => {
          const isDone = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          return (
            <div
              key={step.id}
              className="flex items-center justify-between text-xs py-0.5"
            >
              <div className="flex items-center gap-2">
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {isInProgress && (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                )}
                {step.status === 'pending' && (
                  <Circle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                )}
                <span
                  className={
                    isDone
                      ? 'text-neutral-300'
                      : isInProgress
                      ? 'text-indigo-300 font-medium'
                      : 'text-neutral-500'
                  }
                >
                  {step.label}
                </span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500">
                {isDone ? '✓' : isInProgress ? '●' : '○'}
              </span>
            </div>
          );
        })}
      </div>

      {currentStatusText && (
        <div className="pt-1 text-[11px] font-mono text-neutral-400 border-t border-white/[0.04]">
          Status: {currentStatusText}
        </div>
      )}
    </div>
  );
};
