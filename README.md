# 🚀 ViralShorts AI - Paste Link, Get Viral Shorts

> **Automated YouTube to Viral 9:16 Vertical Shorts with AI Hook Detection, Hormozi Captions & 1-Click Auto-Posting.**

Inspired by **Opus.pro** and **Vizard.ai**, ViralShorts AI turns any long YouTube video into multiple viral-ready vertical shorts (1080x1920) with blurred background fill, dynamic animated karaoke subtitles, 2-second hook banners, and automated 1-click publishing across **TikTok**, **YouTube Shorts**, **Instagram Reels**, **Facebook Reels**, **LinkedIn**, and **Threads**.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Studio** | Standalone HTML5 / Canvas / Tailwind CSS / Vanilla JS | Zero-dependency browser studio that runs immediately in any web browser with 60FPS video canvas rendering & WebCodecs/MediaRecorder export. |
| **Next.js Frontend** | Next.js 14 (App Router) + Tailwind CSS + Lucide | Production React framework ready for deployment to Vercel. Located in `nextjs-frontend/`. |
| **Backend API** | Python FastAPI + Uvicorn | High-performance asynchronous API engine handling video downloads, transcription, and multi-platform publishing. Located in `backend/`. |
| **Video Engine** | FFmpeg + yt-dlp | 9:16 vertical crop (1080x1920), blurred background fill to avoid black bars, ASS subtitle burning. |
| **AI Transcription** | OpenAI Whisper (Word Timestamps) | Precise word-by-word timestamps for synced karaoke captions. |
| **Social Publishing** | Multi-Platform APIs | YouTube Data API v3, Meta Graph API (Instagram & Facebook Reels), TikTok Content Posting API v2, LinkedIn API, Threads API. |
| **Database & Auth** | Supabase / MongoDB + Google OAuth | User projects, generation history, and OAuth token storage. |

---

## 📂 Project Directory Structure

```
/sdcard/Download/viralshorts-ai/
├── index.html                 # Complete Opus.pro-style Dark UI Studio & Dashboard
├── style.css                  # Modern design system (Dark theme, stepper, social cards)
├── app.js                     # Canvas video engine, 5-stage stepper, Hormozi captions & publisher
├── README.md                  # Comprehensive documentation
├── backend/
│   ├── app.py                 # FastAPI backend (yt-dlp, Whisper, FFmpeg 9:16, Social publisher)
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Production container definition
│   └── docker-compose.yml     # 1-command Docker service orchestration
└── nextjs-frontend/           # Complete Next.js 14 App Router project
    ├── package.json           # Next.js dependencies
    ├── tsconfig.json          # TypeScript configuration
    ├── tailwind.config.js     # Tailwind design tokens
    ├── app/
    │   ├── layout.tsx         # Root layout with dark mode
    │   ├── page.tsx           # Full interactive Next.js page with Hero, Stepper, Dashboard & Modals
    │   └── globals.css        # Tailwind styling & animations
    └── lib/
        ├── api.ts             # API client connecting to FastAPI backend
        └── supabase.ts        # Supabase client and Google auth integration
```

---

## ⚡ Core Workflow

1. **User Pastes Link**:
   - Pastes any YouTube URL in the hero search box.
   - Selects **Duration** (`30s`, `45s`, `60s`).
   - Selects **Number of Shorts** (`1` to `5`).
   - Clicks **"Generate Shorts"**.

2. **5-Stage Progress Pipeline**:
   - `Downloading (yt-dlp)`: Extracts high-bitrate video stream and audio.
   - `Transcribing (Whisper)`: Generates word-by-word timestamps and cadence analysis.
   - `Finding Viral Moments`: Scans transcript for emotional peaks, controversy, hooks, and 30-60s sweet spots.
   - `Generating Captions`: Applies 9:16 center crop + blurred background fill + Hormozi animated subtitles with yellow keyword pop.
   - `Done`: Displays generated shorts deck in the dashboard.

3. **Dashboard Workspace**:
   - **Preview Player**: 9:16 phone mockup displaying the video with blurred background fill, a 2-second hook banner at the top, and synchronized Hormozi captions.
   - **AI Viral Titles**: 5 click-to-apply click-worthy titles per short.
   - **15 Trending Hashtags**: 1-click copy for high discoverability.
   - **Auto-Generated Description**: Ready for TikTok/Shorts SEO.
   - **Virality Score (0–100)**: Hook strength, pacing, and retention rating.

4. **1-Click "Post to All"**:
   - Connect social channels in the **"Connected Accounts"** modal:
     - **YouTube Shorts** (YouTube Data API v3)
     - **Instagram Reels** (Meta Graph API)
     - **Facebook Reels** (Meta Graph API)
     - **TikTok** (TikTok Content Posting API v2)
     - **LinkedIn** (LinkedIn Video API)
     - **Threads** (Meta Threads API)
   - Click **"Post to All"** to simultaneously publish with the selected title, hashtags, and description!

---

## 🚀 How to Run

### 1. Instant Browser Mode (Zero Setup Required)
Simply open [`index.html`](file:///sdcard/Download/viralshorts-ai/index.html) directly in Chrome, Brave, Edge, or Firefox:
```bash
cd /sdcard/Download/viralshorts-ai
python3 -m http.server 3000
```
Visit `http://localhost:3000` to use the application immediately. Test with instant preset links (Alex Hormozi, Steve Jobs, Joe Rogan, MrBeast).

### 2. Launching the Python FastAPI Backend
```bash
cd /sdcard/Download/viralshorts-ai/backend
pip install -r requirements.txt
python app.py
```
FastAPI server runs at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

### 3. Running the Next.js Frontend
```bash
cd /sdcard/Download/viralshorts-ai/nextjs-frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to run the Next.js version.
