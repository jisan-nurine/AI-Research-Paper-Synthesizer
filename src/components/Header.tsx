import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Mic,
  Image as ImageIcon,
  Globe,
  LogOut,
  Search,
  Command,
  BarChart2,
  MessageSquare,
  Home,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onOpenVoice: () => void;
  onOpenFigureInspector: () => void;
  onOpenSemanticSearch: () => void;
  onOpenAnalytics: () => void;
  onOpenChat: () => void;
  onReturnHome?: () => void;
  isVoiceActive: boolean;
}

export const LANGUAGES = [
  'English',
  'Spanish (Español)',
  'Mandarin (中文)',
  'Japanese (日本語)',
  'German (Deutsch)',
  'French (Français)',
  'Korean (한국어)',
  'Arabic (العربية)',
  'Portuguese (Português)',
  'Russian (Русский)',
  'Hindi (हिन्दी)',
  'Italian (Italiano)',
  'Dutch (Nederlands)',
  'Swedish (Svenska)',
  'Turkish (Türkçe)',
];

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  selectedLanguage,
  onSelectLanguage,
  onOpenVoice,
  onOpenFigureInspector,
  onOpenSemanticSearch,
  onOpenAnalytics,
  onOpenChat,
  onReturnHome,
  isVoiceActive,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSemanticSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSemanticSearch]);

  const handleMobileNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity */}
          <button
            onClick={() => {
              onReturnHome?.();
              setIsMobileMenuOpen(false);
            }}
            title="Return to Home Dashboard"
            className="flex items-center gap-2.5 sm:gap-3 text-left group transition focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-serif text-amber-300 font-bold text-sm sm:text-base tracking-wider">A</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-serif tracking-wide font-semibold text-slate-100 group-hover:text-amber-200 transition truncate">
                  AETHELGARD
                </h1>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans tracking-wide hidden sm:block truncate">
                Research Paper Intelligence & Cross-Paper Synthesis
              </p>
            </div>
          </button>

          {/* Desktop Center: Global Semantic Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md mx-2">
            <button
              onClick={onOpenSemanticSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-400 hover:text-slate-200 transition shadow-inner group"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition shrink-0" />
                <span className="truncate">Search concepts across papers...</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Desktop Right Action Bar */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
            {/* Return Home Button */}
            <button
              onClick={onReturnHome}
              title="Return to Home Dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-300 transition shadow-sm"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Home</span>
            </button>

            {/* Semantic Search icon on medium screens */}
            <button
              onClick={onOpenSemanticSearch}
              title="Search papers"
              className="lg:hidden p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-400 transition"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-amber-400/80 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
                className="bg-slate-900/90 text-slate-200 border border-slate-800 hover:border-amber-500/40 focus:border-amber-400 pl-8 pr-6 py-1.5 rounded-xl text-xs font-medium focus:outline-none transition appearance-none cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                    {lang.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Figure Vision Inspector */}
            <button
              onClick={onOpenFigureInspector}
              title="Inspect Paper Figures & Diagrams with Gemini Vision"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-300 transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Vision</span>
            </button>

            {/* Reading Analytics */}
            <button
              onClick={onOpenAnalytics}
              title="Personalized Reading Analytics & Hours Saved"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-300 transition"
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Analytics</span>
            </button>

            {/* Global Scholar Chat */}
            <button
              onClick={onOpenChat}
              title="Global Scholar Chat & Google Chat Broadcast"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-300 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Chat</span>
            </button>

            {/* Live Voice Conversation Button */}
            <button
              onClick={onOpenVoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border transition shadow-lg ${
                isVoiceActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border-amber-500/30 text-amber-300 hover:text-amber-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            </button>

            {/* Google Workspace Authentication */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2 py-1">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full border border-amber-400/40" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden xl:block text-left pr-1">
                    <div className="text-[10px] font-medium text-slate-200 truncate max-w-[80px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Disconnect Google Workspace"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pl-1">
                <button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow transition disabled:opacity-60"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Connect</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Search, Live Voice, & Menu Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Quick Mobile Search */}
            <button
              onClick={onOpenSemanticSearch}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 transition"
              title="Semantic Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Mobile Voice */}
            <button
              onClick={onOpenVoice}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isVoiceActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
              title="Live Voice"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/98 border-t border-slate-800/90 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {/* Quick Page Links */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleMobileNav(onReturnHome || (() => {}))}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium hover:border-amber-500/40 transition text-left"
            >
              <Home className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100">Home</div>
                <div className="text-[10px] text-slate-400">Dashboard & Papers</div>
              </div>
            </button>

            <button
              onClick={() => handleMobileNav(onOpenVoice)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-slate-200 text-xs font-medium hover:border-amber-400 transition text-left"
            >
              <Mic className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100">Live Voice</div>
                <div className="text-[10px] text-slate-400">Gemini Live Audio</div>
              </div>
            </button>

            <button
              onClick={() => handleMobileNav(onOpenFigureInspector)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium hover:border-amber-500/40 transition text-left"
            >
              <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100">Vision</div>
                <div className="text-[10px] text-slate-400">Figure Inspector</div>
              </div>
            </button>

            <button
              onClick={() => handleMobileNav(onOpenAnalytics)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium hover:border-amber-500/40 transition text-left"
            >
              <BarChart2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100">Analytics</div>
                <div className="text-[10px] text-slate-400">Reading Velocity</div>
              </div>
            </button>

            <button
              onClick={() => handleMobileNav(onOpenChat)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium hover:border-amber-500/40 transition text-left"
            >
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100">Scholar Chat</div>
                <div className="text-[10px] text-slate-400">Google Chat Sync</div>
              </div>
            </button>

            <button
              onClick={() => handleMobileNav(onOpenSemanticSearch)}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium hover:border-amber-500/40 transition text-left"
            >
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100">Search</div>
                <div className="text-[10px] text-slate-400">Semantic Search</div>
              </div>
            </button>
          </div>

          {/* Language Selector in Mobile Drawer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* User Account / Google Workspace in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-800/80">
            {user ? (
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-amber-400/40 shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">
                      {user.displayName || 'Google Workspace'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-slate-700 text-xs font-medium transition shrink-0 ml-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 py-2.5 px-4 rounded-xl text-xs font-semibold shadow transition disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Connect Google Workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
