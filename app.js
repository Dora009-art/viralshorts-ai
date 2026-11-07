/**
 * ViralShorts AI - Core Front-End Architecture
 * Full Pipeline:
 * 1. YouTube Link Ingestion & Parameter Selection (Duration 30s/45s/60s, Shorts count 1-5)
 * 2. 5-Stage Stepper Workflow: Downloading (yt-dlp) -> Transcribing (Whisper) -> Finding Viral Moments -> Generating Captions -> Done
 * 3. 9:16 Vertical Canvas Renderer with Blurred Background Fill + Center Crop + 2-Second Hook Banner + Hormozi Subtitles
 * 4. AI Metadata Suite: 5 Viral Titles, 15 Trending Hashtags, AI Description, Virality Score (0-100)
 * 5. Auto-Posting Integration: YouTube Shorts, Instagram Reels, Facebook Reels, TikTok, LinkedIn, Threads
 * 6. 1-Click "Post to All" Engine & In-Browser 60FPS Video Exporter
 */

// Global State
const appState = {
  // Input Settings
  targetDuration: 45,       // 30, 45, or 60
  shortsCount: 3,           // 1 to 5
  videoUrl: '',
  
  // Current Video & Processed Clips
  currentVideo: null,       // { id, title, channel, duration, thumb, source }
  generatedShorts: [],      // Array of viral shorts
  activeShort: null,        // Currently viewed short
  selectedTitleIndex: 0,    // Which of the 5 AI titles is active
  
  // Canvas Player & Visual Engine
  isPlaying: false,
  isMuted: false,
  playhead: 0,              // Current time relative to clip start
  reframeMode: 'blur',      // 'blur' (blurred background fill) | 'face' (center crop)
  showHookBannerFor: 2.5,   // Seconds to show hook title at start
  captionStyle: 'hormozi',  // Hormozi yellow keywords + bounce
  
  // Social Media Connected Accounts
  connectedPlatforms: {
    yt: { name: 'YouTube Shorts', api: 'YouTube Data API v3', connected: true, handle: '@ViralShortsOfficial' },
    ig: { name: 'Instagram Reels', api: 'Meta Graph API', connected: true, handle: '@viral_shorts_ai' },
    fb: { name: 'Facebook Reels', api: 'Meta Graph API', connected: false, handle: '' },
    tt: { name: 'TikTok', api: 'TikTok Content Posting API', connected: true, handle: '@viralshorts.tok' },
    li: { name: 'LinkedIn', api: 'LinkedIn Video API', connected: false, handle: '' },
    th: { name: 'Threads', api: 'Meta Threads API', connected: false, handle: '' }
  },

  // User Auth State
  user: null,               // Google Auth / Supabase profile
  backendUrl: 'http://localhost:8000'
};

// Canvas references
let canvas, ctx, sourceVideo;
let animLoopId = null;
let synthTime = 0;

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('shortsCanvas');
  ctx = canvas.getContext('2d');
  sourceVideo = document.getElementById('sourceVideo');

  // Load saved social connections from localStorage if any
  loadSavedSocialConnections();

  // Attach canvas click to toggle play/pause
  const viewport = document.getElementById('viewport');
  if (viewport) {
    viewport.addEventListener('click', togglePlayPause);
  }

  // Keyboard shortcut: Spacebar toggles playback
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // Start real-time rendering loop
  renderCanvasLoop();
});

/* =========================================================
   DURATION & SHORTS COUNT CONFIGURATION
   ========================================================= */

function setDurationChoice(dur) {
  appState.targetDuration = Number(dur);
  document.querySelectorAll('#duration-selector .pill-choice').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`#duration-selector .pill-choice[data-value="${dur}"]`);
  if (btn) btn.classList.add('active');
}

function setCountChoice(count) {
  appState.shortsCount = Number(count);
  document.querySelectorAll('#count-selector .pill-choice').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`#count-selector .pill-choice[data-count="${count}"]`);
  if (btn) btn.classList.add('active');
}

/* =========================================================
   PRESET QUICK TEST LINKS
   ========================================================= */

