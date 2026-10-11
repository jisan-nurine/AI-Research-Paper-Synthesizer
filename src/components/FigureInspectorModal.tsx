import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Sparkles, AlertCircle, Home, ArrowLeft, FileImage } from 'lucide-react';

interface FigureInspectorModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onReturnHome?: () => void;
}

export const FigureInspectorModal: React.FC<FigureInspectorModalProps> = ({
  onClose,
  onReturnHome,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleFigures = [
    {
      name: 'ResNet Skip Connection Block',
      desc: 'Residual function learning curve and identity mapping diagram',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Attention Mechanism Architecture',
      desc: 'Scaled dot-product and multi-head attention topology',
      url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Protein AlphaFold Invariant Point Attention',
      desc: '3D backbone frame transformations & pair representation',
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleBack = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setImagePreview(res);
      // Strip out the data:image/...;base64, prefix for Gemini
      const base64Data = res.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: (typeof sampleFigures)[0]) => {
    try {
      setError(null);
      setImagePreview(sample.url);
      const resp = await fetch(sample.url);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setImageBase64(res.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      console.error('Failed to load sample figure:', e);
      setError('Could not fetch preset image. You may upload any custom image file directly.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Please upload a diagram or select a benchmark figure first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setAnalysisResult(null);

      const res = await fetch('/api/gemini/figure-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
          prompt: customPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gemini Vision analysis failed');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Figure vision error:', err);
      setError(err.message || 'Failed to inspect figure with Gemini');
    } finally {
      setIsAnalyzing(false);
    }
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
              Figure & Diagram Vision Inspector
            </h2>
            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20">
              gemini-3.1-pro-preview
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload charts, architectures, loss curves, or microscopy for multimodal peer-review dissection.
          </p>
        </div>
      </div>

      {/* Main Full Page Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Intake, Upload, Presets & Action */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl space-y-4 sm:space-y-5 flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-amber-400" />
                <span>Figure Input & Specification</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Multimodal OCR</span>
            </div>

            {/* Upload Dropzone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition text-center group">
              <Upload className="w-7 h-7 sm:w-9 sm:h-9 text-slate-400 group-hover:text-amber-400 transition mb-2" />
              <span className="text-xs font-semibold text-slate-200">
                Tap to browse or drop figure snapshot
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                PNG, JPEG, WebP, SVG (diagrams, plots, formulas)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Quick Benchmark Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-mono uppercase tracking-wider">
                Benchmark Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {sampleFigures.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className="text-left p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/80 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/30 transition group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 truncate">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {sample.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Directive */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 font-mono uppercase tracking-wider">
                Analysis Directive (Optional)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Verify statistical error bars, baseline comparisons..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2 sm:space-y-3">
            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzing}
              className="w-full py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 to-amber-200 hover:from-amber-300 hover:to-amber-100 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-40 transition flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Dissecting Figure with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Figure with Gemini Vision</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Figure Preview & Detailed Scientific Analysis */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl flex flex-col space-y-4 sm:space-y-5 min-h-[420px] sm:min-h-[550px]">
          <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-sm sm:text-base font-semibold text-slate-100">
                Figure Preview & Multimodal Dissection
              </h3>
            </div>
            {imagePreview && (
              <span className="font-mono text-xs text-emerald-400">Image Loaded</span>
            )}
          </div>

          {/* Visual Preview */}
          {imagePreview ? (
            <div className="border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 p-3 sm:p-4 flex items-center justify-center max-h-[240px] sm:max-h-[280px]">
              <img
                src={imagePreview}
                alt="Target figure"
                className="max-h-[210px] sm:max-h-[250px] object-contain rounded-xl shadow-lg"
              />
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-10 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500 text-xs">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-30 text-slate-400" />
              <span>Select a preset or upload a figure from your paper</span>
            </div>
          )}

          {/* Detailed Gemini Dissection Output */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 overflow-y-auto max-h-[320px] sm:max-h-[380px] text-xs sm:text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
            {analysisResult ? (
              <div className="prose prose-invert prose-xs max-w-none space-y-3 whitespace-pre-wrap">
                {analysisResult}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-center py-6 sm:py-10">
                Deep architectural analysis, equation verification, and peer-review takeaway critique will render here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
