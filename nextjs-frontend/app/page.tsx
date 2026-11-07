'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Youtube, Play, CheckCircle2, Share2, 
  Download, Copy, RefreshCw, Smartphone, Layers, Instagram, 
  Linkedin, MessageCircle, Sliders, Flame, Clock
} from 'lucide-react';

interface ShortClip {
  id: string;
  title: string;
  hook: string;
  score: number;
  duration: number;
  titles: string[];
  hashtags: string[];
  description: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState<30 | 45 | 60>(45);
  const [count, setCount] = useState<number>(3);
  
  // Pipeline stage: 'idle' | 'processing' | 'dashboard'
  const [stage, setStage] = useState<'idle' | 'processing' | 'dashboard'>('idle');
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Generated shorts
  const [shorts, setShorts] = useState<ShortClip[]>([]);
  const [activeShort, setActiveShort] = useState<ShortClip | null>(null);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState<number>(0);
  
  // Modals
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postingStatus, setPostingStatus] = useState<string>('');

  const sampleShorts: ShortClip[] = [
    {
      id: 'clip_1',
      title: 'Why 99% Of People Stay Broke',
      hook: 'Nobody talks about this, but you need to know...',
      score: 98,
      duration: 45,
      titles: [
        'Why 99% Of People Stay Broke 💸',
        'The Brutal Truth About Making Money Nobody Admits',
        'Alex Hormozi: Stop Making This Fatal Mistake',
        'How To Escape The 9-5 Trap Forever',
        'The Single Skill That Makes Millions 🚀'
      ],
      hashtags: [
        '#Shorts', '#Viral', '#AlexHormozi', '#MoneyMindset', '#Entrepreneurship',
        '#BusinessAdvice', '#WealthCreation', '#SuccessMindset', '#FinancialFreedom',
        '#SalesTips', '#SideHustle', '#HustleHard', '#MindsetShift', '#BillionaireMindset', '#SelfGrowth'
      ],
      description: 'Watch till the end! Alex Hormozi breaks down the exact reason why most people struggle to build real wealth.'
    },
    {
      id: 'clip_2',
      title: 'Motivation Is A Complete Trap',
      hook: 'Top performers do not wait to feel motivated...',
      score: 94,
      duration: 38,
      titles: [
        'Motivation Is A Scam ⚠️ (Do This Instead)',
        'Why High Performers Never Rely On Motivation',
        'How Discipline Destroys Motivation Every Single Time',
        'The Cold Brutal Truth About Consistency',
        'Alex Hormozi on Building Unstoppable Habits'
      ],
      hashtags: [
        '#Shorts', '#Motivation', '#Discipline', '#Mindset', '#SelfImprovement',
        '#HormoziQuotes', '#WorkEthic', '#Focus', '#Productivity', '#GymMotivation',
        '#NoExcuses', '#DailyHabits', '#MentalToughness', '#ViralMotivation', '#Inspire'
      ],
      description: 'Waiting to feel like doing the work? Discover why motivation keeps you broke and why discipline always wins.'
    }
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStage('processing');
    setCurrentStep(1);

    // Simulated 5-stage stepper
    setTimeout(() => setCurrentStep(2), 700);
    setTimeout(() => setCurrentStep(3), 1400);
    setTimeout(() => setCurrentStep(4), 2100);
    setTimeout(() => {
      setCurrentStep(5);
      setShorts(sampleShorts);
      setActiveShort(sampleShorts[0]);
      setStage('dashboard');
    }, 2800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 relative selection:bg-purple-500">
      {/* Background glow effects */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/10 bg-[#08090d]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStage('idle')}>
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight">ViralShorts <span className="text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded-md uppercase">AI</span></span>
              <p className="text-xs text-slate-400">Paste Link, Get Viral Shorts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSocialModal(true)}
              className="flex items-center gap-2 text-xs font-semibold bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl hover:bg-white/10 transition"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Connected Channels</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button className="flex items-center gap-2 text-xs font-semibold bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl hover:bg-white/15 transition">
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* =========================================================
            SECTION 1: HERO & INPUT BOX
            ========================================================= */}
        {stage === 'idle' && (
          <div className="max-w-3xl mx-auto text-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Turn 1 Long YouTube Video into 10 Viral Shorts
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
              Paste Link, <span className="gradient-text">Get Viral Shorts</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              AI detects high-retention hooks, converts to 9:16 vertical with blurred background fill, 
              burns Hormozi-style animated subtitles, and posts everywhere with 1 click.
            </p>

            {/* Input Card */}
            <div className="bg-[#12141f]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl text-left">
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="flex items-center bg-[#08090d] border border-white/10 rounded-xl p-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition">
                  <div className="pl-3 text-red-500">
                    <Youtube className="w-6 h-6" />
                  </div>
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste any YouTube video link (e.g. https://www.youtube.com/watch?v=...)" 
                    className="flex-1 bg-transparent border-none outline-none text-white px-3 py-2 text-sm md:text-base placeholder:text-slate-500"
                    required
                  />
                  <button 
                    type="submit"
                    className="gradient-brand text-white font-bold text-sm px-6 py-3 rounded-lg shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
                  >
                    Generate Shorts
                  </button>
                </div>

                {/* Configuration Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" /> Duration:
                    </span>
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 gap-1">
                      {[30, 45, 60].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d as any)}
                          className={`px-3 py-1 rounded-md font-bold transition ${duration === d ? 'bg-purple-600 text-white shadow-md' : 'hover:text-white'}`}
                        >
                          {d}s {d === 45 && '(Best)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" /> Count:
                    </span>
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 gap-1">
                      {[1, 2, 3, 4, 5].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCount(c)}
                          className={`px-2.5 py-1 rounded-md font-bold transition ${count === c ? 'bg-purple-600 text-white shadow-md' : 'hover:text-white'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>

              {/* Sample link buttons */}
              <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">Instant Demo Links:</span>
                <button 
                  onClick={() => setUrl('https://www.youtube.com/watch?v=100mleads_secret')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 transition"
                >
                  🔥 Hormozi $100M Leads
                </button>
                <button 
                  onClick={() => setUrl('https://www.youtube.com/watch?v=UF8uR6Z6KLc')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 transition"
                >
                  🍏 Steve Jobs Speech
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 2: PROCESSING STEPPER
            Downloading -> Transcribing -> Finding Viral Moments -> Generating Captions -> Done
            ========================================================= */}
        {stage === 'processing' && (
          <div className="max-w-2xl mx-auto my-12 bg-[#12141f]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Processing Your YouTube Video</h3>
            <p className="text-slate-400 text-sm mb-8">AI is downloading, extracting audio, and finding viral moments...</p>

            {/* Stepper nodes */}
            <div className="relative mb-8">
              <div className="absolute top-4 left-0 w-full h-1 bg-white/10 -z-0" />
              <div 
                className="absolute top-4 left-0 h-1 gradient-brand transition-all duration-500 -z-0"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />

              <div className="flex justify-between relative z-10 text-xs font-semibold">
                {[
                  '1. Downloading (yt-dlp)',
                  '2. Transcribing (Whisper)',
                  '3. Finding Viral Moments',
                  '4. Generating Captions',
                  '5. Done'
                ].map((label, idx) => (
                  <div key={label} className="flex flex-col items-center gap-2 max-w-[90px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                      currentStep > idx + 1 ? 'bg-emerald-500 text-black' : currentStep === idx + 1 ? 'bg-purple-600 text-white ring-4 ring-purple-500/20' : 'bg-[#181b29] text-slate-500 border border-white/10'
                    }`}>
                      {currentStep > idx + 1 ? '✓' : idx + 1}
                    </div>
                    <span className={currentStep === idx + 1 ? 'text-white' : 'text-slate-500'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 3: GENERATED SHORTS DASHBOARD
            ========================================================= */}
        {stage === 'dashboard' && activeShort && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#12141f]/70 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">✓ Processing Complete</span>
                <h2 className="text-lg font-bold">{shorts.length} Viral Shorts Generated (1080x1920 Vertical)</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStage('idle')}
                  className="text-xs font-semibold px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition"
                >
                  New Video
                </button>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="gradient-brand text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition"
                >
                  Post to All Platforms
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Clips List */}
              <div className="lg:col-span-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Generated Clips</h4>
                {shorts.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => setActiveShort(s)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      activeShort.id === s.id ? 'bg-purple-600/10 border-purple-500 shadow-lg shadow-purple-500/10' : 'bg-[#12141f]/50 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h5 className="font-bold text-sm leading-snug">{s.title}</h5>
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-2 py-0.5 rounded-md">
                        ★ {s.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">Hook: "{s.hook}"</p>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.duration}s • 9:16 Center Crop
                    </span>
                  </div>
                ))}
              </div>

              {/* Center Column: Phone Player Preview */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-[300px] h-[533px] bg-black rounded-[36px] border-4 border-slate-800 relative overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col justify-between p-4">
                  
                  {/* Top 2-second hook title overlay */}
                  <div className="bg-rose-600 text-white font-black text-center text-xs py-2 px-3 rounded-lg shadow-lg uppercase tracking-wide">
                    {activeShort.titles[selectedTitleIdx]}
                  </div>

                  {/* Centered video illustration with blurred background */}
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-purple-600/30 border-2 border-purple-400/50 flex items-center justify-center mx-auto">
                      <Flame className="w-10 h-10 text-yellow-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">9:16 Center Crop + Blurred Fill</span>
                  </div>

                  {/* Hormozi Subtitles Word-by-Word Preview */}
                  <div className="text-center pb-8">
                    <p className="text-xl font-black uppercase text-white drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
                      THE <span className="text-yellow-400 underline decoration-yellow-400 decoration-4">SECRET</span> TO WEALTH
                    </p>
                  </div>
                </div>

                <div className="w-[300px] mt-4 flex gap-2">
                  <button 
                    onClick={() => alert("Downloading 1080x1920 MP4 video...")}
                    className="flex-1 gradient-brand text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download 9:16
                  </button>
                  <button 
                    onClick={() => setShowPostModal(true)}
                    className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" /> Post All
                  </button>
                </div>
              </div>

              {/* Right Column: AI Metadata (5 Titles, 15 Hashtags, Description) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 5 AI Titles */}
                <div className="bg-[#12141f]/70 border border-white/10 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold uppercase text-slate-400">5 Viral Titles (Click to Apply)</span>
                    <button onClick={() => handleCopy(activeShort.titles[selectedTitleIdx])} className="text-xs text-purple-400 flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {activeShort.titles.map((t, idx) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTitleIdx(idx)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition ${
                          selectedTitleIdx === idx ? 'bg-purple-600/20 border border-purple-500 text-white' : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {idx + 1}. {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 15 Hashtags */}
                <div className="bg-[#12141f]/70 border border-white/10 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold uppercase text-slate-400">15 Trending Hashtags</span>
                    <button onClick={() => handleCopy(activeShort.hashtags.join(' '))} className="text-xs text-purple-400 flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeShort.hashtags.map((h) => (
                      <span key={h} className="text-[11px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md font-semibold">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-[#12141f]/70 border border-white/10 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold uppercase text-slate-400">Auto Description</span>
                    <button onClick={() => handleCopy(activeShort.description)} className="text-xs text-purple-400 flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <textarea 
                    value={activeShort.description}
                    readOnly
                    rows={3}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-xs text-slate-300 resize-none outline-none"
                  />
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Social Accounts Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141f] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-base">Connected Social Platforms</h3>
              <button onClick={() => setShowSocialModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-2.5 text-xs">
              {[
                { name: 'YouTube Shorts', api: 'YouTube Data API v3', connected: true },
                { name: 'Instagram Reels', api: 'Meta Graph API', connected: true },
                { name: 'TikTok', api: 'TikTok Content Posting API', connected: true },
                { name: 'Facebook Reels', api: 'Meta Graph API', connected: false },
                { name: 'LinkedIn', api: 'LinkedIn Video API', connected: false },
                { name: 'Threads', api: 'Meta Threads API', connected: false }
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <h5 className="font-bold">{p.name}</h5>
                    <span className="text-slate-500 text-[10px]">{p.api}</span>
                  </div>
                  <button className={`px-3 py-1 rounded-lg font-bold transition ${p.connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-purple-600 text-white'}`}>
                    {p.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Post to All Modal */}
      {showPostModal && activeShort && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141f] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center mx-auto text-white">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Publish to All Connected Channels</h3>
            <p className="text-xs text-slate-400">
              Posting "{activeShort.titles[selectedTitleIdx]}" to YouTube Shorts, Instagram Reels & TikTok simultaneously.
            </p>

            {postingStatus ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold">
                {postingStatus}
              </div>
            ) : (
              <div className="flex gap-2 justify-center pt-2">
                <button onClick={() => setShowPostModal(false)} className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setPostingStatus('Publishing stream to 3 platforms...');
                    setTimeout(() => {
                      setPostingStatus('✓ Successfully Posted to All Channels!');
                      setTimeout(() => {
                        setShowPostModal(false);
                        setPostingStatus('');
                      }, 1200);
                    }, 1200);
                  }}
                  className="gradient-brand px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-purple-500/20"
                >
                  Confirm & Post
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