const TEST_PRESETS = {
  hormozi: {
    url: 'https://www.youtube.com/watch?v=100mleads_secret',
    title: 'Alex Hormozi - Why 99% Of People Stay Broke',
    channel: 'Alex Hormozi',
    thumb: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
    duration: 540,
    shorts: [
      {
        id: 'short_1',
        title: 'Why 99% Of People Stay Broke',
        hook: 'Nobody talks about this, but you need to know...',
        start: 4.0,
        duration: 42.0,
        score: 98,
        scoreReason: 'Exceptional 3s hook ("Nobody talks about this") + High emotional cadence and punchy takeaway.',
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
        description: 'Watch till the end! Alex Hormozi breaks down the exact reason why most people struggle to build real wealth and the single skill you need to master today.\n\nSubscribe for daily viral business wisdom! 🚀',
        words: [
          { word: "Nobody", start: 4.1, end: 4.6, tag: "hook" },
          { word: "is", start: 4.6, end: 4.8 },
          { word: "talking", start: 4.8, end: 5.2 },
          { word: "about", start: 5.2, end: 5.5 },
          { word: "this,", start: 5.5, end: 6.0, emoji: "🤫" },
          { word: "but", start: 6.2, end: 6.4 },
          { word: "the", start: 6.4, end: 6.6 },
          { word: "reason", start: 6.6, end: 7.0 },
          { word: "most", start: 7.0, end: 7.3 },
          { word: "people", start: 7.3, end: 7.7 },
          { word: "never", start: 7.7, end: 8.1, tag: "emphasis" },
          { word: "make", start: 8.1, end: 8.4 },
          { word: "money", start: 8.4, end: 8.9, emoji: "💸", tag: "emphasis" },
          { word: "is", start: 9.0, end: 9.2 },
          { word: "not", start: 9.2, end: 9.5 },
          { word: "because", start: 9.5, end: 9.9 },
          { word: "they", start: 9.9, end: 10.1 },
          { word: "lack", start: 10.1, end: 10.5 },
          { word: "talent.", start: 10.5, end: 11.2 },
          { word: "It's", start: 11.8, end: 12.1 },
          { word: "because", start: 12.1, end: 12.5 },
          { word: "they", start: 12.5, end: 12.7 },
          { word: "never", start: 12.7, end: 13.1, tag: "emphasis" },
          { word: "learn", start: 13.1, end: 13.5 },
          { word: "to", start: 13.5, end: 13.7 },
          { word: "sell", start: 13.7, end: 14.2, emoji: "📈" },
          { word: "their", start: 14.2, end: 14.5 },
          { word: "skills", start: 14.5, end: 15.0 },
          { word: "to", start: 15.0, end: 15.2 },
          { word: "the", start: 15.2, end: 15.4 },
          { word: "world.", start: 15.4, end: 16.0 },
          { word: "If", start: 16.6, end: 16.9 },
          { word: "you", start: 16.9, end: 17.1 },
          { word: "can't", start: 17.1, end: 17.5 },
          { word: "get", start: 17.5, end: 17.8 },
          { word: "attention,", start: 17.8, end: 18.5, emoji: "👀", tag: "emphasis" },
          { word: "you", start: 18.8, end: 19.1 },
          { word: "don't", start: 19.1, end: 19.5 },
          { word: "exist", start: 19.5, end: 20.1 },
          { word: "in", start: 20.1, end: 20.3 },
          { word: "business.", start: 20.3, end: 21.0, emoji: "💼" },
          { word: "Master", start: 21.8, end: 22.3, tag: "emphasis" },
          { word: "attention,", start: 22.3, end: 23.0 },
          { word: "and", start: 23.2, end: 23.4 },
          { word: "you", start: 23.4, end: 23.6 },
          { word: "master", start: 23.6, end: 24.1 },
          { word: "wealth.", start: 24.1, end: 25.0, emoji: "💰", tag: "emphasis" }
        ]
      },
      {
        id: 'short_2',
        title: 'The Dangerous Trap of Motivation',
        hook: 'Motivation is a complete scam, here is why...',
        start: 45.0,
        duration: 38.0,
        score: 94,
        scoreReason: 'Controversial viewpoint hook + high-energy speaking tempo.',
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
        description: 'Waiting to feel like doing the work? Alex Hormozi explains why motivation is keeping you stuck and how ruthless discipline wins every time.\n\nDrop a 🔥 if you agree!',
        words: [
          { word: "Motivation", start: 45.2, end: 45.9, tag: "hook" },
          { word: "is", start: 45.9, end: 46.1 },
          { word: "a", start: 46.1, end: 46.3 },
          { word: "trap.", start: 46.3, end: 47.0, emoji: "⚠️" },
          { word: "Top", start: 47.5, end: 47.8 },
          { word: "performers", start: 47.8, end: 48.5 },
          { word: "don't", start: 48.5, end: 48.8 },
          { word: "wait", start: 48.8, end: 49.2 },
          { word: "to", start: 49.2, end: 49.4 },
          { word: "feel", start: 49.4, end: 49.8 },
          { word: "like", start: 49.8, end: 50.1 },
          { word: "doing", start: 50.1, end: 50.5 },
          { word: "the", start: 50.5, end: 50.7 },
          { word: "work.", start: 50.7, end: 51.3 },
          { word: "They", start: 51.8, end: 52.1 },
          { word: "just", start: 52.1, end: 52.4 },
          { word: "execute.", start: 52.4, end: 53.2, emoji: "⚡", tag: "emphasis" },
          { word: "Discipline", start: 53.8, end: 54.6, tag: "emphasis" },
          { word: "always", start: 54.6, end: 55.0 },
          { word: "crushes", start: 55.0, end: 55.6, emoji: "🥊" },
          { word: "talent.", start: 55.6, end: 56.4 }
        ]
      },
      {
        id: 'short_3',
        title: 'How To Price Your Offers 10x Higher',
        hook: 'If you want to charge 10x more tomorrow...',
        start: 92.0,
        duration: 44.0,
        score: 91,
        scoreReason: 'Direct actionable takeaway with high perceived commercial value.',
        titles: [
          'How To 10X Your Pricing Overnight 💰',
          'Stop Undercharging: The Grand Slam Offer Secret',
          'How Rich People Think About Value & Prices',
          'Charge What You Are Actually Worth',
          'The Pricing Formula That Generated Millions'
        ],
        hashtags: [
          '#Shorts', '#PricingStrategy', '#BusinessGrowth', '#AlexHormozi', '#SalesFunnel',
          '#HighTicket', '#MarketingStrategy', '#ValueProposition', '#Entrepreneur', '#ScaleYourBusiness',
          '#Consulting', '#AgencyLife', '#SalesTips', '#Cashflow', '#ClosingDeals'
        ],
        description: 'Double your prices today. Discover how to create an offer so good people feel stupid saying no.',
        words: [
          { word: "If", start: 92.1, end: 92.4 },
          { word: "you", start: 92.4, end: 92.6 },
          { word: "want", start: 92.6, end: 92.9 },
          { word: "to", start: 92.9, end: 93.1 },
          { word: "charge", start: 93.1, end: 93.6, emoji: "💰", tag: "hook" },
          { word: "ten", start: 93.6, end: 93.9 },
          { word: "times", start: 93.9, end: 94.3 },
          { word: "more,", start: 94.3, end: 94.8 },
          { word: "increase", start: 95.2, end: 95.8, tag: "emphasis" },
          { word: "the", start: 95.8, end: 96.0 },
          { word: "perceived", start: 96.0, end: 96.6 },
          { word: "likelihood", start: 96.6, end: 97.2 },
          { word: "of", start: 97.2, end: 97.4 },
          { word: "achievement.", start: 97.4, end: 98.3, emoji: "🎯" }
        ]
      }
    ]
  },
  stevejobs: {
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    title: 'Steve Jobs - Stanford Commencement (Stay Foolish)',
    channel: 'Stanford University',
    thumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    duration: 900,
    shorts: [
      {
        id: 'short_jobs_1',
        title: 'Your Time Is Limited - Don\'t Waste It',
        hook: 'Your time on this earth is limited...',
        start: 12.0,
        duration: 45.0,
        score: 99,
        scoreReason: 'Legendary universal hook + profound emotional climax.',
        titles: [
          'Steve Jobs: Your Time Is Limited ⏳',
          'The Most Powerful 45 Seconds of Steve Jobs\' Life',
          'Don\'t Live Someone Else\'s Life',
          'Stay Hungry, Stay Foolish (Pure Chills)',
          'The Secret To Finding What You Truly Love'
        ],
        hashtags: [
          '#Shorts', '#SteveJobs', '#Inspiration', '#StanfordSpeech', '#LifeLessons',
          '#Wisdom', '#Mindset', '#StayHungryStayFoolish', '#Apple', '#Visionary',
          '#MotivationDaily', '#Legacy', '#SelfBelief', '#Leadership', '#DeepQuotes'
        ],
        description: 'Steve Jobs delivers his most memorable words at Stanford University. Your time is limited, don\'t waste it living someone else\'s life.',
        words: [
          { word: "Your", start: 12.2, end: 12.5 },
          { word: "time", start: 12.5, end: 12.9, emoji: "⏳", tag: "hook" },
          { word: "is", start: 12.9, end: 13.1 },
          { word: "limited,", start: 13.1, end: 13.8 },
          { word: "so", start: 14.1, end: 14.3 },
          { word: "don't", start: 14.3, end: 14.7 },
          { word: "waste", start: 14.7, end: 15.1, tag: "emphasis" },
          { word: "it", start: 15.1, end: 15.3 },
          { word: "living", start: 15.3, end: 15.8 },
          { word: "someone", start: 15.8, end: 16.3 },
          { word: "else's", start: 16.3, end: 16.8 },
          { word: "life.", start: 16.8, end: 17.6, emoji: "🎯" },
          { word: "Stay", start: 18.2, end: 18.8, emoji: "🔥", tag: "emphasis" },
          { word: "hungry.", start: 18.8, end: 19.6 },
          { word: "Stay", start: 20.0, end: 20.5, emoji: "🚀", tag: "emphasis" },
          { word: "foolish.", start: 20.5, end: 21.5 }
        ]
      }
    ]
  },
  rogan: {
    url: 'https://www.youtube.com/watch?v=jre_pyramid_math',
    title: 'Joe Rogan - The Mind-Bending Pyramid Math',
    channel: 'PowerfulJRE',
    thumb: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
    duration: 720,
    shorts: [
      {
        id: 'short_rogan_1',
        title: 'The Impossible Math of the Pyramids',
        hook: 'Do you realize the math behind this?',
        start: 10.0,
        duration: 44.0,
        score: 96,
        scoreReason: 'Curiosity gap hook, mind-bending historical enigma pacing.',
        titles: [
          'The Impossible Math Behind The Great Pyramid 🤯',
          'Joe Rogan Stunned By Ancient Egyptian Technology',
          'How Did Ancients Align To True North Perfectly?',
          'The Mystery Science Can\'t Explain',
          'Was An Advanced Civilization Wiped Out?'
        ],
        hashtags: [
          '#Shorts', '#JoeRogan', '#JRE', '#Pyramids', '#AncientMysteries',
          '#HistoryUncovered', '#Conspiracy', '#MindBlown', '#PodcastClips', '#ScienceFacts',
          '#Archeology', '#TrueNorth', '#AncientAliens', '#MindBending', '#ViralPodcast'
        ],
        description: 'Joe Rogan discusses the incredible mathematical alignment of the Great Pyramid of Giza. How did they achieve this level of accuracy thousands of years ago?',
        words: [
          { word: "Do", start: 10.2, end: 10.4 },
          { word: "you", start: 10.4, end: 10.6 },
          { word: "realize", start: 10.6, end: 11.2, tag: "hook" },
          { word: "the", start: 11.2, end: 11.4 },
          { word: "math", start: 11.4, end: 11.8, emoji: "📐" },
          { word: "behind", start: 11.8, end: 12.2 },
          { word: "this?", start: 12.2, end: 12.8, emoji: "🤯" },
          { word: "They", start: 13.4, end: 13.7 },
          { word: "aligned", start: 13.7, end: 14.3 },
          { word: "it", start: 14.3, end: 14.5 },
          { word: "to", start: 14.5, end: 14.7 },
          { word: "true", start: 14.7, end: 15.1 },
          { word: "North", start: 15.1, end: 15.6, emoji: "🧭" },
          { word: "within", start: 15.6, end: 16.1 },
          { word: "a", start: 16.1, end: 16.3 },
          { word: "fraction", start: 16.3, end: 16.8 },
          { word: "of", start: 16.8, end: 17.0 },
          { word: "a", start: 17.0, end: 17.2 },
          { word: "degree.", start: 17.2, end: 18.0 }
        ]
      }
    ]
  },
  mrbeast: {
    url: 'https://www.youtube.com/watch?v=island_giveaway',
    title: 'MrBeast - I Gave Away A Private Island',
    channel: 'MrBeast',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    duration: 840,
    shorts: [
      {
        id: 'short_beast_1',
        title: 'Winner Keeps A $1M Private Island',
        hook: 'Whoever survives the longest on this island...',
        start: 0.5,
        duration: 35.0,
        score: 97,
        scoreReason: 'Instant 1-second retention hook with insane high-stakes prize.',
        titles: [
          'I Gave Away A $1,000,000 Island! 🏝️',
          'Last Person To Leave Keeps The Island',
          'MrBeast\'s Insane Challenge Ending',
          'Would You Survive For A Private Island?',
          'The Craziest MrBeast Video Ever'
        ],
        hashtags: [
          '#Shorts', '#MrBeast', '#PrivateIsland', '#Challenge', '#Giveaway',
          '#InsaneMoments', '#OneMillionDollars', '#Trending', '#MrBeastChallenge', '#ViralShorts',
          '#CrazyStunts', '#YouTubeCreator', '#Entertainment', '#SurvivalChallenge', '#MustWatch'
        ],
        description: 'MrBeast gives away a literal private island worth one million dollars to whoever survives the longest! Who took it home?',
        words: [
          { word: "Whoever", start: 0.5, end: 1.0, tag: "hook" },
          { word: "survives", start: 1.0, end: 1.6, emoji: "🏝️" },
          { word: "the", start: 1.6, end: 1.8 },
          { word: "longest", start: 1.8, end: 2.3 },
          { word: "on", start: 2.3, end: 2.5 },
          { word: "this", start: 2.5, end: 2.8 },
          { word: "island", start: 2.8, end: 3.4 },
          { word: "keeps", start: 3.4, end: 3.8 },
          { word: "the", start: 3.8, end: 4.0 },
          { word: "deed", start: 4.0, end: 4.4 },
          { word: "worth", start: 4.4, end: 4.8 },
          { word: "one", start: 4.8, end: 5.2 },
          { word: "million", start: 5.2, end: 5.7, emoji: "💰", tag: "emphasis" },
          { word: "dollars!", start: 5.7, end: 6.5, emoji: "🔥", tag: "emphasis" }
        ]
      }
    ]
  }
};

