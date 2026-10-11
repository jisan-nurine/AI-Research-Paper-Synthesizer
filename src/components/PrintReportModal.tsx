import React, { useRef } from 'react';
import { Printer, Download, Home, ArrowLeft } from 'lucide-react';
import { PaperIntelligence } from '../types/research';
import { generateCitation } from '../utils/citationGenerator';

interface PrintReportModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
  paper: PaperIntelligence;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  onClose,
  onReturnHome,
  paper,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${paper.title} - Academic Intelligence Report</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #111827; padding: 40px; max-width: 860px; margin: 0 auto; }
    h1 { font-size: 26px; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 16px; }
    h2 { font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 28px; color: #1f2937; }
    h3 { font-size: 15px; margin-top: 18px; color: #374151; }
    p { margin-bottom: 12px; font-size: 13px; }
    .meta { font-family: sans-serif; font-size: 11px; color: #4b5563; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 4px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f3f4f6; }
    pre { font-family: monospace; font-size: 10px; background: #f3f4f6; padding: 8px; overflow-x: auto; }
    @media print {
      body { padding: 0; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}_Academic_Archival_Report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const apaCitation = generateCitation(paper, 'APA');
  const bibCitation = generateCitation(paper, 'BibTeX');

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

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={handleDownloadHtml}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              title="Download standalone HTML Archive"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HTML Archive</span>
              <span className="sm:hidden">HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleBack}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>

        {/* Title row */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-lg sm:text-2xl font-bold text-slate-100">
              Academic Archival Export & PDF Synthesis
            </h2>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">
              Print-Ready Archive
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
            Synthesis report for: "{paper.title}"
          </p>
        </div>
      </div>

      {/* Main Full Page Printable Document Container */}
      <div className="bg-white text-slate-900 p-4 sm:p-10 lg:p-14 rounded-2xl sm:rounded-3xl shadow-2xl font-serif leading-relaxed selection:bg-amber-200 selection:text-slate-950 print:p-0 print:m-0 print:shadow-none border border-slate-200">
        <div ref={printAreaRef} id="printable-academic-report" className="space-y-5 sm:space-y-7 max-w-4xl mx-auto">
          {/* Academic Archival Header */}
          <div className="border-b-2 border-slate-900 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] sm:text-xs font-sans text-slate-600">
            <div className="font-bold tracking-widest uppercase text-slate-900 truncate">
              AETHELGARD ACADEMIC RESEARCH ARCHIVE · REPORT ID: {paper.id}
            </div>
            <div className="font-mono">
              Generated {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Document Title & Meta */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                {paper.field}
              </span>
              <span className="text-slate-600 font-medium">{paper.venueYear}</span>
              {paper.doi && <span className="text-slate-500 font-mono">DOI: {paper.doi}</span>}
              <span className="ml-auto font-mono text-emerald-800 font-bold">
                Novelty Index: {paper.breakthroughScore}%
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold text-slate-950 tracking-tight leading-snug">
              {paper.title}
            </h1>

            <div className="text-xs sm:text-sm font-sans text-slate-700 italic">
              Authors: {paper.authors?.join(', ') || 'Scholarly Authors'}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border-l-4 border-amber-600 font-sans space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-900">
              Executive Paradigm Impact & Takeaway
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {paper.executiveSummary}
            </p>
          </div>

          {/* Section 1: Key Contributions */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold border-b border-slate-300 pb-1.5 text-slate-900">
              1. Primary Scientific Contributions
            </h2>
            <div className="space-y-3 font-sans">
              {paper.keyContributions?.map((c, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>1.{i + 1} {c.title}</span>
                    <span className="text-amber-800 font-mono">{c.noveltyScore}% Novelty</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.description}</p>
                  {c.evidenceQuote && (
                    <div className="text-[11px] text-slate-600 italic font-serif pl-2 border-l border-amber-400">
                      "{c.evidenceQuote}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Methodology & Mathematical Blueprint */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold border-b border-slate-300 pb-1.5 text-slate-900">
              2. System Architecture & Mathematical Foundations
            </h2>
            <div className="font-sans space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <p>{paper.methodology?.architectureOverview}</p>

              {paper.methodology?.mathematicalFormulation && (
                <div className="p-3 bg-slate-100 rounded border border-slate-300 overflow-x-auto">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-700 mb-1">
                    Formal Mathematical Formulation:
                  </div>
                  <pre className="font-mono text-xs text-slate-900 whitespace-pre-wrap">
                    {paper.methodology.mathematicalFormulation}
                  </pre>
                </div>
              )}

              {paper.methodology?.experimentalSetup && (
                <div>
                  <strong className="text-xs font-bold text-slate-900 block mb-0.5">Experimental & Compute Setup:</strong>
                  <p className="text-xs text-slate-700">{paper.methodology.experimentalSetup}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Empirical Benchmarks Table */}
          {paper.benchmarks?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold border-b border-slate-300 pb-1.5 text-slate-900">
                3. Empirical Evaluation Benchmarks
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2 px-3">Evaluated Metric</th>
                      <th className="py-2 px-3">Paper Result</th>
                      <th className="py-2 px-3">Previous Baseline</th>
                      <th className="py-2 px-3">Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paper.benchmarks.map((bm, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-medium">{bm.metric}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{bm.result}</td>
                        <td className="py-2 px-3 text-slate-600">{bm.baseline}</td>
                        <td className="py-2 px-3 text-emerald-800 font-bold">{bm.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Limitations & Systemic Bounds */}
          {paper.limitations?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold border-b border-slate-300 pb-1.5 text-slate-900">
                4. Primary Limitations & Architectural Bounds
              </h2>
              <div className="space-y-2 font-sans text-xs">
                {paper.limitations.map((lim, i) => (
                  <div key={i} className="p-3 bg-red-50/60 rounded border border-red-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-red-900">
                      <span>4.{i + 1} {lim.category}</span>
                      <span className="text-[10px] uppercase font-mono">{lim.severity} Severity</span>
                    </div>
                    <p className="text-slate-800">{lim.description}</p>
                    {lim.potentialMitigation && (
                      <div className="text-[11px] text-emerald-800 font-medium">
                        Mitigation Pathway: {lim.potentialMitigation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Formatted Academic Bibliography */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-900">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              5. Official Citation Reference
            </h2>
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-[10px] text-slate-500 uppercase block mb-1">APA 7th Edition:</span>
                <p className="font-serif italic text-slate-800">{apaCitation}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 overflow-x-auto">
                <span className="font-bold text-[10px] text-slate-500 uppercase block mb-1">BibTeX Entry:</span>
                <pre className="font-mono text-[11px] text-slate-800 whitespace-pre">{bibCitation}</pre>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-slate-300 text-center text-[10px] font-sans text-slate-500">
            Generated by Aethelgard Research Paper Intelligence for Academic Archival & Scholarly Peer Review.
          </div>
        </div>
      </div>
    </div>
  );
};
