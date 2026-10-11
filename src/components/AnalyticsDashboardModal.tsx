import React, { useState, useEffect } from 'react';
import {
  Clock,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles,
  PieChart,
  Home,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { ReadingAnalyticsTracker } from '../services/readingAnalytics';

interface AnalyticsDashboardModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
}

export const AnalyticsDashboardModal: React.FC<AnalyticsDashboardModalProps> = ({
  onClose,
  onReturnHome,
}) => {
  const [stats, setStats] = useState(ReadingAnalyticsTracker.getInstance().getStats());

  const handleBack = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    setStats(ReadingAnalyticsTracker.getInstance().getStats());
    const interval = setInterval(() => {
      setStats(ReadingAnalyticsTracker.getInstance().getStats());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Page Top Navigation Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur space-y-3 sm:space-y-4">
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
            <button
              onClick={() => setStats(ReadingAnalyticsTracker.getInstance().getStats())}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1"
              title="Refresh statistics"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleBack}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow flex items-center gap-1 shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Title row */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-100">
              Personalized Reading Analytics & Hours Saved
            </h2>
            <span className="font-mono text-[9px] uppercase px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">
              Cognitive Tracker
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantified academic time economy, reading velocity (WPM), and research hours conserved.
          </p>
        </div>
      </div>

      {/* Main Full Page Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* 4 Hero Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Hours Saved */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider truncate">Hours Saved</span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-serif font-bold text-amber-300 mt-1">
              {stats.hoursSaved} hrs
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-400 font-mono mt-1 sm:mt-2 flex items-center gap-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>+{stats.speedupMultiplier}x speed</span>
            </div>
          </div>

          {/* 2. Average Reading Speed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider truncate">Velocity</span>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-serif font-bold text-teal-300 mt-1">
              {stats.averageWpm}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-mono mt-1 sm:mt-2 truncate">
              Words/min (WPM)
            </div>
          </div>

          {/* 3. Papers Analyzed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider truncate">Digested</span>
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mt-1">
              {stats.papersReviewedCount}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-mono mt-1 sm:mt-2 truncate">
              {stats.pagesDigestedCount} pages parsed
            </div>
          </div>

          {/* 4. Active Review Time */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider truncate">Time Spent</span>
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
            </div>
            <div className="text-2xl sm:text-4xl font-serif font-bold text-purple-300 mt-1">
              {stats.totalMinutesSpent}m
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-mono mt-1 sm:mt-2 truncate">
              Live engagement
            </div>
          </div>
        </div>

        {/* Comparative Time Economy Visualizer */}
        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs font-mono">
            <span className="text-amber-300 font-bold uppercase tracking-wider text-xs sm:text-sm">
              Literature Review Velocity Comparison
            </span>
            <span className="text-slate-400 text-[11px]">
              Manual Literature Review vs Aethelgard Intelligence Pipeline
            </span>
          </div>

          {/* Comparative Bars */}
          <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
            <div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-300 mb-1 font-mono">
                <span>Traditional Peer Reading (~3.5 hrs / paper):</span>
                <span className="text-red-400 font-bold">
                  {(stats.papersReviewedCount * 3.5).toFixed(1)} hrs
                </span>
              </div>
              <div className="w-full h-3 sm:h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="w-full h-full bg-red-500/60 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-300 mb-1 font-mono">
                <span>With Aethelgard Pipeline:</span>
                <span className="text-emerald-400 font-bold">
                  {(stats.totalMinutesSpent / 60).toFixed(1)} hrs ({stats.totalMinutesSpent} mins)
                </span>
              </div>
              <div className="w-full h-3 sm:h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.max(6, Math.min(100, (stats.totalMinutesSpent / (stats.papersReviewedCount * 210)) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 sm:gap-3 mt-2 sm:mt-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              By distilling the 5 core pillars (<span className="text-amber-200">Key Contributions, Methodology & Math, Limitations & Bounds, Future Horizons, and Empirical Benchmarks</span>), your literature review operates at an estimated <strong className="text-amber-300 font-bold">{stats.speedupMultiplier}x acceleration</strong> compared to traditional reading speed.
            </p>
          </div>
        </div>

        {/* Category Knowledge Distribution & Speed Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Domain Coverage Distribution</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              {Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                <div key={cat} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="text-slate-400 truncate">{cat}</div>
                  <div className="text-base sm:text-lg font-serif font-bold text-amber-300 mt-0.5 sm:mt-1">
                    {count} sessions
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider font-semibold">
              <Award className="w-4 h-4 text-teal-400" />
              <span>Reading Velocity Milestones</span>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-1">
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Standard Reader</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Baseline pace</div>
                </div>
                <div className="text-xs font-mono text-slate-400">200 - 250 WPM</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-300">Your Current Velocity</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400">With AI decomposition</div>
                </div>
                <div className="text-xs font-mono font-bold text-amber-400">{stats.averageWpm} WPM</div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Target Velocity</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400">Peak efficiency</div>
                </div>
                <div className="text-xs font-mono text-emerald-400">750+ WPM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
