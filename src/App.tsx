/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { SAMPLE_PAPERS } from './data/samplePapers';
import { PaperIntelligence } from './types/research';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { saveAnalysisToGoogleDrive, sendBriefingViaGmail, sendGoogleChatMessage } from './services/workspaceService';
import { Header } from './components/Header';
import { UploadTray } from './components/UploadTray';
import { PaperDetailView } from './components/PaperDetailView';
import { ComparisonView } from './components/ComparisonView';
import { VoiceModal } from './components/VoiceModal';
import { FigureInspectorModal } from './components/FigureInspectorModal';
import { WorkspaceConfirmModal } from './components/WorkspaceConfirmModal';
import { SemanticSearchModal } from './components/SemanticSearchModal';
import { AnalyticsDashboardModal } from './components/AnalyticsDashboardModal';
import { GlobalChatModal } from './components/GlobalChatModal';
import { CitationModal } from './components/CitationModal';
import { PrintReportModal } from './components/PrintReportModal';
import { CheckCircle2, AlertCircle, Home, Search, Mic, Image as ImageIcon, MessageSquare, BarChart2 } from 'lucide-react';

export type ActivePageView =
  | 'dashboard'
  | 'voice'
  | 'chat'
  | 'vision'
  | 'search'
  | 'analytics'
  | 'comparison'
  | 'citations'
  | 'report';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Papers state
  const [papers, setPapers] = useState<PaperIntelligence[]>(SAMPLE_PAPERS);
  const [activePaperId, setActivePaperId] = useState<string>(SAMPLE_PAPERS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  // Dedicated Full-Page View state (no popups)
  const [activePageView, setActivePageView] = useState<ActivePageView>('dashboard');

  // Workspace confirmation safeguard modal state (Drive, Gmail, Google Chat)
  const [workspaceConfirm, setWorkspaceConfirm] = useState<{
    isOpen: boolean;
    type: 'gmail' | 'drive' | 'chat';
    recipient?: string;
    subject?: string;
    fileName?: string;
    content?: string;
    chatSpace?: string;
    chatMessagePreview?: string;
  }>({
    isOpen: false,
    type: 'drive',
  });
  const [isWorkspaceActionLoading, setIsWorkspaceActionLoading] = useState(false);
  const [driveSavedPapers, setDriveSavedPapers] = useState<Record<string, boolean>>({});

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, token) => {
        setUser(authUser);
        setAuthToken(token);
      },
      () => {
        setUser(null);
        setAuthToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAuthToken(res.accessToken);
        showToast(`Connected as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err.message || 'Failed to sign in with Google', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAuthToken(null);
      showToast('Disconnected from Google Workspace');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Active Paper
  const activePaper = papers.find((p) => p.id === activePaperId) || papers[0];

  const handleReturnHome = () => {
    setActivePageView('dashboard');
    setWorkspaceConfirm((prev) => ({ ...prev, isOpen: false }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPaper = (newPaper: PaperIntelligence) => {
    setPapers((prev) => [newPaper, ...prev]);
    setActivePaperId(newPaper.id);
    setActivePageView('dashboard');
    showToast(`Added: ${newPaper.title}`);
  };

  const handleRemovePaper = (id: string) => {
    const remaining = papers.filter((p) => p.id !== id);
    setPapers(remaining);
    if (activePaperId === id && remaining.length > 0) {
      setActivePaperId(remaining[0].id);
    }
  };

  // Google Workspace: Drive Save trigger
  const handleTriggerDriveSave = (customTitle?: string, customMarkdown?: string) => {
    if (!authToken) {
      showToast('Please connect your Google Workspace account to save to Drive', 'error');
      handleLogin();
      return;
    }

    const title = customTitle || `${activePaper.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Intelligence_Report`;
    const content = customMarkdown || `# Research Paper Intelligence Report: ${activePaper.title}
**Authors**: ${activePaper.authors?.join(', ')}
**Venue & Year**: ${activePaper.venueYear}
**DOI**: ${activePaper.doi}
**Field**: ${activePaper.field}
**Novelty Score**: ${activePaper.breakthroughScore}%

---

## Executive Summary
${activePaper.executiveSummary}

## Key Contributions
${activePaper.keyContributions?.map((c, i) => `### ${i + 1}. ${c.title} (Novelty: ${c.noveltyScore}%)
${c.description}
${c.evidenceQuote ? `> "${c.evidenceQuote}"` : ''}
`).join('\n')}

## Methodology
- **Architecture**: ${activePaper.methodology?.architectureOverview}
- **Mathematical Formulations**: ${activePaper.methodology?.mathematicalFormulation}
- **Datasets**: ${activePaper.methodology?.datasets?.join(', ')}
- **Experimental Setup**: ${activePaper.methodology?.experimentalSetup}

## Limitations
${activePaper.limitations?.map((l, i) => `- **${l.category}** (${l.severity}): ${l.description}. Mitigation: ${l.potentialMitigation}`).join('\n')}

## Future Directions
${activePaper.futureWork?.map((f, i) => `- **${f.area}** (${f.horizon}): ${f.hypothesis}`).join('\n')}

## Empirical Benchmarks
${activePaper.benchmarks?.map((b) => `- **${b.metric}**: ${b.result} (Baseline: ${b.baseline}, Gain: ${b.improvement})`).join('\n')}
`;

    setWorkspaceConfirm({
      isOpen: true,
      type: 'drive',
      fileName: `${title}.md`,
      content,
    });
  };

  // Google Workspace: Gmail Send trigger
  const handleTriggerGmailSend = (customSubject?: string, customBodyHtml?: string) => {
    if (!authToken) {
      showToast('Please connect your Google Workspace account to send via Gmail', 'error');
      handleLogin();
      return;
    }

    const recipient = user?.email || '';
    const subject = customSubject || `Research Intelligence Synthesis: ${activePaper.title}`;
    const content = customBodyHtml || `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto;">
        <h1 style="color: #0f172a; font-size: 20px;">Research Intelligence Report</h1>
        <h2 style="color: #d97706; font-size: 16px;">${activePaper.title}</h2>
        <p><strong>Venue & Year:</strong> ${activePaper.venueYear}</p>
        <p><strong>Novelty Score:</strong> ${activePaper.breakthroughScore}%</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <h3>Executive Summary</h3>
        <p style="line-height: 1.6;">${activePaper.executiveSummary}</p>
        <h3>Top Contribution</h3>
        <p><strong>${activePaper.keyContributions[0]?.title}</strong>: ${activePaper.keyContributions[0]?.description}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 11px; color: #64748b;">Generated securely by Aethelgard Research Intelligence with verified Google Workspace token.</p>
      </div>
    `;

    setWorkspaceConfirm({
      isOpen: true,
      type: 'gmail',
      recipient,
      subject,
      content,
    });
  };

  // Execute confirmed workspace action
  const handleExecuteWorkspaceAction = async () => {
    if (!authToken) {
      showToast('Missing authorization token', 'error');
      return;
    }

    try {
      setIsWorkspaceActionLoading(true);

      if (workspaceConfirm.type === 'drive') {
        const result = await saveAnalysisToGoogleDrive(
          authToken,
          workspaceConfirm.fileName || 'Research_Synthesis.md',
          workspaceConfirm.content || ''
        );
        setDriveSavedPapers((prev) => ({ ...prev, [activePaperId]: true }));
        showToast(`Saved to Google Drive: "${result.fileName}"`);
      } else if (workspaceConfirm.type === 'chat') {
        await sendGoogleChatMessage(
          authToken,
          workspaceConfirm.fileName || '', // contains target space name
          workspaceConfirm.content || ''
        );
        showToast(`Transmitted intelligence brief to ${workspaceConfirm.chatSpace || 'Google Chat'}`);
      } else {
        await sendBriefingViaGmail(
          authToken,
          workspaceConfirm.recipient || '',
          workspaceConfirm.subject || 'Research Brief',
          workspaceConfirm.content || ''
        );
        showToast(`Dispatched briefing to ${workspaceConfirm.recipient}`);
      }

      setWorkspaceConfirm((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      console.error('Workspace action failed:', err);
      showToast(err.message || 'Workspace operation failed', 'error');
    } finally {
      setIsWorkspaceActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-24 left-3 right-3 sm:left-auto sm:right-6 z-50 animate-in slide-in-from-top-4 duration-300 max-w-md sm:max-w-none mx-auto sm:mx-0">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-medium border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 border-amber-500/40 text-amber-200 shadow-amber-500/10'
                : 'bg-slate-900 border-red-500/40 text-red-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="truncate">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onOpenVoice={() => setActivePageView('voice')}
        onOpenFigureInspector={() => setActivePageView('vision')}
        onOpenSemanticSearch={() => setActivePageView('search')}
        onOpenAnalytics={() => setActivePageView('analytics')}
        onOpenChat={() => setActivePageView('chat')}
        onReturnHome={handleReturnHome}
        isVoiceActive={activePageView === 'voice'}
      />

      {/* Main Workspace Body - Renders Dedicated Large Page Views (No Popups) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-6">
        {activePageView === 'voice' ? (
          <VoiceModal
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
            activePaperTitle={activePaper?.title}
          />
        ) : activePageView === 'vision' ? (
          <FigureInspectorModal
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
          />
        ) : activePageView === 'chat' ? (
          <GlobalChatModal
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
            user={user}
            authToken={authToken}
            activePaper={activePaper}
            onRequestConfirmGoogleChat={(spaceName, spaceTitle, message) => {
              setWorkspaceConfirm({
                isOpen: true,
                type: 'chat',
                chatSpace: spaceTitle,
                chatMessagePreview: message,
                content: message,
                fileName: spaceName,
              });
            }}
          />
        ) : activePageView === 'search' ? (
          <SemanticSearchModal
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
            papers={papers}
            onSelectResult={(paperId, sectionTab) => {
              setActivePaperId(paperId);
              setActivePageView('dashboard');
              showToast(`Navigated to paper section: ${sectionTab || 'Overview'}`);
            }}
          />
        ) : activePageView === 'analytics' ? (
          <AnalyticsDashboardModal
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
          />
        ) : activePageView === 'citations' ? (
          <CitationModal
            paper={activePaper}
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
          />
        ) : activePageView === 'report' ? (
          <PrintReportModal
            paper={activePaper}
            onClose={handleReturnHome}
            onReturnHome={handleReturnHome}
          />
        ) : activePageView === 'comparison' ? (
          <ComparisonView
            papers={papers}
            selectedLanguage={selectedLanguage}
            onSaveToDrive={(title, md) => handleTriggerDriveSave(title, md)}
            onSendViaGmail={(sub, body) => handleTriggerGmailSend(sub, body)}
            onReturnHome={handleReturnHome}
          />
        ) : (
          /* Default Dashboard View: Paper Intake Tray + Deep Intelligence Inspection */
          <>
            <UploadTray
              papers={papers}
              activePaperId={activePaperId}
              onSelectPaper={(id) => {
                setActivePaperId(id);
                setActivePageView('dashboard');
              }}
              onAddPaper={handleAddPaper}
              onRemovePaper={handleRemovePaper}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
              selectedLanguage={selectedLanguage}
              isComparing={false}
              onToggleCompare={() => setActivePageView('comparison')}
            />

            <PaperDetailView
              key={activePaper.id}
              paper={activePaper}
              onSaveToDrive={() => handleTriggerDriveSave()}
              onSendViaGmail={() => handleTriggerGmailSend()}
              isDriveSaved={Boolean(driveSavedPapers[activePaper.id])}
              selectedLanguage={selectedLanguage}
              onReturnHome={handleReturnHome}
              onOpenCitations={() => setActivePageView('citations')}
              onOpenPrintReport={() => setActivePageView('report')}
            />
          </>
        )}
      </main>

      {/* Workspace Confirmation Safeguard Modal (Google Drive, Gmail & Google Chat Dispatch) */}
      <WorkspaceConfirmModal
        isOpen={workspaceConfirm.isOpen}
        type={workspaceConfirm.type}
        recipient={workspaceConfirm.recipient}
        subject={workspaceConfirm.subject}
        fileName={workspaceConfirm.fileName}
        chatSpace={workspaceConfirm.chatSpace}
        chatMessagePreview={workspaceConfirm.chatMessagePreview}
        onConfirm={handleExecuteWorkspaceAction}
        onCancel={() => setWorkspaceConfirm((prev) => ({ ...prev, isOpen: false }))}
        onReturnHome={handleReturnHome}
        isLoading={isWorkspaceActionLoading}
      />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={handleReturnHome}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            activePageView === 'dashboard' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActivePageView('search')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            activePageView === 'search' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px]">Search</span>
        </button>

        {/* Live Voice Center Button */}
        <button
          onClick={() => setActivePageView('voice')}
          className={`flex flex-col items-center gap-0.5 -mt-3.5 p-2 rounded-2xl border transition shadow-lg ${
            activePageView === 'voice'
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30'
              : 'bg-slate-900 border-amber-500/40 text-amber-300 shadow-slate-950'
          }`}
        >
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="text-[9px] font-bold">Voice</span>
        </button>

        <button
          onClick={() => setActivePageView('vision')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            activePageView === 'vision' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[10px]">Vision</span>
        </button>

        <button
          onClick={() => setActivePageView('chat')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            activePageView === 'chat' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px]">Chat</span>
        </button>

        <button
          onClick={() => setActivePageView('analytics')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
            activePageView === 'analytics' ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-[10px]">Stats</span>
        </button>
      </nav>

      {/* Luxury Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>AETHELGARD RESEARCH INTELLIGENCE</span>
          </div>
          <div>
            Powered by Gemini 3.8 Flash · Gemini Live · Gemini 3.8 Flash TTS · Europe PMC · Google Workspace
          </div>
        </div>
      </footer>
    </div>
  );
}
