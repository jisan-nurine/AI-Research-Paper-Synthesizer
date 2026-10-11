import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Sparkles,
  Globe,
  MessageCircle,
  Hash,
  Home,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { listGoogleChatSpaces } from '../services/workspaceService';
import { PaperIntelligence } from '../types/research';

interface GlobalChatMessage {
  id: string;
  senderName: string;
  senderPhoto?: string;
  affiliation?: string;
  text: string;
  timestamp: string;
  room: string;
  isAiScholar?: boolean;
}

interface GlobalChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
  user: User | null;
  authToken: string | null;
  activePaper: PaperIntelligence;
  onRequestConfirmGoogleChat: (spaceName: string, spaceTitle: string, message: string) => void;
}

const CHAT_ROOMS = [
  { id: 'general-synthesis', name: 'General Synthesis', icon: Globe },
  { id: 'methodology-critique', name: 'Methodology & Math', icon: Sparkles },
  { id: 'benchmark-divergence', name: 'Empirical Benchmarks', icon: Hash },
  { id: 'limitation-debate', name: 'Limitations & Bounds', icon: MessageSquare },
];

export const GlobalChatModal: React.FC<GlobalChatModalProps> = ({
  onClose,
  onReturnHome,
  user,
  authToken,
  activePaper,
  onRequestConfirmGoogleChat,
}) => {
  const [activeTab, setActiveTab] = useState<'community' | 'google-chat'>('community');
  const [activeRoom, setActiveRoom] = useState('general-synthesis');
  const [messages, setMessages] = useState<GlobalChatMessage[]>([
    {
      id: 'msg-1',
      senderName: 'Prof. Elena Rostova',
      affiliation: 'Max Planck Institute',
      text: `Has anyone validated the convergence properties in Section 3.2 of the recent benchmark paper under non-convex settings?`,
      timestamp: '10:42 AM',
      room: 'general-synthesis',
    },
    {
      id: 'msg-2',
      senderName: 'Dr. Marcus Vance',
      affiliation: 'Stanford AI Lab',
      text: `Yes, the empirical loss surfaces show high resilience, but notice the gradient variance explosion when batch size is < 128.`,
      timestamp: '10:45 AM',
      room: 'general-synthesis',
    },
    {
      id: 'msg-3',
      senderName: 'Gemini Research Fellow',
      affiliation: 'Aethelgard Autonomous Synthesis',
      text: `Cross-paper synthesis confirms that the residual connection formulation prevents gradient annihilation across all 15 evaluated downstream tasks.`,
      timestamp: '10:47 AM',
      room: 'general-synthesis',
      isAiScholar: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatSpaces, setChatSpaces] = useState<Array<{ name: string; displayName: string }>>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [googleChatMessage, setGoogleChatMessage] = useState('');
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load Google Chat spaces if authenticated
  useEffect(() => {
    if (authToken && activeTab === 'google-chat') {
      const loadSpaces = async () => {
        try {
          setIsLoadingSpaces(true);
          const spaces = await listGoogleChatSpaces(authToken);
          setChatSpaces(spaces);
          if (spaces.length > 0) {
            setSelectedSpace(spaces[0].name);
          }
        } catch (e) {
          console.error('Failed to load Google Chat spaces:', e);
        } finally {
          setIsLoadingSpaces(false);
        }
      };
      loadSpaces();
    }
  }, [authToken, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: GlobalChatMessage = {
      id: 'msg-' + Date.now(),
      senderName: user?.displayName || 'Visiting Scholar',
      senderPhoto: user?.photoURL || undefined,
      affiliation: 'Independent Peer Reviewer',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      room: activeRoom,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Trigger AI Scholar response after a brief delay
    setTimeout(() => {
      const aiReply: GlobalChatMessage = {
        id: 'ai-reply-' + Date.now(),
        senderName: 'Gemini 3.8 Intelligence Agent',
        affiliation: 'Cross-Corpus Knowledge Engine',
        text: `Analysis recorded regarding "${activePaper.title}". Key cross-reference: ${activePaper.keyContributions[0]?.title} reinforces this hypothesis.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        room: activeRoom,
        isAiScholar: true,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1200);
  };

  const handleSendToGoogleChat = () => {
    if (!authToken || !selectedSpace) return;
    const spaceTitle = chatSpaces.find((s) => s.name === selectedSpace)?.displayName || selectedSpace;
    const message =
      googleChatMessage ||
      `🔬 Research Paper Intelligence Update: "${activePaper.title}" (${activePaper.venueYear})\nNovelty: ${activePaper.breakthroughScore}%\nExecutive Summary: ${activePaper.executiveSummary}\nCore Breakthrough: ${activePaper.keyContributions[0]?.title} - ${activePaper.keyContributions[0]?.description}\nDOI: ${activePaper.doi}`;

    onRequestConfirmGoogleChat(selectedSpace, spaceTitle, message);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Page Top Navigation Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur space-y-3 sm:space-y-4">
        {/* Top Control Bar with Back button and Navigation */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:border-amber-400 transition shadow-md group shrink-0"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition" />
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="hidden xs:inline sm:inline">Back to Dashboard</span>
            <span className="xs:hidden sm:hidden">Dashboard</span>
          </button>

          {/* Tab switcher: Global Community vs Google Chat */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('community')}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                activeTab === 'community'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Scholar Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('google-chat')}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition flex items-center gap-1.5 ${
                activeTab === 'google-chat'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Google Chat</span>
            </button>

            <button
              onClick={handleBack}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition flex items-center gap-1 shrink-0"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Title area */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-100">
              Global Scholar Chat & Collaboration
            </h2>
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Worldwide Network
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect with researchers worldwide and broadcast findings directly to Google Chat spaces.
          </p>
        </div>
      </div>

      {/* Main Full Page Body */}
      {activeTab === 'community' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: Discussion Channels & Active Paper Attachment */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Academic Channels</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400">507 Scholars Online</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                {CHAT_ROOMS.map((room) => {
                  const Icon = room.icon;
                  const isActive = activeRoom === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room.id)}
                      className={`w-full flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs font-medium transition text-left ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{room.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Research Paper Context Card */}
            <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold block">
                Active Research Context
              </span>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2">
                  {activePaper.title}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {activePaper.authors?.slice(0, 2).join(', ')} · {activePaper.venueYear}
                </p>
              </div>

              <button
                onClick={() => {
                  setInputText(
                    `Regarding "${activePaper.title}": Notice how Section 2 demonstrates ${activePaper.keyContributions[0]?.title}.`
                  );
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 font-medium transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Cite this Paper in Chat</span>
              </button>
            </div>
          </div>

          {/* Right Column: Full-Height Real-Time Chat Message Feed */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col shadow-xl min-h-[420px] sm:min-h-[550px]">
            <div className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif text-sm sm:text-base font-semibold text-slate-100">
                  #{CHAT_ROOMS.find((r) => r.id === activeRoom)?.name}
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400">
                Encrypted peer-to-peer exchange
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 max-h-[380px] sm:max-h-[460px]">
              {messages
                .filter((m) => m.room === activeRoom || m.isAiScholar)
                .map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition ${
                      m.isAiScholar
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-950/80 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {m.senderPhoto ? (
                          <img src={m.senderPhoto} alt="" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-amber-400/40 shrink-0" />
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                            {m.senderName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {m.senderName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate hidden xs:inline">
                          {m.affiliation}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                        {m.timestamp}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pl-7 sm:pl-8">
                      {m.text}
                    </p>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Share findings in #${CHAT_ROOMS.find((r) => r.id === activeRoom)?.name}...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 disabled:opacity-40 transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* TAB 2: Google Chat Integration (Full Page) */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-slate-800">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100">
                Google Workspace Chat Spaces Broadcast
              </h3>
              <p className="text-xs text-slate-400">
                Send verified research synthesis directly to your team's Google Chat spaces.
              </p>
            </div>
          </div>

          {!authToken ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span>Sign in with your Google Workspace account in the top header to discover and broadcast to your Google Chat spaces.</span>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Target Google Chat Space
                  </label>
                  {isLoadingSpaces ? (
                    <div className="text-xs text-slate-400 py-3">Querying Google Chat API for your active spaces...</div>
                  ) : (
                    <select
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      {chatSpaces.map((space) => (
                        <option key={space.name} value={space.name}>
                          {space.displayName} ({space.name})
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] text-slate-500 mt-2">
                    Your authenticated Google Workspace user credentials will be transmitted directly via Bearer authorization.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="text-amber-400 font-semibold">Active Research Payload</div>
                  <div className="text-slate-300 font-medium">"{activePaper.title}"</div>
                  <div className="text-slate-500 text-[11px]">
                    Novelty: {activePaper.breakthroughScore}% · Authors: {activePaper.authors?.join(', ')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Formatted Intelligence Brief Message
                </label>
                <textarea
                  rows={5}
                  value={
                    googleChatMessage ||
                    `🔬 Research Paper Intelligence Update: "${activePaper.title}" (${activePaper.venueYear})\nNovelty: ${activePaper.breakthroughScore}%\nExecutive Summary: ${activePaper.executiveSummary}\nCore Breakthrough: ${activePaper.keyContributions[0]?.title} - ${activePaper.keyContributions[0]?.description}\nDOI: ${activePaper.doi}`
                  }
                  onChange={(e) => setGoogleChatMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition text-center"
                >
                  Cancel & Return Home
                </button>
                <button
                  onClick={handleSendToGoogleChat}
                  disabled={!authToken || !selectedSpace}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit to Google Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
