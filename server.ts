import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for polite scientific API fetching with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelayMs = 600
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay = !Number.isNaN(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const errorBody = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} (${response.statusText}) from ${url}: ${errorBody.slice(0, 300)}`);
  }
  throw new Error(`Exhausted retries for ${url}`);
}

// 1. Analyze single paper
app.post('/api/gemini/analyze-paper', async (req, res) => {
  try {
    const { title, text, abstract, targetLanguage } = req.body;
    if (!text && !abstract) {
      return res.status(400).json({ error: 'Paper text or abstract is required' });
    }

    const languageInstruction = targetLanguage && targetLanguage !== 'English'
      ? `Provide the analysis translated into ${targetLanguage}. Maintain technical terminology, mathematical notation, and author names accurately.`
      : 'Provide the analysis in English.';

    const prompt = `You are an elite scientific intelligence analyst and peer review editor for high-impact research.
Analyze the following research paper text thoroughly and extract a structured intelligence report.

${languageInstruction}

Format your output STRICTLY as valid JSON matching this schema:
{
  "title": "Normalized Paper Title",
  "authors": ["Author 1", "Author 2"],
  "venueYear": "Journal/Conference & Year (e.g., Nature 2021 or arXiv 2017)",
  "doi": "DOI if mentioned or N/A",
  "field": "Primary Scientific Field (e.g., Structural Biology, Deep Learning, Quantum Computing)",
  "executiveSummary": "A dense, high-impact 2-sentence executive summary of the paper's core breakthrough and significance.",
  "breakthroughScore": 95, // 0 to 100 score on paradigm shift / novelty
  "keyContributions": [
    {
      "title": "Contribution Title",
      "description": "Rigorous explanation of what is new and significant.",
      "noveltyScore": 92,
      "evidenceQuote": "Direct quote or key statement from the text verifying this."
    }
  ],
  "methodology": {
    "architectureOverview": "Detailed technical explanation of the pipeline, architecture, or algorithmic framework.",
    "mathematicalFormulation": "Key equations, mathematical principles, loss functions, or objective representations used.",
    "datasets": ["Dataset/Specimen 1", "Dataset 2"],
    "experimentalSetup": "Hardware, compute, baselines, hyperparameters, or laboratory procedures.",
    "pipelineSteps": ["Step 1: Data prep", "Step 2: Representation learning", "Step 3: Validation"]
  },
  "limitations": [
    {
      "category": "Theoretical / Computational / Empirical / Generalizability",
      "description": "Specific limitation, boundary condition, or failure mode.",
      "severity": "Low | Moderate | Critical",
      "potentialMitigation": "How future research could resolve or bypass this limitation."
    }
  ],
  "futureWork": [
    {
      "area": "Proposed Extension",
      "hypothesis": "The open question or next hypothesis.",
      "horizon": "Immediate (6-12m) | Medium-term (1-3y) | Long-term (3-5y)"
    }
  ],
  "benchmarks": [
    {
      "metric": "e.g., GDT score / BLEU-4 / Top-1 Accuracy",
      "result": "Score achieved by proposed method",
      "baseline": "Previous state-of-the-art score",
      "improvement": "Percentage or margin of gain"
    }
  ],
  "taxonomies": ["Keyword 1", "Keyword 2", "MeSH/Domain Term 3"]
}

PAPER CONTENT:
Title: ${title || 'Untitled Research'}
Abstract: ${abstract || ''}
Body Excerpt:
${(text || '').slice(0, 45000)}
`;

    // Attempt with gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Paper analysis error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze paper' });
  }
});

// 2. Compare multiple papers
app.post('/api/gemini/compare-papers', async (req, res) => {
  try {
    const { papers, targetLanguage } = req.body;
    if (!papers || !Array.isArray(papers) || papers.length < 2) {
      return res.status(400).json({ error: 'At least two papers are required for comparative analysis' });
    }

    const languageInstruction = targetLanguage && targetLanguage !== 'English'
      ? `Provide the comparative synthesis in ${targetLanguage}. Maintain scientific terms and paper identifiers.`
      : 'Provide the synthesis in English.';

    const papersSummary = papers.map((p, idx) => `
PAPER [${idx + 1}]: "${p.title}"
Field: ${p.field || 'N/A'}
Key Contributions: ${JSON.stringify(p.keyContributions || [])}
Methodology: ${JSON.stringify(p.methodology || {})}
Limitations: ${JSON.stringify(p.limitations || [])}
Benchmarks: ${JSON.stringify(p.benchmarks || [])}
`).join('\n\n');

    const prompt = `You are a distinguished scientific director and principal investigator.
Synthesize and compare the following ${papers.length} research papers.

${languageInstruction}