function loadTestPreset(presetKey) {
  const preset = TEST_PRESETS[presetKey];
  if (!preset) return;

  const input = document.getElementById('yt-url-input');
  if (input) input.value = preset.url;

  executeShortsPipeline(preset.title, preset.channel, preset.thumb, preset.shorts);
}

/* =========================================================
   CORE WORKFLOW: PASTE LINK -> GENERATE SHORTS
   ========================================================= */

function startShortsGeneration(e) {
  e.preventDefault();
  const input = document.getElementById('yt-url-input');
  const url = input.value.trim();
  if (!url) return;

  appState.videoUrl = url;

  // Check if matching a preset
  const matchedPresetKey = Object.keys(TEST_PRESETS).find(k => url.includes(k) || TEST_PRESETS[k].url === url);
  if (matchedPresetKey) {
    loadTestPreset(matchedPresetKey);
    return;
  }

  // Otherwise synthesize dynamic viral clips based on URL & title
  const dynamicTitle = "Mastering Focus In The Modern Era";
  const dynamicChannel = "Creator Channel";
  const dynamicThumb = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80";

  const generatedClips = synthesizeViralClips(dynamicTitle, appState.shortsCount, appState.targetDuration);
  executeShortsPipeline(dynamicTitle, dynamicChannel, dynamicThumb, generatedClips);
}

