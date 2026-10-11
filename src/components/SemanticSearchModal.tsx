import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, BookOpen, AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { PaperIntelligence } from '../types/research';

export interface SemanticSearchResult {
  paperId: string;
  paperTitle: string;
  section: string;
  snippet: string;
  relevanceScore: number;
  matchExplanation: string;
}

interface SemanticSearchModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
  papers: PaperIntelligence[];
  onSelectResult: (paperId: string, sectionTab?: string) => void;
}

export const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({
  onClose,
  onReturnHome,
  papers,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch('/api/gemini/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          papers: papers.map((p) => ({
            id: p.id,
            title: p.title,
            abstract: p.executiveSummary,
            keyContributions: p.keyContributions,
            methodology: p.methodology,
            limitations: p.limitations,
            benchmarks: p.benchmarks,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
    } catch (err: any) {
      console.error('Semantic search failed:', err);
      setError(err.message || 'Failed to search across papers');
    } finally {
      setIsSearching(false);
    }
  };

  const mapSectionToTab = (section: string): string => {
    const s = section.toLowerCase();
    if (s.includes('contribution')) return 'contributions';
    if (s.includes('method') || s.includes('math') || s.includes('architecture')) return 'methodology';
    if (s.includes('limit') || s.includes('bound')) return 'limitations';
    if (s.includes('future') || s.includes('horizon')) return 'future';
    if (s.includes('benchmark') || s.includes('metric')) return 'benchmarks';
    return 'contributions';
  };

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

          <button
            onClick={handleBack}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow flex items-center gap-1 shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Title row */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-100">
              Cross-Corpus Semantic Search
            </h2>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">
              Embedding Retrieval
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Query scientific concepts in natural language across all {papers.length} active research papers.
          </p>
        </div>
      </div>

      {/* Main Full Page Content */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
        {/* Large Search Hero Bar */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 absolute left-3.5 sm:left-5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scientific hypotheses, architecture mechanisms, or empirical benchmarks..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl sm:rounded-2xl pl-11 sm:pl-14 pr-20 sm:pr-36 py-3 sm:py-4 text-xs sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 sm:right-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
          >
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">Execute Search</span>
                <span className="sm:hidden">Search</span>
              </>
            )}
          </button>
        </form>

        {/* Quick query recommendation chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 pb-3 border-b border-slate-800 text-xs">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1 w-full sm:w-auto">
            Suggested Concept Queries:
          </span>
          {[
            'vanishing gradient resolution',
            'multiple sequence alignment in cryo-EM',
            'quadratic attention complexity mitigation',
            'loss functions and convergence bounds',
            'generalization across downstream tasks',
          ].map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => {
                setQuery(idea);
              }}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-950 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] sm:text-xs border border-slate-800 hover:border-amber-500/40 transition text-left"
            >
              {idea}
            </button>
          ))}
        </div>

        {/* Search Results Feed */}
        <div className="space-y-3 sm:space-y-4 min-h-[250px] sm:min-h-[300px]">
          {isSearching ? (
            <div className="py-16 sm:py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-mono text-amber-300">
                Running semantic scan across {papers.length} loaded papers...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400 font-mono">
                <span>{results.length} semantic matches identified</span>
                <span className="hidden sm:inline">Click any match to jump to the exact paper section</span>
              </div>
              {results.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectResult(res.paperId, mapSectionToTab(res.section));
                    handleBack();
                  }}
                  className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition group shadow-md space-y-2.5 sm:space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-serif font-bold text-slate-100 text-xs sm:text-base group-hover:text-amber-200 transition truncate">
                        {res.paperTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {res.section}
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {res.relevanceScore}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pl-2 border-l-2 border-amber-500/30">
                    "{res.snippet}"
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-900 gap-1 text-[11px] sm:text-xs">
                    <span className="text-amber-300/80 italic font-mono truncate">
                      Analysis: {res.matchExplanation}
                    </span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1 font-semibold shrink-0">
                      <span>Jump to Section</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : query && !isSearching ? (
            <div className="py-16 sm:py-20 text-center text-xs sm:text-sm text-slate-500 italic">
              No direct semantic matches found. Try alternative keywords or broader scientific phrasing.
            </div>
          ) : (
            <div className="py-16 sm:py-20 text-center text-xs sm:text-sm text-slate-500">
              Enter a research concept above to scan contributions, methodologies, and benchmarks across all loaded papers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