Return STRICT JSON matching this schema:
{
  "comparativeSynthesis": "High-level meta-analysis of how these papers interact, compete, or build upon one another.",
  "divergenceSummary": "Primary architectural and conceptual divergences.",
  "matrix": [
    {
      "dimension": "e.g. Core Objective / Algorithmic Paradigm / Computational Complexity / Robustness / Scalability",
      "paperAssessments": [
        {
          "paperTitle": "Paper 1 Title",
          "assessment": "Detailed evaluation for this dimension"
        }
      ],
      "winnerOrVerdict": "Analysis of trade-offs or superior paradigm for this dimension"
    }
  ],
  "conflictingAssumptions": [
    "Identified disagreement or contradictory hypothesis between the papers"
  ],
  "sharedVulnerabilities": [
    "Limitations shared across all evaluated papers"
  ],
  "synergiesAndHybridPotential": "How a hybrid architecture combining techniques from these papers could surpass all of them.",
  "executiveRecommendation": "Clear, actionable recommendation for research labs, technology executives, or practitioners choosing between these approaches."
}

PAPERS DATA:
${papersSummary}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Comparative analysis error:', error);
    return res.status(500).json({ error: error.message || 'Failed to compare papers' });
  }
});

// 3. Multi-language translation of intelligence report
app.post('/api/gemini/translate', async (req, res) => {
  try {
    const { content, targetLanguage } = req.body;
    if (!content || !targetLanguage) {
      return res.status(400).json({ error: 'Content and target language are required' });
    }

    const prompt = `You are a high-level multilingual scientific translator.
Translate the following scientific research intelligence payload into ${targetLanguage}.
Requirements:
1. Preserve all mathematical notations, LaTeX symbols, metric units, and author names.
2. Use precise, authoritative academic vocabulary native to ${targetLanguage}.
3. Return the exact JSON structure with translated textual values.

JSON PAYLOAD:
${JSON.stringify(content)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to translate' });
  }
});

// 4. TTS with model gemini-3.8-flash-tts
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voice, style } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // gemini-3.8-flash-tts as explicitly required by prompt
    const voiceName = voice || 'Zephyr'; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const speechStyle = style || 'Authoritative, calm, distinguished research fellow conducting an executive briefing';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 3000), // optimal length for crisp audio clip
              speechMetadata: {
                style: speechStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio generated from gemini-3.8-flash-tts');
    }

    // Unary default is a complete WAV file (audio/wav, 24kHz mono 16-bit)
    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate speech' });
  }
});

// 5. Image & Figure Understanding
app.post('/api/gemini/analyze-figure', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const userPrompt = prompt || `You are an expert scientific peer reviewer and diagram specialist.
Dissect this scientific figure, architectural diagram, plot, or formula sheet with extreme precision:
1. Figure Type & Identification (e.g., Ablation Bar Chart, ROC Curve, Microscopic Assay, Transformer Architecture)
2. Core Findings & Data Trends: What do the axes, bars, bands, or layers indicate?
3. Quantitative Outliers or Key Data Points: Exact numbers or milestones depicted.
4. Scientific Implications: What does this figure prove or dispute regarding the paper's thesis?
5. Potential Flaws or Missing Controls in the representation.
Provide clear, structured markdown formatting.`;

    let response;
    try {
      // First try gemini-3.1-pro-preview as requested
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/png',
                data: cleanBase64,
              },
            },
            { text: userPrompt },
          ],
        },
      });
    } catch (err: any) {
      console.warn('Pro model unavailable or quota reached, falling back to gemini-3.8-flash for vision:', err?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/png',
                data: cleanBase64,
              },
            },
            { text: userPrompt },
          ],
        },
      });
    }

    return res.json({
      success: true,
      analysis: response.text || 'No analysis output returned.',
    });
  } catch (error: any) {
    console.error('Figure analysis error:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze figure' });
  }
});

// 6. Fast Scholarly Q&A with gemini-3.1-flash-lite
app.post('/api/gemini/fast-query', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `You are an instantaneous research assistant. Answer with extreme precision and brevity based on the provided paper context.
Context:
${(context || '').slice(0, 15000)}

Question:
${question}
`,
    });

    return res.json({
      success: true,
      answer: response.text,
    });
  } catch (error: any) {
    console.error('Fast query error:', error);
    return res.status(500).json({ error: error.message || 'Failed to query' });
  }
});

// 6.5 Global Semantic Search across all uploaded papers
app.post('/api/gemini/semantic-search', async (req, res) => {
  try {
    const { query, papers } = req.body;
    if (!query || !papers || !papers.length) {
      return res.status(400).json({ error: 'Query and papers are required' });
    }

    const papersContext = papers.map((p: any) => `
ID: ${p.id}
Title: ${p.title}
Executive Summary: ${p.executiveSummary}
Key Contributions: ${p.keyContributions?.map((c: any) => `${c.title}: ${c.description}`).join(' | ')}
Methodology: ${p.methodology?.architectureOverview} | Math: ${p.methodology?.mathematicalFormulation}
Limitations: ${p.limitations?.map((l: any) => `${l.category}: ${l.description}`).join(' | ')}
Benchmarks: ${p.benchmarks?.map((b: any) => `${b.metric}: ${b.result}`).join(' | ')}
`).join('\n---\n');

    const prompt = `You are an expert academic semantic search engine.
A researcher entered this concept query: "${query}"

Scan the following uploaded research papers and return the most relevant matching sections and conceptual insights.
Return STRICT JSON array of objects matching:
[
  {
    "paperId": "exact paper id",
    "paperTitle": "paper title",
    "section": "Contributions" | "Methodology" | "Limitations" | "Future Work" | "Benchmarks" | "Executive Summary",
    "snippet": "relevant excerpt or quote from the paper",
    "relevanceScore": 95,
    "matchExplanation": "Brief 1-sentence explanation of how this satisfies the query"
  }
]
Sort descending by relevanceScore. Return top 6 matches.

PAPERS REPOSITORY:
${papersContext}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ success: true, results: parsed });
  } catch (error: any) {
    console.error('Semantic search error:', error);
    return res.status(500).json({ error: error.message || 'Semantic search failed' });
  }
});

