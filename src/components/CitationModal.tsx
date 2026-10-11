import React, { useState } from 'react';
import { Quote, Copy, Check, Download, Home, ArrowLeft } from 'lucide-react';
import { PaperIntelligence } from '../types/research';
import { generateCitation, CitationStyle } from '../utils/citationGenerator';

interface CitationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
  paper: PaperIntelligence;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  onClose,
  onReturnHome,
  paper,
}) => {
  const [activeStyle, setActiveStyle] = useState<CitationStyle>('APA');
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  const citationText = generateCitation(paper, activeStyle);

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadBib = () => {
    const bibtex = generateCitation(paper, 'BibTeX');
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.slice(0, 20).replace(/\s+/g, '_')}.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const styles: CitationStyle[] = ['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE', 'BibTeX'];

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
              Academic Citation Generator
            </h2>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">
              Peer Review Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
            Generating bibliography for: "{paper.title}"
          </p>
        </div>
      </div>

      {/* Main Full Page Body */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
          <div>
            <h3 className="font-serif text-sm sm:text-base font-semibold text-slate-100">
              Select Citation Convention
            </h3>
            <p className="text-xs text-slate-400">
              Standardized formatting adhering to major university and publisher guidelines.
            </p>
          </div>

          {/* Style Selector Tabs */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl">
            {styles.map((style) => (
              <button
                key={style}
                onClick={() => {
                  setActiveStyle(style);
                  setCopied(false);
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold tracking-wide transition text-center ${
                  activeStyle === style
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Citation Display Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Formatted Output ({activeStyle})</span>
            <span className="truncate max-w-[200px]">{paper.doi ? `DOI: ${paper.doi}` : 'Verified Academic Meta'}</span>
          </div>

          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-base leading-relaxed overflow-x-auto min-h-[120px] sm:min-h-[140px] flex items-center shadow-inner">
            {activeStyle === 'BibTeX' ? (
              <pre className="font-mono text-xs text-amber-200/90 whitespace-pre w-full">
                {citationText}
              </pre>
            ) : (
              <p className="font-serif italic text-slate-100 select-all">
                {citationText}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 truncate">
            Venue: <span className="text-slate-200 font-medium">{paper.venueYear}</span> · Field: <span className="text-amber-400">{paper.field}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {activeStyle === 'BibTeX' && (
              <button
                onClick={handleDownloadBib}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download .bib</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-lg ${
                copied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Citation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