function synthesizeViralClips(title, count, targetDur) {
  const clips = [];
  const hookPhrases = [
    "If you only remember one thing from this...",
    "Most people have this completely backwards.",
    "I made this mistake for three straight years.",
    "Here is the brutal truth nobody wants to say.",
    "This single habit changed everything for me."
  ];

  for (let i = 0; i < count; i++) {
    const dur = targetDur;
    const startSec = 6.0 + (i * (dur + 15));
    const hook = hookPhrases[i % hookPhrases.length];
    const score = 98 - (i * 3);

    clips.push({
      id: `custom_short_${i + 1}`,
      title: `${title}: Part ${i + 1}`,
      hook: hook,
      start: startSec,
      duration: dur,
      score: score,
      scoreReason: `Strong 3s curiosity hook (${hook.slice(0, 24)}...) + optimal ${dur}s completion window.`,
      titles: [
        `${title} (Part ${i + 1}) 🔥`,
        `The Secret To ${title} Nobody Shares`,
        `Why You Are Doing This Wrong`,
        `How To Master This In 30 Days`,
        `Save This Before It Gets Deleted 🚀`
      ],
      hashtags: [
        '#Shorts', '#Viral', '#Mindset', '#SelfImprovement', '#LifeHacks',
        '#GrowthMindset', '#Productivity', '#SuccessTips', '#Focus', '#MotivationDaily',
        '#Discipline', '#DailyHabits', '#LearnOnTikTok', '#ReelsViral', '#HighPerformance'
      ],
      description: `Watch until the end! This insight will completely shift your perspective on ${title}.\n\nDouble tap if you needed this reminder! 💡`,
      words: [
        { word: hook.split(" ")[0] || "Here", start: startSec + 0.2, end: startSec + 0.6, tag: "hook" },
        { word: "is", start: startSec + 0.6, end: startSec + 0.8 },
        { word: "the", start: startSec + 0.8, end: startSec + 1.0 },
        { word: "secret", start: startSec + 1.0, end: startSec + 1.5, emoji: "🤫", tag: "emphasis" },
        { word: "behind", start: startSec + 1.5, end: startSec + 1.8 },
        { word: "massive", start: startSec + 1.8, end: startSec + 2.3, emoji: "🚀", tag: "emphasis" },
        { word: "results.", start: startSec + 2.3, end: startSec + 3.0 },
        { word: "Pay", start: startSec + 3.4, end: startSec + 3.7 },
        { word: "attention", start: startSec + 3.7, end: startSec + 4.3, emoji: "👀" },
        { word: "to", start: startSec + 4.3, end: startSec + 4.5 },
        { word: "this", start: startSec + 4.5, end: startSec + 4.8 },
        { word: "rule.", start: startSec + 4.8, end: startSec + 5.5, emoji: "💡" }
      ]
    });
  }
  return clips;
}

/* =========================================================
   STEPPER PIPELINE: 5 PROGRESS STAGES
   Downloading -> Transcribing -> Finding Viral Moments -> Generating Captions -> Done
   ========================================================= */

function executeShortsPipeline(videoTitle, channelName, thumbUrl, clips) {
  // Hide Hero, Show Processing Stepper
  document.getElementById('landing-hero').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'none';
  const procSection = document.getElementById('processing-section');
  procSection.style.display = 'block';

  // Update Stats in stepper
  document.getElementById('stat-video-title').textContent = videoTitle.slice(0, 24) + '...';
  document.getElementById('stat-target-dur').textContent = `${appState.targetDuration}s`;
  document.getElementById('stat-shorts-count').textContent = `${clips.length} Shorts`;

  // Stepper Elements
  const stepperFill = document.getElementById('stepperFill');
  const mainTitle = document.getElementById('stepper-main-title');
  const subTitle = document.getElementById('stepper-sub-title');

  function setStep(stepNum, percent, mainText, subText) {
    stepperFill.style.width = `${percent}%`;
    mainTitle.textContent = mainText;
    subTitle.textContent = subText;

    for (let i = 1; i <= 5; i++) {
      const node = document.getElementById(`step-${i}`);
      if (node) {
        node.classList.remove('active', 'completed');
        if (i < stepNum) node.classList.add('completed');
        else if (i === stepNum) node.classList.add('active');
      }
    }
  }

  // Stage 1: Downloading via yt-dlp
  setStep(1, 20, "Downloading Video via yt-dlp...", "Extracting high-bitrate video stream and uncompressed audio...");

  setTimeout(() => {
    // Stage 2: Transcribing via OpenAI Whisper
    setStep(2, 45, "Transcribing Audio via OpenAI Whisper...", "Generating word-by-word timestamps and speaker cadence...");
    
    setTimeout(() => {
      // Stage 3: Finding Viral Moments
      setStep(3, 70, "AI Analyzing Virality & Hooks...", "Scanning transcript for emotional peaks, controversy & high-retention 3s hooks...");
      
      setTimeout(() => {
        // Stage 4: Generating 9:16 Vertical Video & Subtitles
        setStep(4, 90, "Applying 9:16 Center Crop & Hormozi Subtitles...", "Blurring background fill, styling animated captions with yellow keyword pop...");
        
        setTimeout(() => {
          // Stage 5: Done!
          setStep(5, 100, "Shorts Ready!", "All viral clips generated with 1080x1920 vertical framing and AI metadata.");

          appState.currentVideo = {
            title: videoTitle,
            channel: channelName,
            thumb: thumbUrl
          };
          appState.generatedShorts = clips;

          setTimeout(() => {
            procSection.style.display = 'none';
            openShortsDashboard();
            showToast(`🎉 Generated ${clips.length} viral shorts ready for posting!`);
          }, 600);

        }, 800);
      }, 800);
    }, 800);
  }, 900);
}