// 7. Science Skills Integration: Europe PMC & OpenAlex literature search
app.get('/api/science/search', async (req, res) => {
  try {
    const query = String(req.query.q || '');
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Query Europe PMC REST API
    const epmcUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=8&resultType=core`;
    const epmcRes = await fetchWithRetry(epmcUrl, {
      headers: { 'Accept': 'application/json' },
    });
    const epmcData = await epmcRes.json();
    const epmcArticles = (epmcData?.resultList?.result || []).map((art: any) => ({
      source: 'Europe PMC',
      id: art.id,
      pmid: art.pmid,
      doi: art.doi,
      title: art.title,
      authorString: art.authorString,
      journalTitle: art.journalTitle || art.bookOrReportDetails?.publisher,
      pubYear: art.pubYear,
      citedByCount: art.citedByCount || 0,
      isOpenAccess: art.isOpenAccess === 'Y',
      abstractText: art.abstractText,
      url: art.doi ? `https://doi.org/${art.doi}` : (art.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/` : `https://europepmc.org/article/${art.source}/${art.id}`),
    }));

    // Query OpenAlex API
    let openAlexArticles: any[] = [];
    try {
      const alexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=6&sort=cited_by_count:desc`;
      const alexRes = await fetchWithRetry(alexUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ResearchPaperIntelligence/1.0 (mailto:scientist@example.com)',
        },
      });
      const alexData = await alexRes.json();
      openAlexArticles = (alexData?.results || []).map((work: any) => ({
        source: 'OpenAlex',
        id: work.id,
        doi: work.doi?.replace('https://doi.org/', ''),
        title: work.title,
        authorString: (work.authorships || []).map((a: any) => a.author?.display_name).slice(0, 4).join(', '),
        journalTitle: work.primary_location?.source?.display_name,
        pubYear: work.publication_year,
        citedByCount: work.cited_by_count || 0,
        isOpenAccess: work.open_access?.is_oa || false,
        url: work.doi || work.id,
      }));
    } catch (alexErr) {
      console.warn('OpenAlex query skipped or errored:', alexErr);
    }

    return res.json({
      success: true,
      results: [...epmcArticles, ...openAlexArticles].slice(0, 10),
    });
  } catch (error: any) {
    console.error('Science literature search error:', error);
    return res.status(500).json({ error: error.message || 'Literature search failed' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for Real-Time Live Voice Conversations (gemini-3.8-live)
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live Voice API WebSocket');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are the verbal Research Paper Intelligence copilot. You discuss scientific papers, methodologies, mathematical formulations, limitations, and potential synergies with Nobel-caliber clarity, intellectual warmth, and crisp verbal conciseness.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          try {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'audio', audio: audioData }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
            const textPart = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (textPart && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'text', text: textPart }));
            }
          } catch (sendErr) {
            console.error('Error forwarding live message:', sendErr);
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
        onerror: (err) => {
          console.error('Gemini Live error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: String(err) }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Gemini 3.8 Live session established' }));

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.type === 'audio' && payload.audio && session) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.type === 'text' && payload.text && session) {
          session.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [{ text: payload.text }],
              },
            ],
            turnComplete: true,
          });
        }
      } catch (err) {
        console.error('Error receiving live client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client closed Live Voice connection');
      try {
        if (session) session.close();
      } catch (e) {}
    });
  } catch (liveErr: any) {
    console.error('Failed to initiate Live API session:', liveErr);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'error', error: liveErr?.message || 'Could not connect to Gemini Live' }));
    }
  }
});

// Mount Vite middleware or static serving
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Research Paper Intelligence server running at http://0.0.0.0:${PORT}`);
});
