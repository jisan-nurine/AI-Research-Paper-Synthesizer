import React from 'react';
import { AlertCircle, CheckCircle, Mail, HardDrive, MessageSquare, X, Home } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  type: 'gmail' | 'drive' | 'chat';
  recipient?: string;
  subject?: string;
  fileName?: string;
  chatSpace?: string;
  chatMessagePreview?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onReturnHome?: () => void;
  isLoading?: boolean;
}

export const WorkspaceConfirmModal: React.FC<WorkspaceConfirmModalProps> = ({
  isOpen,
  type,
  recipient,
  subject,
  fileName,
  chatSpace,
  chatMessagePreview,
  onConfirm,
  onCancel,
  onReturnHome,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => {
              onCancel();
              onReturnHome?.();
            }}
            disabled={isLoading}
            title="Return to Home Dashboard"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 hover:border-amber-500/40 transition shadow-sm"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Home</span>
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {type === 'gmail' ? (
              <Mail className="w-6 h-6" />
            ) : type === 'chat' ? (
              <MessageSquare className="w-6 h-6" />
            ) : (
              <HardDrive className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-serif font-semibold text-amber-100">
              {type === 'gmail'
                ? 'Confirm Email Dispatch'
                : type === 'chat'
                ? 'Confirm Google Chat Transmission'
                : 'Confirm Google Drive Export'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              {type === 'gmail'
                ? 'You are about to transmit a scientific intelligence brief through your connected Gmail account.'
                : type === 'chat'
                ? 'A research intelligence brief will be posted directly to your selected Google Chat space.'
                : 'A new Markdown research report will be created in your personal Google Drive.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
          {type === 'gmail' ? (
            <>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-mono text-amber-300 font-medium">{recipient || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Subject:</span>
                <span className="text-slate-200 font-medium truncate max-w-[280px]">{subject || 'Research Briefing'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>This email will be dispatched immediately with your permission.</span>
              </div>
            </>
          ) : type === 'chat' ? (
            <>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Chat Space:</span>
                <span className="font-mono text-amber-300 font-medium truncate max-w-[280px]">{chatSpace || 'Google Chat Space'}</span>
              </div>
              <div className="border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 block mb-1">Message Preview:</span>
                <span className="text-xs text-slate-300 line-clamp-2 font-mono bg-slate-900 p-2 rounded">{chatMessagePreview || 'Intelligence Brief'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>This message will be transmitted to the space with your permission.</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Document Name:</span>
                <span className="font-mono text-amber-300 font-medium truncate max-w-[280px]">{fileName || 'Research-Intelligence.md'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Format:</span>
                <span className="text-slate-200">Structured Academic Markdown (.md)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400/90 pt-1">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Accessible directly inside your Google Drive.</span>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-sm font-medium text-slate-950 bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 font-semibold shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm & Proceed</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