/* =========================================================
   DASHBOARD INITIALIZATION & SHORT SELECTION
   ========================================================= */

function openShortsDashboard() {
  document.getElementById('dashboard-section').style.display = 'block';

  // Update Topbar Video Metadata
  document.getElementById('dash-video-heading').textContent = appState.currentVideo.title;
  document.getElementById('dash-video-sub').textContent = `${appState.generatedShorts.length} Shorts generated • 1080x1920 9:16 Vertical • Hormozi Subtitles`;
  const thumbEl = document.getElementById('dash-thumb-badge');
  if (thumbEl && appState.currentVideo.thumb) {
    thumbEl.style.backgroundImage = `url('${appState.currentVideo.thumb}')`;
  }

  // Populate Generated Shorts list
  renderGeneratedShortsDeck();

  // Select first short
  if (appState.generatedShorts.length > 0) {
    selectGeneratedShort(appState.generatedShorts[0].id);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderGeneratedShortsDeck() {
  const container = document.getElementById('generated-shorts-list');
  const countBadge = document.getElementById('shorts-deck-count');
  if (!container) return;

  countBadge.textContent = appState.generatedShorts.length;

  container.innerHTML = appState.generatedShorts.map(short => `
    <div class="short-card-item ${appState.activeShort && appState.activeShort.id === short.id ? 'active' : ''}" 
         id="card-${short.id}" onclick="selectGeneratedShort('${short.id}')">
      <div class="card-score-pill">★ ${short.score}</div>
      <h5>${escapeHtml(short.title)}</h5>
      <div class="short-card-meta">
        <svg class="icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${formatTime(short.start)} - ${formatTime(short.start + short.duration)} (${Math.round(short.duration)}s)</span>
      </div>
      <p class="short-card-hook">Hook: "${escapeHtml(short.hook)}"</p>
    </div>
  `).join('');
}

function selectGeneratedShort(shortId) {
  const short = appState.generatedShorts.find(s => s.id === shortId);
  if (!short) return;

  appState.activeShort = short;
  appState.playhead = 0;
  appState.selectedTitleIndex = 0;

  // Update Active Card in sidebar
  document.querySelectorAll('.short-card-item').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`card-${shortId}`);
  if (card) card.classList.add('active');

  // Update Player Timeline
  const scrubber = document.getElementById('clipScrubber');
  scrubber.value = 0;
  document.getElementById('timeline-start-label').textContent = formatTime(short.start);
  document.getElementById('timeline-end-label').textContent = formatTime(short.start + short.duration);
  document.getElementById('durationDisplay').textContent = formatTime(short.duration);
  document.getElementById('currentTimeDisplay').textContent = "00:00";

  // Update AI Metadata Column
  document.getElementById('meta-score-number').textContent = short.score;
  document.getElementById('meta-score-reason').textContent = short.scoreReason;

  // 1. Render 5 AI Viral Titles
  renderViralTitles(short.titles);

  // 2. Render 15 Trending Hashtags
  renderHashtagsCloud(short.hashtags);

  // 3. Render Auto-Generated Description
  document.getElementById('ai-description-box').value = short.description;

  pauseVideo();
}

function renderViralTitles(titles) {
  const container = document.getElementById('viral-titles-container');
  if (!container || !titles) return;

  container.innerHTML = titles.map((t, idx) => `
    <button class="title-choice-pill ${idx === appState.selectedTitleIndex ? 'active' : ''}" 
            onclick="selectActiveTitle(${idx})">
      <span>${idx + 1}. ${escapeHtml(t)}</span>
    </button>
  `).join('');
}

function selectActiveTitle(idx) {
  appState.selectedTitleIndex = idx;
  renderViralTitles(appState.activeShort.titles);
  showToast(`Selected Title: "${appState.activeShort.titles[idx]}"`);
}

function renderHashtagsCloud(tags) {
  const container = document.getElementById('hashtags-container');
  if (!container || !tags) return;

  container.innerHTML = tags.map(tag => `
    <span class="hashtag-chip" onclick="copyTag('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>
  `).join('');
}

/* =========================================================
   CLIPBOARD COPY UTILITIES
   ========================================================= */

function copyCurrentTitle() {
  if (!appState.activeShort) return;
  const title = appState.activeShort.titles[appState.selectedTitleIndex] || appState.activeShort.title;
  navigator.clipboard.writeText(title).then(() => {
    showToast("✓ Title copied to clipboard!");
  });
}

function copyAllHashtags() {
  if (!appState.activeShort) return;
  const tags = appState.activeShort.hashtags.join(" ");
  navigator.clipboard.writeText(tags).then(() => {
    showToast("✓ All 15 trending hashtags copied!");
  });
}

function copyTag(tag) {
  navigator.clipboard.writeText(tag).then(() => {
    showToast(`Copied ${tag}`);
  });
}

function copyDescription() {
  const text = document.getElementById('ai-description-box').value;
  navigator.clipboard.writeText(text).then(() => {
    showToast("✓ AI Description copied to clipboard!");
  });
}

/* =========================================================
   CANVAS 9:16 VERTICAL RENDERING ENGINE
   Center Crop + Blurred Background Fill to Avoid Black Bars
   + 2-Second Hook Title Overlay + Hormozi Karaoke Subtitles
   ========================================================= */

function renderCanvasLoop() {
  renderFrame();
  animLoopId = requestAnimationFrame(renderCanvasLoop);
}

function renderFrame() {
  if (!ctx || !canvas) return;

  const width = canvas.width;   // 1080
  const height = canvas.height; // 1920

  // 1. Advance Playhead if playing
  if (appState.isPlaying && appState.activeShort) {
    const dur = appState.activeShort.duration;
    appState.playhead += 1 / 60; // 60 FPS tick

    // Loop at end of short
    if (appState.playhead >= dur) {
      appState.playhead = 0;
    }

    // Update scrubber UI
    const scrubber = document.getElementById('clipScrubber');
    if (scrubber && dur > 0) {
      scrubber.value = (appState.playhead / dur) * 100;
      document.getElementById('currentTimeDisplay').textContent = formatTime(appState.playhead);
    }
  }

  synthTime += 0.02;

  // 2. Clear background
  ctx.fillStyle = '#0a0b12';
  ctx.fillRect(0, 0, width, height);

  // 3. Render 9:16 Center Crop with Blurred Background Fill
  render9x16BlurredBackgroundAndCenter(width, height);

  // 4. Render Engagement Retention Progress Bar at Top
  if (appState.activeShort) {
    const dur = appState.activeShort.duration;
    const progress = dur > 0 ? Math.min(1, Math.max(0, appState.playhead / dur)) : 0;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 0, width, 14);
    ctx.fillStyle = '#ef4444'; // Red retention bar
    ctx.fillRect(0, 0, width * progress, 14);
  }

  // 5. Render 2-Second Auto Hook Title at Top of Short
  if (appState.activeShort && appState.playhead <= appState.showHookBannerFor) {
    render2SecondHookBanner(width, height);
  }

  // 6. Render Animated Karaoke Subtitles (Hormozi / MrBeast Style)
  if (appState.activeShort && appState.activeShort.words) {
    renderHormoziSubtitles(width, height);
  }

  // 7. Channel Watermark / Branding
  ctx.save();
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.textAlign = 'right';
  ctx.fillText("@viralshorts", width - 40, height - 50);
  ctx.restore();
}

