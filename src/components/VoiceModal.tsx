import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Sparkles, Home, ArrowLeft, Volume2, Radio } from 'lucide-react';
import { LiveVoiceClient } from '../services/liveAudio';

interface VoiceModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
  activePaperTitle?: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  onClose,
  onReturnHome,
  activePaperTitle,
}) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcripts, setTranscripts] = useState<Array<{ role: 'user' | 'gemini'; text: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const voiceClientRef = useRef<LiveVoiceClient | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (voiceClientRef.current) {
      voiceClientRef.current.stop();
    }
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  useEffect(() => {
    const client = new LiveVoiceClient();
    client.onStatusChange = (newStatus: 'disconnected' | 'connecting' | 'connected' | 'error', message?: string) => {
      if (newStatus === 'error') {
        setStatus('disconnected');
        setErrorMessage(message || 'Live Audio error occurred');
      } else {
        setStatus(newStatus);
        setErrorMessage(null);
      }
    };
    client.onVolumeChange = (vol: number) => {
      setVolumeLevel(vol);
    };
    client.onTranscript = (text: string) => {
      setTranscripts((prev) => [...prev, { role: 'gemini', text }]);
    };

    voiceClientRef.current = client;
    client.start();

    return () => {
      client.stop();
      voiceClientRef.current = null;
    };
  }, []);

  const handleToggleMute = () => {
    if (!voiceClientRef.current) return;
    const mutedState = voiceClientRef.current.toggleMute();
    setIsMuted(mutedState);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !voiceClientRef.current) return;
    const text = inputText.trim();
    voiceClientRef.current.sendTextMessage(text);
    setTranscripts((prev) => [...prev, { role: 'user', text }]);
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!voiceClientRef.current) return;
    voiceClientRef.current.sendTextMessage(prompt);
    setTranscripts((prev) => [...prev, { role: 'user', text: prompt }]);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Page Top Navigation Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur space-y-3 sm:space-y-4">
        {/* Top Control Bar with Back button and Status */}
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

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] sm:text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-emerald-400 animate-ping'
                    : status === 'connecting'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-red-400'
                }`}
              />
              <span className="font-mono text-slate-300">
                {status === 'connected' ? (isMuted ? 'Muted' : 'Live & Listening') : status === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>

            <button
              onClick={handleBack}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow flex items-center gap-1 shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Title and Subtitle Area */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-100">
                Live Voice Scholar
              </h2>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                gemini-3.8-live
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
              {activePaperTitle ? `Interrogating: "${activePaperTitle}"` : 'Real-time bidirectional speech with Gemini Live'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Full Page Content: 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Visualizer Orb, Status & Audio Controls */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col justify-between shadow-xl space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Acoustic Session Monitor</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Low-Latency PCM</span>
          </div>

          {/* Audio Visualizer Orb */}
          <div className="py-6 sm:py-12 flex flex-col items-center justify-center relative">
            <div className="relative flex items-center justify-center">
              {/* Concentric rings */}
              <div
                className="absolute w-36 h-36 sm:w-52 sm:h-52 rounded-full bg-amber-500/10 transition-transform duration-75 pointer-events-none"
                style={{ transform: `scale(${1 + volumeLevel * 1.5})` }}
              />
              <div
                className="absolute w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-amber-500/20 transition-transform duration-75 pointer-events-none"
                style={{ transform: `scale(${1 + volumeLevel * 1.1})` }}
              />
              <div
                className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-amber-500/30 transition-transform duration-75 pointer-events-none"
                style={{ transform: `scale(${1 + volumeLevel * 0.7})` }}
              />
              {/* Center Orb */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 shadow-2xl shadow-amber-500/40 flex items-center justify-center z-10 border-2 border-amber-200">
                <Mic className="w-7 h-7 sm:w-10 sm:h-10 text-slate-950 animate-pulse" />
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'connected' ? 'bg-emerald-400' : status === 'connecting' ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-300">
                  {status === 'connected'
                    ? isMuted
                      ? 'Microphone Muted'
                      : 'Gemini Live Listening'
                    : status === 'connecting'
                    ? 'Establishing Socket...'
                    : 'Disconnected'}
                </span>
              </div>
              {errorMessage && (
                <p className="text-xs text-red-400 mt-2 max-w-sm mx-auto">{errorMessage}</p>
              )}
            </div>
          </div>

          {/* Quick Prompt Inquiries */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Suggested Voice Inquiries
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                'Explain the core breakthrough',
                'What is the mathematical formulation?',
                'What are the primary limitations?',
                'How does this benchmark baseline?',
                'Summarize the future research horizons',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-300 transition text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="pt-3 sm:pt-4 border-t border-slate-800 flex items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={handleToggleMute}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl border font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
              <span>{isMuted ? 'Unmute' : 'Mute Mic'}</span>
            </button>

            <button
              onClick={handleBack}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 sm:gap-2"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        {/* Right Column: Full-Height Live Conversation Transcript */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col shadow-xl min-h-[420px] sm:min-h-[500px]">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 sm:pb-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm sm:text-base font-semibold text-slate-100">
                Live Interrogation Transcript
              </h3>
            </div>
            <span className="font-mono text-[11px] sm:text-xs text-slate-500">
              {transcripts.length} exchanges
            </span>
          </div>

          {/* Transcript Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 max-h-[400px] sm:max-h-[550px]">
            {transcripts.length === 0 ? (
              <div className="h-48 sm:h-64 flex flex-col items-center justify-center text-center p-4 sm:p-6 border-2 border-dashed border-slate-800 rounded-2xl">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mb-2 sm:mb-3 animate-pulse" />
                <p className="text-xs sm:text-sm font-medium text-slate-400">
                  Speak into your microphone to initiate dialogue
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 max-w-sm mt-1">
                  Gemini 3.8 Live will respond through natural voice synthesis with real-time academic analysis.
                </p>
              </div>
            ) : (
              transcripts.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 ${
                    t.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      {t.role === 'user' ? 'Research Scholar' : 'Gemini 3.8 Live'}
                    </span>
                  </div>
                  <div
                    className={`max-w-[95%] sm:max-w-[90%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      t.role === 'user'
                        ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                        : 'bg-slate-950/80 text-slate-200 border border-slate-800'
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Fallback Text Input */}
          <form onSubmit={handleSendText} className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a question for Gemini Live..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition disabled:opacity-40 shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
