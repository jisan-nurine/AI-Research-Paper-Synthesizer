import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  HardDrive,
  Mail,
  Award,
  BookOpen,
  Cpu,
  AlertTriangle,
  Compass,
  BarChart3,
  Search,
  ExternalLink,
  CheckCircle,
  Copy,
  Play,
  Pause,
  Send,
  HelpCircle,
  FileText,
  Quote,
  Check,
  Printer,
} from 'lucide-react';
import { PaperIntelligence, ScienceLiteratureResult } from '../types/research';
import { CitationModal } from './CitationModal';
import { PrintReportModal } from './PrintReportModal';
import { ReadingAnalyticsTracker } from '../services/readingAnalytics';

interface PaperDetailViewProps {
  paper: PaperIntelligence;
  onSaveToDrive: () => void;
  onSendViaGmail: () => void;
  isDriveSaved: boolean;
  selectedLanguage: string;
  onReturnHome?: () => void;
  onOpenCitations?: () => void;
  onOpenPrintReport?: () => void;
}

export const PaperDetailView: React.FC<PaperDetailViewProps> = ({
  paper,
  onSaveToDrive,
  onSendViaGmail,
  isDriveSaved,
  selectedLanguage,
  onReturnHome,
  onOpenCitations,
  onOpenPrintReport,
}) => {
  const [activeTab, setActiveTab] = useState<'contributions' | 'methodology' | 'limitations' | 'future' | 'benchmarks'>('contributions');
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Reading Progress State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reviewedTabs, setReviewedTabs] = useState<Set<string>>(new Set(['contributions']));

  // TTS State (gemini-3.8-flash-tts)
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsVoice, setTtsVoice] = useState('Zephyr'); // 'Zephyr', 'Kore', 'Puck', 'Fenrir', 'Charon'
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fast Scholar Q&A (gemini-3.1-flash-lite)
  const [fastQuestion, setFastQuestion] = useState('');
  const [fastAnswer, setFastAnswer] = useState<string | null>(null);
  const [isFastQuerying, setIsFastQuerying] = useState(false);

  // Science Skills: Literature Search
  const [relatedLiterature, setRelatedLiterature] = useState<ScienceLiteratureResult[]>([]);
  const [isLoadingLit, setIsLoadingLit] = useState(false);
  const [litSearchQuery, setLitSearchQuery] = useState(paper.field || paper.taxonomies[0] || 'Machine Learning');

  // Track review progress when switching tabs
  const handleTabChange = (tab: 'contributions' | 'methodology' | 'limitations' | 'future' | 'benchmarks') => {
    setActiveTab(tab);
    setReviewedTabs((prev) => new Set(prev).add(tab));
  };

  // Scroll listener for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset reviewed tabs when paper changes and start reading session
  useEffect(() => {
    setReviewedTabs(new Set(['contributions']));
    setScrollProgress(0);
    ReadingAnalyticsTracker.getInstance().startReadingPaper(
      paper.id,
      paper.pageCount ? paper.pageCount * 450 : 3500,
      paper.field
    );
    fetchLiterature(paper.taxonomies[0] || paper.field || paper.title.split(' ')[0]);
  }, [paper.id]);

  const fetchLiterature = async (query: string) => {
    try {
      setIsLoadingLit(true);
      const res = await fetch(`/api/science/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setRelatedLiterature(data.results || []);
      }
    } catch (e) {
      console.warn('Literature lookup failed:', e);
    } finally {
      setIsLoadingLit(false);
    }
  };

  // Play TTS
  const handlePlayTTS = async () => {
    if (isPlayingTts && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingTts(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlayingTts(true);
      return;
    }

    try {
      setIsGeneratingTts(true);
      const ttsScript = `Executive Intelligence Briefing on ${paper.title}. ${paper.executiveSummary}. Core Contribution: ${paper.keyContributions[0]?.title}. ${paper.keyContributions[0]?.description}. Primary Limitation: ${paper.limitations[0]?.description || 'None noted'}.`;

      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsScript,
          voice: ttsVoice,
          style: 'Authoritative, calm, distinguished executive fellow delivering a Nobel-grade research briefing',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'TTS generation failed');
      }

      const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
      audioRef.current = audio;

      audio.onended = () => setIsPlayingTts(false);
      audio.onpause = () => setIsPlayingTts(false);
      audio.onplay = () => setIsPlayingTts(true);

      audio.play();
      setIsPlayingTts(true);
    } catch (err) {
      console.error('TTS error:', err);
      alert('Could not generate speech briefing. Please try again.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Fast scholar query (gemini-3.1-flash-lite)
  const handleFastQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastQuestion.trim()) return;

    try {
      setIsFastQuerying(true);
      setFastAnswer(null);
      const res = await fetch('/api/gemini/fast-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: fastQuestion,
          context: `${paper.title}\n${paper.executiveSummary}\n${JSON.stringify(paper.methodology)}\n${JSON.stringify(paper.limitations)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFastAnswer(data.answer);
      }
    } catch (err) {
      console.error('Fast query error:', err);
    } finally {
      setIsFastQuerying(false);
    }
  };

  // Tab definitions
  const allTabs: { key: 'contributions' | 'methodology' | 'limitations' | 'future' | 'benchmarks'; label: string; icon: any; count?: number }[] = [
    { key: 'contributions', label: 'Key Contributions', icon: Award, count: paper.keyContributions?.length },
    { key: 'methodology', label: 'Methodology & Math', icon: Cpu },
    { key: 'limitations', label: 'Limitations & Bounds', icon: AlertTriangle, count: paper.limitations?.length },
    { key: 'future', label: 'Future Horizons', icon: Compass, count: paper.futureWork?.length },
    { key: 'benchmarks', label: 'Empirical Benchmarks', icon: BarChart3, count: paper.benchmarks?.length },
  ];

  // Combined reading progress metric (weighted average of scroll + reviewed sections)
  const reviewedSectionsCount = reviewedTabs.size;
  const sectionsProgress = Math.round((reviewedSectionsCount / 5) * 100);
  const overallReadingProgress = Math.min(100, Math.round(scrollProgress * 0.4 + sectionsProgress * 0.6));

  return (
    <div className="space-y-6">
      {/* Dynamic Reading Progress Bar & Milestone Indicator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-400 font-bold text-xs uppercase tracking-wider">
              Reading Progress: {overallReadingProgress}%
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-sans">
              {reviewedSectionsCount} of 5 Sections Explored
            </span>
          </div>

          {/* Section mini-milestones */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {allTabs.map((t) => {
              const isReviewed = reviewedTabs.has(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition border ${
                    activeTab === t.key
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : isReviewed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {isReviewed && <Check className="w-2.5 h-2.5" />}
                  <span>{t.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 transition-all duration-300 rounded-full shadow-sm"
            style={{ width: `${overallReadingProgress}%` }}
          />
        </div>
      </div>

      {/* Luxury Editorial Header Card */}
      <div className="bg-slate-900 border border-amber-500/25 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background ambient gold glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 sm:gap-6 relative z-10">
          <div className="space-y-2.5 sm:space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {paper.field}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {paper.venueYear}
              </span>
              {paper.doi && paper.doi !== 'N/A' && (
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px] sm:max-w-[200px]">
                  DOI: {paper.doi}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl lg:text-3xl font-serif font-bold text-slate-50 tracking-tight leading-snug">
              {paper.title}
            </h2>

            <p className="text-xs text-amber-300/80 font-mono truncate">
              Authors: {paper.authors?.join(', ') || 'Scholarly Authors'}
            </p>

            {/* Executive Summary */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans border-l-4 border-l-amber-400">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-1 font-bold">
                Executive Takeaway & Paradigm Impact
              </div>
              {paper.executiveSummary}
            </div>
          </div>

          {/* Right: Novelty Gauge & Action Buttons */}
          <div className="flex flex-col items-start lg:items-end justify-between gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
            {/* Breakthrough Score Meter */}
            <div className="flex items-center gap-3 bg-slate-950/80 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3.5 shadow-lg w-full sm:w-auto">
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                <svg className="w-11 h-11 sm:w-14 sm:h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-1000 ease-out"
                    strokeDasharray={`${paper.breakthroughScore}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-xs sm:text-sm text-amber-300">
                  {paper.breakthroughScore}
                </span>
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Novelty Index
                </div>
                <div className="text-xs font-semibold text-slate-200">
                  {paper.breakthroughScore >= 95 ? 'Paradigm Shift' : 'High Impact'}
                </div>
              </div>
            </div>

            {/* Action Buttons: 2x2 grid on mobile phones, flex wrap on tablet/desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => (onOpenCitations ? onOpenCitations() : setIsCitationModalOpen(true))}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition shadow"
                title="Generate Citation (APA, MLA, BibTeX, Chicago)"
              >
                <Quote className="w-3.5 h-3.5 text-amber-400" />
                <span>Cite Paper</span>
              </button>

              <button
                onClick={() => (onOpenPrintReport ? onOpenPrintReport() : setIsPrintModalOpen(true))}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition shadow"
                title="Export Professionally Formatted Print-Ready PDF Archive"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={onSaveToDrive}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition shadow"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>{isDriveSaved ? 'Saved in Drive' : 'Save to Drive'}</span>
              </button>

              <button
                onClick={onSendViaGmail}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send via Gmail</span>
              </button>
            </div>
          </div>
        </div>

        {/* TTS Audio Player Widget (gemini-3.8-flash-tts) */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-950/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handlePlayTTS}
              disabled={isGeneratingTts}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition shadow-md shadow-amber-400/20 disabled:opacity-50 shrink-0"
            >
              {isGeneratingTts ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : isPlayingTts ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Audio Executive Briefing
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  gemini-3.8-flash-tts
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Natural vocal dynamics & Nobel-level timbre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400 font-mono">Voice:</span>
            <select
              value={ttsVoice}
              onChange={(e) => setTtsVoice(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-400 transition"
            >
              {['Zephyr', 'Kore', 'Puck', 'Fenrir', 'Charon'].map((v) => (
                <option key={v} value={v}>
                  {v} (Prebuilt)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Luxury Segmented View Switcher */}
      <div className="flex border-b border-slate-800/90 gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition whitespace-nowrap ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[350px]">
        {/* 1. KEY CONTRIBUTIONS */}
        {activeTab === 'contributions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paper.keyContributions?.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 shadow-lg transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                      Contribution 0{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.noveltyScore}% Novelty
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-slate-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.evidenceQuote && (
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-[11px] text-amber-200/80 italic font-serif">
                    "{item.evidenceQuote}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 2. METHODOLOGY & MATH */}
        {activeTab === 'methodology' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
                  System Architecture & Pipeline Blueprint
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {paper.methodology?.architectureOverview}
                </p>
              </div>

              {paper.methodology?.mathematicalFormulation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                    Mathematical Formulation & Objectives
                  </div>
                  <pre className="font-mono text-xs text-amber-200/90 overflow-x-auto whitespace-pre-wrap leading-relaxed py-1">
                    {paper.methodology.mathematicalFormulation}
                  </pre>
                </div>
              )}

              {/* Datasets & Experimental Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Training & Evaluation Datasets
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {paper.methodology?.datasets?.map((ds, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{ds}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Hardware, Compute & Baselines
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {paper.methodology?.experimentalSetup}
                  </p>
                </div>
              </div>

              {/* Sequential Execution Pipeline */}
              {paper.methodology?.pipelineSteps?.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Algorithmic Execution Pipeline
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {paper.methodology.pipelineSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="font-mono text-amber-400 font-bold shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. LIMITATIONS & BOUNDS */}
        {activeTab === 'limitations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paper.limitations?.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-red-500/30 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        item.severity === 'Critical'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : item.severity === 'Moderate'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.severity} Severity
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    {item.description}
                  </h4>
                </div>

                {item.potentialMitigation && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                      Recommended Mitigation:
                    </span>
                    {item.potentialMitigation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 4. FUTURE HORIZONS */}
        {activeTab === 'future' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paper.futureWork?.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-amber-300">
                    {item.area}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.horizon}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.hypothesis}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 5. EMPIRICAL BENCHMARKS */}
        {activeTab === 'benchmarks' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto shadow-lg">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Evaluated Metric</th>
                  <th className="py-3 px-4 text-amber-300">Paper Result</th>
                  <th className="py-3 px-4 text-slate-400">Previous SOTA</th>
                  <th className="py-3 px-4 text-emerald-400">Net Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {paper.benchmarks?.map((bm, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-medium">{bm.metric}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{bm.result}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{bm.baseline}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400">{bm.improvement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Bottom Panels: Fast Scholar Q&A & Science Literature Scout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Fast Scholar Q&A with gemini-3.1-flash-lite */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-semibold">
                  Fast Scholar Q&A
                </h4>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                gemini-3.1-flash-lite
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ask instantaneous technical questions regarding parameters, proofs, or dataset nuances.
            </p>

            {fastAnswer && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-wrap">
                {fastAnswer}
              </div>
            )}
          </div>

          <form onSubmit={handleFastQuery} className="mt-4 flex gap-2">
            <input
              type="text"
              value={fastQuestion}
              onChange={(e) => setFastQuestion(e.target.value)}
              placeholder="e.g. What learning rate and optimizer was used?"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
            <button
              type="submit"
              disabled={isFastQuerying || !fastQuestion.trim()}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 disabled:opacity-40 transition flex items-center gap-1 shrink-0"
            >
              {isFastQuerying ? <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Science Literature Scout (Europe PMC & OpenAlex) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-semibold">
                  Related Literature Scout (Europe PMC / OpenAlex)
                </h4>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-400/10 text-teal-300 border border-teal-400/20">
                Science Skill
              </span>
            </div>

            {/* Quick search input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={litSearchQuery}
                onChange={(e) => setLitSearchQuery(e.target.value)}
                placeholder="Search related scholarly papers..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={() => fetchLiterature(litSearchQuery)}
                disabled={isLoadingLit}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold transition shrink-0"
              >
                {isLoadingLit ? 'Searching...' : 'Scout'}
              </button>
            </div>

            {/* Results list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {relatedLiterature.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center italic">
                  No citations retrieved for this topic yet.
                </div>
              ) : (
                relatedLiterature.slice(0, 5).map((art, idx) => (
                  <a
                    key={idx}
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-teal-500/40 transition group"
                  >
                    <div className="text-xs font-medium text-slate-200 group-hover:text-teal-300 truncate">
                      {art.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      <span>{art.authorString || 'Authors'}</span>
                      <span>·</span>
                      <span>{art.pubYear || '2022'}</span>
                      {art.citedByCount ? (
                        <>
                          <span>·</span>
                          <span className="text-teal-400">{art.citedByCount} Citations</span>
                        </>
                      ) : null}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citation Modal (APA, MLA, Chicago, Harvard, IEEE, BibTeX) */}
      <CitationModal
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
        onReturnHome={onReturnHome}
        paper={paper}
      />

      {/* Print-Ready PDF Academic Archival Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onReturnHome={onReturnHome}
        paper={paper}
      />
    </div>
  );
};