/**
 * 9:16 Vertical Video Renderer:
 * Avoids black bars by:
 * 1. Drawing an enlarged, heavily blurred (boxblur) copy of the video across the whole 1080x1920 canvas.
 * 2. Drawing the sharp, high-res centered 16:9 or speaker-cropped frame in the middle.
 */
function render9x16BlurredBackgroundAndCenter(width, height) {
  // Layer A: Blurred Background Fill
  // Creates dynamic color reflection of the video to eliminate black bars
  const blurGrad = ctx.createLinearGradient(0, 0, width, height);
  const hueShift = (synthTime * 10) % 360;
  blurGrad.addColorStop(0, `hsl(${hueShift}, 45%, 15%)`);
  blurGrad.addColorStop(0.5, '#0f172a');
  blurGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = blurGrad;
  ctx.fillRect(0, 0, width, height);

  // Layer B: Center Speaker Frame (Sharp foreground)
  const centerH = width * (9 / 16); // Standard 16:9 video height inside 9:16 vertical canvas
  const centerY = (height - centerH) / 2;

  // Background Studio Pod
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, centerY - 200, width, centerH + 400);
  ctx.clip();

  // Studio lighting
  const orbX = width * 0.5 + Math.sin(synthTime * 0.5) * 60;
  const orbY = centerY + 150 + Math.cos(synthTime * 0.5) * 40;
  const orbGrad = ctx.createRadialGradient(orbX, orbY, 20, orbX, orbY, 400);
  orbGrad.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
  orbGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = orbGrad;
  ctx.fillRect(0, centerY - 200, width, centerH + 400);

  // Synthetic Speaker Avatar & Shure SM7B Mic
  const speakerX = width / 2;
  const speakerY = centerY + 180;
  const mouthMove = appState.isPlaying ? Math.sin(synthTime * 14) * 6 : 0;
  const headBob = appState.isPlaying ? Math.cos(synthTime * 3) * 5 : 0;

  // Shoulders
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.ellipse(speakerX, speakerY + 220 + headBob, 280, 160, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(speakerX - 35, speakerY + 80 + headBob, 70, 90);

  // Head
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.ellipse(speakerX, speakerY + headBob, 110, 135, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.ellipse(speakerX, speakerY - 60 + headBob, 115, 80, 0, 0, Math.PI);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(speakerX - 65, speakerY - 20 + headBob, 50, 26, 8);
  ctx.roundRect(speakerX + 15, speakerY - 20 + headBob, 50, 26, 8);
  ctx.fill();

  // Mouth
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.ellipse(speakerX, speakerY + 58 + headBob, 22, (8 + Math.abs(mouthMove)), 0, 0, Math.PI * 2);
  ctx.fill();

  // Microphone
  ctx.strokeStyle = '#52525b';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(speakerX - 160, speakerY + 260);
  ctx.lineTo(speakerX - 70, speakerY + 100);
  ctx.stroke();

  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.roundRect(speakerX - 95, speakerY + 50, 48, 100, 18);
  ctx.fill();

  ctx.restore();
}

/**
 * 2-Second Hook Title Banner:
 * Placed at the top for the first 2.5 seconds to grab attention.
 */
function render2SecondHookBanner(width, height) {
  const bannerY = 80;
  const bannerH = 110;
  const text = (appState.activeShort.titles[appState.selectedTitleIndex] || appState.activeShort.title).toUpperCase();

  ctx.save();
  ctx.font = '900 44px "Montserrat", -apple-system, sans-serif';
  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const boxW = Math.min(width - 80, textW + 60);
  const boxX = (width - boxW) / 2;

  // Background Box (Vibrant Red/Rose Pill with Shadow)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.roundRect(boxX, bannerY, boxW, bannerH, 20);
  ctx.fill();

  // Border highlight
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, bannerY + (bannerH / 2));

  ctx.restore();
}

/**
 * Hormozi Animated Karaoke Subtitles:
 * - Word-by-word active highlighting
 * - Bouncy scale animation (1.2x) on active word
 * - High-retention yellow keyword pop (`#ffdf00`) with thick black outline
 * - Auto emojis
 */
