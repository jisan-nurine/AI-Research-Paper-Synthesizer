import React, { useRef, useState } from 'react';
import { Upload, FileText, Check, Plus, Trash2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { PaperIntelligence } from '../types/research';
import { SAMPLE_PAPERS } from '../data/samplePapers';
import { extractTextFromFile } from '../services/pdfParser';

interface UploadTrayProps {
  papers: PaperIntelligence[];
  activePaperId: string | null;
  onSelectPaper: (id: string) => void;
  onAddPaper: (paper: PaperIntelligence) => void;
  onRemovePaper: (id: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  selectedLanguage: string;
  isComparing: boolean;
  onToggleCompare: () => void;
}

export const UploadTray: React.FC<UploadTrayProps> = ({
  papers,
  activePaperId,
  onSelectPaper,
  onAddPaper,
  onRemovePaper,
  isAnalyzing,
  setIsAnalyzing,
  selectedLanguage,
  isComparing,
  onToggleCompare,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setUploadError(null);
      const extracted = await extractTextFromFile(file);

      // Call API
      const response = await fetch('/api/gemini/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: extracted.fileName.replace(/\.pdf$/i, ''),
          text: extracted.text,
          targetLanguage: selectedLanguage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      const newPaper: PaperIntelligence = {
        ...data.data,
        id: 'paper-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        fileName: extracted.fileName,
        analyzedAt: new Date().toISOString(),
        pageCount: extracted.pageCount,
        originalText: extracted.text,
      };

      onAddPaper(newPaper);
    } catch (err: any) {
      console.error('File process error:', err);
      setUploadError(err.message || 'Failed to extract paper intelligence');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await processFile(files[i]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleLoadSample = (sample: PaperIntelligence) => {
    const existing = papers.find((p) => p.title === sample.title);
    if (existing) {
      onSelectPaper(existing.id);
    } else {
      onAddPaper(sample);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top Banner & Benchmark Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold block">
            Research Intake & Vault
          </span>
          <p className="text-xs text-slate-400">
            Upload single or multiple PDF papers simultaneously for comparative intelligence.
          </p>
        </div>

        {/* Quick Benchmark Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">Benchmark Library:</span>
          {SAMPLE_PAPERS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-500/15 border border-slate-700/80 hover:border-amber-500/30 text-[11px] font-medium text-slate-300 hover:text-amber-300 transition flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>{sample.title.split(' ')[0]} ({sample.venueYear.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload Dropzone & Multi-Paper Selection Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-5 border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center cursor-pointer transition text-center ${
            dragOver
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-slate-800 hover:border-amber-500/40 bg-slate-950/60 hover:bg-slate-950'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          {isAnalyzing ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-semibold text-amber-300">
                Extracting Rigorous Paper Intelligence...
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Parsing methodology, contributions, and bounds
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center group">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 group-hover:scale-110 transition">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-200 transition">
                Drop PDF paper(s) here or browse
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Batch analysis enabled: upload multiple papers for simultaneous synthesis
              </span>
            </div>
          )}
        </div>

        {/* Paper Repository Carousel/List */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/40 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">
              Active Papers in Session ({papers.length})
            </span>
            {papers.length >= 2 && (
              <button
                onClick={onToggleCompare}
                className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-md ${
                  isComparing
                    ? 'bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isComparing ? 'Exit Comparison' : 'Compare Papers'}</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {papers.map((p) => {
              const isActive = activePaperId === p.id && !isComparing;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectPaper(p.id);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {p.authors?.slice(0, 2).join(', ')} · {p.venueYear}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400/90 border border-slate-700">
                      {p.breakthroughScore}% Novelty
                    </span>
                    {papers.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePaper(p.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 transition"
                        title="Remove paper"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="text-xs text-red-400 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          {uploadError}
        </div>
      )}
    </div>
  );
};
