‎AETHELGARD — Autonomous Research Intelligence Platform

‎<p align="center">
‎  <a href="#"><img src="https://img.shields.io/badge/Version-2.0.0-black?style=for-the-badge" /></a>
‎  <a href="#"><img src="https://img.shields.io/badge/Build-Passing-success?style=for-the-badge" /></a>
‎  <a href="#"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" /></a>
‎  <a href="#"><img src="https://img.shields.io/badge/SaaS-Enterprise%20Ready-purple?style=for-the-badge" /></a>
‎</p>
‎
‎<p align="center">
‎  <strong>Upload 10 papers. Get the synthesis of 10 PhDs in 60 seconds.</strong><br/>
‎  The first platform to offer Comparative Intelligence, Novelty Scoring, and Voice-Native Scholar Interaction in one vault.
‎</p>
‎
‎<p align="center">
‎  <a href="#-live-demo">Live Demo</a> •
‎  <a href="#-key-features">Features</a> •
‎  <a href="#-how-it-compares">Benchmark</a> •
‎  <a href="#-quick-start">Quick Start</a> •
‎  <a href="#-architecture">Architecture</a>
‎</p>
‎
‎---
‎
‎📑 Table of Contents
‎- [Overview](#-overview)
‎- [Problem & Solution](#-problem--solution)
‎- [Key Features](#-key-features)
‎- [How It Compares](#-how-it-compares)
‎- [How It Works](#-how-it-works)
‎- [Architecture](#-architecture)
‎- [Tech Stack](#-tech-stack)
‎- [Quick Start](#-quick-start)
‎- [Configuration](#-configuration)
‎- [Project Structure](#-project-structure)
‎- [Security & Privacy](#-security--privacy)
‎- [Roadmap](#-roadmap)
‎- [Contributing](#-contributing)
‎
‎---
‎
‎🔭 Overview
‎
‎**AETHELGARD** is not a PDF summarizer. It is an **Autonomous Research Intelligence Platform**.
‎
‎Traditional tools process papers in isolation. AETHELGARD introduces a **Research Intake & Vault** — a persistent, session-aware memory that allows you to upload 1 to 20+ scientific papers simultaneously and perform automated cross-document synthesis, contradiction detection, and novelty assessment.
‎
‎Built for researchers, R&D labs, and academic institutions who need to go from literature review to insight 10x faster.
‎
‎⚠️ Problem & Solution
‎
‎| The Old Way | The AETHELGARD Way |
‎| :--- | :--- |
‎| Read 10 papers one-by-one (20+ hours) | Upload 10 papers at once (20 seconds) |
‎| Manually note overlaps and contradictions | AI auto-generates Comparative Intelligence Report |
‎| No objective measure of a paper's contribution | Each paper gets a 0-100% Novelty Score |
‎| Static chat with one paper | Voice-native, hands-free interrogation of your entire vault |
‎| Figures ignored | Vision-based Figure Inspector extracts & explains charts |
‎
‎🚀 Key Features
‎
‎1. RESEARCH INTAKE & VAULT
‎Enterprise-grade document ingestion engine.
‎- **Batch Upload:** Drag & drop single or multiple PDFs with concurrent parsing.
‎- **Active Papers in Session:** Real-time session management with visual status (e.g., 3 papers active).
‎- **Persistent Vault:** Your papers stay indexed for the entire session with no data loss.
‎- **Supported Formats:** Native scientific PDFs including Nature, NeurIPS, CVPR formats.
‎
‎2. COMPARE PAPERS — Comparative Intelligence Engine
‎The core differentiator.
‎- **Cross-Document Synthesis:** Automatically generates a unified summary of all papers, highlighting shared methodologies, diverging results, and citation overlaps.
‎- **Novelty Assessment:** Proprietary scoring model that evaluates `99% Novelty`, `98% Novelty`, `97% Novelty` based on contribution, methodology, and dataset originality.
‎- **One-Click Comparison:** A dedicated `Compare Papers` action that creates a structured table: Problem | Method | Result | Limitation.
‎
‎3. LIVE VOICE SCHOLAR
‎The first voice-native research assistant.
‎- **Low-Latency PCM Streaming:** Real-time audio interaction without typing.
‎- **Investigating Mode:** Say "Investigate AlphaFold paper" and it starts deep-diving with audio feedback.
‎- **Context-Aware:** Voice understands which papers are in your vault. Ask: "What does the second paper say that contradicts the first?"
‎
‎4. VISION — Figure Inspector
‎- **Figure Extraction:** Automatically detects and crops figures, graphs, and tables from dense PDFs.
‎- **Visual Q&A:** Ask "Explain Figure 3" and get a detailed, publication-ready explanation.
‎- **Data Recovery:** Extracts underlying data from charts for replotting.
‎
‎5. ANALYTICS — Reading Velocity & Progress
‎- **Reading Progress:** Tracks `1 of 5 Sections Explored` with section-level granularity.
‎- **Velocity Metrics:** Measures reading speed, comprehension time, and focus areas.
‎- **Stats Dashboard:** Complete productivity analytics for research sessions.
‎
‎6. SCHOLAR CHAT & SEMANTIC SEARCH
‎- **Vault-Wide Chat:** Chat with all papers at once, not just one. Citations included.
‎- **Semantic Search:** Natural language search: "Show me papers using transformer in protein folding"
‎- **Google Workspace Connect:** One-click `Connect Google Workspace` for team vault sharing.
‎
‎7. ENTERPRISE UX
‎- Dark-mode, distraction-free scholarly UI.
‎- Multi-language support (English selector included).
‎- Mobile-responsive bottom navigation: Home, Search, Voice, Vision, Chat, Stats.
‎
‎---
‎
‎📊 How It Compares
‎
‎| Feature | AETHELGARD | SciSpace / Elicit | ChatPDF | Generic LLM |
‎| :--- | :--- | :--- | :--- | :--- |
‎| **Multi-PDF Batch Upload** | ✅ Up to 20+ Simultaneous | ❌ Single Only | ❌ Single Only | ❌ Manual |
‎| **Comparative Synthesis** | ✅ Native `Compare Papers` | ⚠️ Basic Comparison | ❌ No | ❌ No |
‎| **Novelty Scoring** | ✅ 0-100% Automated | ❌ No | ❌ No | ❌ No |
‎| **Voice-Native Interaction** | ✅ Live Voice Scholar | ❌ No | ❌ No | ❌ No |
‎| **Figure Inspector** | ✅ Vision Module | ⚠️ Limited | ❌ No | ❌ No |
‎| **Reading Analytics** | ✅ Velocity & Progress | ❌ No | ❌ No | ❌ No |
‎| **Workspace Integration** | ✅ Google Workspace | ❌ No | ❌ No | ❌ No |
‎| **Privacy** | ✅ Session Vault, No Training | ⚠️ Cloud Storage | ⚠️ Cloud Storage | ❌ Data used for training |
‎
‎⚙️ How It Works
‎
‎```mermaid
‎graph LR
‎A[PDF Drop Zone] --> B[Vault Indexer]
‎B --> C{Intelligence Layer}
‎C --> D[Novelty Scorer]
‎C --> E[Comparison Engine]
‎C --> F[Figure Extractor]
‎D & E & F --> G[Unified Knowledge Graph]
‎G --> H[Voice / Chat / Search / Vision API]
‎1. *Ingest:* PDFs are parsed, chunked, and embedded into a vector vault.
‎2. *Index:* Each paper gets metadata, authors, figures, and claims extracted.
‎3. *Synthesize:* The comparison engine builds a knowledge graph across papers.
‎4. *Score:* Novelty model scores each paper against the others in the vault.
‎5. *Interact:* User queries via Voice, Chat, Vision, or Search on top of the graph.
‎
‎🏗️ Architecture
‎
‎- *Frontend:* Component-driven React architecture with real-time state management.
‎- *Backend:* Stateless server `server.ts` for PDF processing and AI orchestration.
‎- *Storage:* Firebase for auth, session vault, and secure file handling.
‎- *AI Layer:* Multi-model orchestration for synthesis, vision, and low-latency voice.
‎- *Runtime:* Built for speed with Bun.
‎
‎💻 Tech Stack
‎Layer	Technology
‎**Framework**	React 18, TypeScript
‎**Styling**	Tailwind CSS, Framer Motion
‎**Runtime**	Bun, http://Node.js
‎**Backend & Auth**	Firebase, Firebase Auth
‎**Build**	Vite, `tsconfig.json`, `bun.lock`
‎**AI**	Vector Embeddings, LLM Orchestration, PCM Voice Streaming
‎🚀 Quick Start
‎
‎*1. Clone*
‎git clone https://github.com/jisan-nurine/AI-Research-Paper-Synthesizer.git
‎cd AI-Research-Paper-Synthesizer
‎*2. Install Dependencies*
‎bun install
‎or npm install / yarn install
‎*3. Environment Variables*
‎cp.env.example.env
‎Fill in your `.env`:
‎VITE_API_KEY=your_api_key_here
‎VITE_FIREBASE_API_KEY=...
‎VITE_FIREBASE_AUTH_DOMAIN=...
‎VITE_FIREBASE_PROJECT_ID=...
‎VITE_FIREBASE_STORAGE_BUCKET=...
‎*4. Run*
‎bun run dev
‎Open `http://localhost:5173`
‎
‎*5. Build for Production*
‎bun run build
‎bun start
‎📁 Project Structure
‎AI-Research-Paper-Synthesizer/
‎├── src/
‎│ ├── components/ # Home, Search, Voice, Vision, Chat, Stats modules
‎│ ├── lib/ # Firebase & AI clients
‎│ ├── hooks/ # Custom hooks
‎│ └── App.tsx # Main Application
‎├── public/
‎├──.env.example
‎├──.gitignore
‎├── bun.lock
‎├── firebase-applet-config.js
‎├── index.html
‎├── metadata.json
‎├── package.json
‎├── server.ts # PDF processing & AI server
‎└── tsconfig.json
‎🔒 Security & Privacy
‎
‎- *No Training on Your Data:* Papers in the vault are never used to train models.
‎- *Session-Based:* Active Papers exist only in your session. Auto-purge on logout.
‎- *Firebase Secure Rules:* Auth-gated vault access.
‎- *Client-Side Encryption Ready:* Architecture supports end-to-end encryption.
‎
‎🗺️ Roadmap
‎
‎- *V1.0 — Core Vault:* Multi-PDF Upload, Compare Papers, Novelty Score, Voice Scholar
‎- *V1.5 — Vision & Analytics:* Figure Inspector, Reading Velocity, Stats
‎- [ ] *V2.0 — Cloud Sync:* Permanent vault, User accounts, arXiv / DOI import
‎- [ ] *V2.5 — Collaboration:* Team workspaces, Shared annotations, Google Drive sync
‎- [ ] *V3.0 — Publication:* Auto-generate Literature Review, Export to LaTeX / Word / Notion, Citation graph[x]
‎
‎🤝 Contributing
‎
‎We are building the future of research. Contributions are highly welcome.
‎
‎1. Fork the Project
‎2. Create your Feature Branch (`git checkout -b feature/ResearchGraph`)
‎3. Commit your Changes (`git commit -m 'Add ResearchGraph'`)
‎4. Push to the Branch (`git push origin feature/ResearchGraph`)
‎5. Open a Pull Request
‎
‎📄 License
‎
‎Distributed under the MIT License. See `LICENSE` for more information.
‎
‎Contact
‎
‎*Jisan Nurine* — Full-Stack & AI Engineer
‎
‎GitHub: https://github.com/jisan-nurine
‎Project Link: https://github.com/jisan-nurine/AI-Research-Paper-Synthesizer
‎
‎---
‎<p align="center">
‎  <b>AETHELGARD</b> — From Papers to Intelligence. Instantly.
‎</p>
‎<p align="center">
‎  If you find this project useful, please ⭐ star the repository.
‎</p>
‎
‎