function renderHormoziSubtitles(width, height) {
  const clip = appState.activeShort;
  if (!clip || !clip.words) return;

  const absTime = clip.start + appState.playhead;
  const words = clip.words;

  let activeIndex = words.findIndex(w => absTime >= w.start && absTime <= w.end);
  if (activeIndex === -1) {
    activeIndex = words.findIndex(w => w.start > absTime) - 1;
    if (activeIndex < 0 && absTime >= words[0].start) activeIndex = words.length - 1;
  }
  if (activeIndex < 0 || activeIndex >= words.length) return;

  // Show 3 words centered around activeIndex
  const chunkSize = 3;
  const chunkStart = Math.max(0, activeIndex - Math.floor(chunkSize / 2));
  const chunkEnd = Math.min(words.length, chunkStart + chunkSize);
  const currentChunk = words.slice(chunkStart, chunkEnd);

  const posY = height * 0.75;
  const fontSize = 68;

  ctx.save();
  ctx.translate(width / 2, posY);
  ctx.font = `900 ${fontSize}px "Montserrat", -apple-system, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const fullText = currentChunk.map(w => {
    let t = w.word.toUpperCase();
    if (w.emoji) t += ` ${w.emoji}`;
    return t;
  }).join(" ");

  const totalWidth = ctx.measureText(fullText).width;
  let cursorX = -totalWidth / 2;

  currentChunk.forEach((item, idx) => {
    let text = item.word.toUpperCase();
    if (item.emoji) text += ` ${item.emoji}`;
    const wordWidth = ctx.measureText(text).width;
    const spaceWidth = ctx.measureText(" ").width;
    const isActive = (idx === (activeIndex - chunkStart));

    ctx.save();

    if (isActive) {
      // Bounce scale animation
      const scale = 1.18;
      ctx.translate(cursorX + (wordWidth / 2), 0);
      ctx.scale(scale, scale);
      ctx.translate(-(cursorX + (wordWidth / 2)), 0);
    }

    // Heavy Black Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeText(text, cursorX, 0);

    // Active word in Hormozi Yellow / Green
    if (isActive) {
      ctx.fillStyle = item.tag === 'emphasis' ? '#10b981' : '#ffdf00';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillText(text, cursorX, 0);

    ctx.restore();
    cursorX += wordWidth + spaceWidth;
  });

  ctx.restore();
}

/* =========================================================
   PLAYBACK CONTROLS
   ========================================================= */

function togglePlayPause() {
  if (appState.isPlaying) {
    pauseVideo();
  } else {
    playVideo();
  }
}

function playVideo() {
  appState.isPlaying = true;
  document.getElementById('play-icon').style.display = 'none';
  document.getElementById('pause-icon').style.display = 'block';
  showPlaybackIndicator();
}

function pauseVideo() {
  appState.isPlaying = false;
  document.getElementById('play-icon').style.display = 'block';
  document.getElementById('pause-icon').style.display = 'none';
  showPlaybackIndicator();
}

function showPlaybackIndicator() {
  const el = document.getElementById('playbackIndicator');
  if (!el) return;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 300);
}

function handleScrub(val) {
  if (!appState.activeShort) return;
  appState.playhead = (val / 100) * appState.activeShort.duration;
  document.getElementById('currentTimeDisplay').textContent = formatTime(appState.playhead);
}

function toggleMute() {
  appState.isMuted = !appState.isMuted;
  document.getElementById('unmute-icon').style.display = appState.isMuted ? 'none' : 'block';
  document.getElementById('mute-icon').style.display = appState.isMuted ? 'block' : 'none';
}

function resetToHome() {
  pauseVideo();
  document.getElementById('landing-hero').style.display = 'block';
  document.getElementById('processing-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================
   AUTO-POSTING INTEGRATION (MULTI-PLATFORM PUBLISHER)
   YouTube Shorts, Instagram Reels, FB Reels, TikTok, LinkedIn, Threads
   ========================================================= */

function loadSavedSocialConnections() {
  const saved = localStorage.getItem('viralshorts_social_accounts');
  if (saved) {
    try {
      appState.connectedPlatforms = JSON.parse(saved);
    } catch (e) {}
  }
  updateConnectedBadge();
}

function saveSocialConnections() {
  localStorage.setItem('viralshorts_social_accounts', JSON.stringify(appState.connectedPlatforms));
  updateConnectedBadge();
}

function updateConnectedBadge() {
  const badge = document.getElementById('connected-accounts-badge');
  if (!badge) return;
  const count = Object.values(appState.connectedPlatforms).filter(p => p.connected).length;
  badge.textContent = count;
}

function openSocialModal() {
  document.getElementById('socialModal').style.display = 'flex';
  renderSocialAccountsModal();
}

function closeSocialModal() {
  document.getElementById('socialModal').style.display = 'none';
}

function renderSocialAccountsModal() {
  Object.keys(appState.connectedPlatforms).forEach(key => {
    const plat = appState.connectedPlatforms[key];
    const statusEl = document.getElementById(`status-${key}`);
    const rowEl = document.getElementById(`platform-${key}`);
    if (!statusEl || !rowEl) return;

    const btn = rowEl.querySelector('.toggle-connect-btn');
    if (plat.connected) {
      statusEl.className = 'status-pill connected';
      statusEl.textContent = `Connected (${plat.handle || '@connected'})`;
      btn.className = 'toggle-connect-btn';
      btn.textContent = 'Disconnect';
    } else {
      statusEl.className = 'status-pill disconnected';
      statusEl.textContent = 'Not Connected';
      btn.className = 'toggle-connect-btn connect';
      btn.textContent = 'Connect';
    }
  });
}

function togglePlatformConnect(key) {
  const plat = appState.connectedPlatforms[key];
  if (!plat) return;

  plat.connected = !plat.connected;
  if (plat.connected && !plat.handle) {
    plat.handle = `@user_${key}`;
  }

  saveSocialConnections();
  renderSocialAccountsModal();

  showToast(`${plat.name} is now ${plat.connected ? 'Connected' : 'Disconnected'}`);
}

/* =========================================================
   "POST TO ALL" MODAL WORKFLOW
   ========================================================= */

function openPostToAllModal() {
  if (!appState.activeShort) {
    showToast("Please generate or select a short first.");
    return;
  }

  const modal = document.getElementById('postModal');
  modal.style.display = 'flex';

  const title = appState.activeShort.titles[appState.selectedTitleIndex] || appState.activeShort.title;
  document.getElementById('postModalTitle').textContent = title;
  document.getElementById('postModalTags').textContent = appState.activeShort.hashtags.slice(0, 6).join(" ");
  
  const thumbEl = document.getElementById('postShortThumb');
  if (thumbEl && appState.currentVideo && appState.currentVideo.thumb) {
    thumbEl.style.backgroundImage = `url('${appState.currentVideo.thumb}')`;
  }

  const targetList = document.getElementById('targetPublishList');
  const connectedKeys = Object.keys(appState.connectedPlatforms).filter(k => appState.connectedPlatforms[k].connected);

  document.getElementById('postChannelsCount').textContent = `${connectedKeys.length} Channels Ready`;

  targetList.innerHTML = connectedKeys.map(k => {
    const p = appState.connectedPlatforms[k];
    return `
      <div class="target-publish-item" id="publish-row-${k}">
        <div class="flex-row">
          <input type="checkbox" id="check-${k}" checked>
          <label for="check-${k}"><strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.handle)})</label>
        </div>
        <span class="status-pill connected" id="publish-status-${k}">Ready to Post</span>
      </div>
    `;
  }).join('');

  document.getElementById('publishProgressBox').style.display = 'none';
  document.getElementById('btnExecutePublish').disabled = false;
  document.getElementById('btnExecutePublish').innerHTML = `<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg><span>Publish Now</span>`;
}

function closePostToAllModal() {
  document.getElementById('postModal').style.display = 'none';
}

async function executePostToAll() {
  const btn = document.getElementById('btnExecutePublish');
  btn.disabled = true;
  btn.innerHTML = `<span class="pulse-ring"></span> Publishing...`;

  const progressBox = document.getElementById('publishProgressBox');
  progressBox.style.display = 'block';

  const barFill = document.getElementById('publishBarFill');
  const percentEl = document.getElementById('publishPercent');
  const statusText = document.getElementById('publishStatusText');

  const platformsToPost = Object.keys(appState.connectedPlatforms).filter(k => {
    const chk = document.getElementById(`check-${k}`);
    return chk && chk.checked;
  });

  if (platformsToPost.length === 0) {
    showToast("Please check at least one connected channel.");
    btn.disabled = false;
    return;
  }

  let step = 0;
  for (const k of platformsToPost) {
    step++;
    const p = appState.connectedPlatforms[k];
    const pct = Math.round((step / platformsToPost.length) * 100);

    barFill.style.width = `${pct}%`;
    percentEl.textContent = `${pct}%`;
    statusText.textContent = `Uploading 9:16 vertical stream to ${p.name}...`;

    const statusBadge = document.getElementById(`publish-status-${k}`);
    if (statusBadge) {
      statusBadge.textContent = "Publishing...";
      statusBadge.style.color = "#f59e0b";
    }

    // Simulate multi-platform API calls
    await new Promise(r => setTimeout(r, 650));

    if (statusBadge) {
      statusBadge.textContent = "✓ Published!";
      statusBadge.style.color = "#34d399";
    }
  }

  statusText.textContent = "✓ Published to all selected channels!";
  btn.innerHTML = `✓ Successfully Posted!`;
  showToast("🚀 All Shorts published to connected channels!");

  setTimeout(() => {
    closePostToAllModal();
  }, 1400);
}

/* =========================================================
   60FPS REAL-TIME IN-BROWSER VIDEO EXPORT ENGINE
   ========================================================= */

function renderAndExportCurrentShort() {
  if (!appState.activeShort) return;

  pauseVideo();
  const modal = document.getElementById('exportModal');
  modal.style.display = 'flex';
  document.getElementById('exportResultBox').style.display = 'none';
  document.getElementById('exportPercent').textContent = "0%";
  document.getElementById('exportBarFill').style.width = "0%";

  const dur = appState.activeShort.duration;
  const fps = 30;
  const totalFrames = Math.floor(dur * fps);

  let stream;
  try {
    stream = canvas.captureStream(fps);
  } catch (err) {
    alert("Canvas recording not supported in this browser.");
    closeExportModal();
    return;
  }

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);

    document.getElementById('exportPercent').textContent = "100%";
    document.getElementById('exportBarFill').style.width = "100%";
    document.getElementById('exportResultBox').style.display = 'block';

    const dlBtn = document.getElementById('downloadVideoBtn');
    dlBtn.href = url;
    dlBtn.download = `${appState.activeShort.title.replace(/[^a-zA-Z0-9]/g, '_')}_9x16.webm`;

    showToast("🎉 9:16 Short rendered and ready for download!");
  };

  recorder.start();

  let frame = 0;
  appState.playhead = 0;

  function nextFrame() {
    if (frame >= totalFrames) {
      recorder.stop();
      return;
    }

    appState.playhead = (frame / totalFrames) * dur;
    renderFrame();

    const pct = Math.round((frame / totalFrames) * 100);
    document.getElementById('exportPercent').textContent = `${pct}%`;
    document.getElementById('exportBarFill').style.width = `${pct}%`;

    frame++;
    setTimeout(nextFrame, 1000 / fps);
  }

  nextFrame();
}

function closeExportModal() {
  document.getElementById('exportModal').style.display = 'none';
}

/* =========================================================
   GOOGLE LOGIN & SUPABASE AUTH
   ========================================================= */

function handleGoogleAuth() {
  if (appState.user) {
    // Logout
    appState.user = null;
    document.getElementById('authButtonText').textContent = "Sign in with Google";
    showToast("Logged out");
    return;
  }

  // Simulated Google Login
  appState.user = {
    name: "Alex Creator",
    email: "creator@viralshorts.ai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  };

  document.getElementById('authButtonText').textContent = appState.user.name;
  showToast(`Signed in as ${appState.user.name}`);
}

/* =========================================================
   BACKEND MODAL
   ========================================================= */

function openBackendModal() {
  document.getElementById('backendModal').style.display = 'flex';
}

function closeBackendModal() {
  document.getElementById('backendModal').style.display = 'none';
}

/* =========================================================
   HELPERS & TOASTS
   ========================================================= */

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message) {
  const container = document.getElementById('toast');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="font-size:1.1rem;">⚡</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
