import React, { useState, useEffect, useRef, useCallback } from 'react';
import { retroAudio } from '../audio/retroAudioAndVoice';
import { createCorridorLayerAdapter, CorridorPixelSample } from '../services/corridorLayerAdapter';
import '../laliStoryMode.css';

interface LaliStoryModeProps {
  onStartGame: (spawnInLab?: boolean) => void;
  onOpenSupercomputer?: () => void;
}

interface StoryStep {
  id: number;
  stageTitle: string;
  laliText: string;
  laliNepali: string;
  mood: 'happy' | 'curious' | 'sad' | 'excited';
  visualType:
    | 'panoramic_valley'
    | 'monsoon_clouds'
    | 'nisar_beam'
    | 'flood_surge'
    | 'interactive_wipe'
    | 'shadow_trap'
    | 'early_warning_choice'
    | 'mission_briefing';
}

const STORY_STEPS: StoryStep[] = [
  {
    id: 0,
    stageTitle: '1. Welcome to Rasuwa',
    laliText: "Namaste! I'm Lali! Welcome to our high mountain village in Syabrubesi. Isn't our valley beautiful?",
    laliNepali: 'नमस्ते! म स्याफ्रुबेसीकी लाली। हाम्रो हिमाल र गाउँमा तपाईंलाई स्वागत छ!',
    mood: 'happy',
    visualType: 'panoramic_valley'
  },
  {
    id: 1,
    stageTitle: '2. The Monsoon Cloud Blanket',
    laliText: "Every summer, giant dark clouds cover our whole valley. Normal satellite cameras can only see white clouds—they can't see the ground at all!",
    laliNepali: 'मनसुनमा बाक्लो बादलले उपत्यका ढाक्छ। साधारण क्यामेराले बादल मात्र देख्छन्, जमिन देख्दैनन्!',
    mood: 'curious',
    visualType: 'monsoon_clouds'
  },
  {
    id: 2,
    stageTitle: "3. NASA's Radar Vision",
    laliText: "NASA's NISAR radar has a superpower! It shoots 24 cm microwave pulses that fly right through rain clouds to touch the ground!",
    laliNepali: 'नासाको निसार राडारको २४ सेमी तरङ्ग बादल र झरी छिचोलेर सिधै जमिनमा पुग्छ!',
    mood: 'excited',
    visualType: 'nisar_beam'
  },
  {
    id: 3,
    stageTitle: '4. The Big Flood (Aug 26)',
    laliText: 'On August 26, a massive flood rushed down our gorge! Millions of tons of mud and boulders broke our bridge and buried our roads.',
    laliNepali: 'भाद्र १० मा ठूलो बाढीले मितेरी पुलका पिलर भत्कायो र हाम्रो सडक बगायो।',
    mood: 'sad',
    visualType: 'flood_surge'
  },
  {
    id: 4,
    stageTitle: '5. Spotting the Boulders',
    laliText: 'Slide the wipe line across the river! See those bright glowing spots? That is where the flood dumped huge piles of rough boulders!',
    laliNepali: 'स्लाइडर सारेर हेर्नुहोस्! नीलो-हरियो चम्किलो भाग बाढीले ठूला ढुङ्गा थुपारेको ठाउँ हो!',
    mood: 'excited',
    visualType: 'interactive_wipe'
  },
  {
    id: 5,
    stageTitle: '6. The Mountain Shadow Trick',
    laliText: 'Watch out! Radar looks sideways. If the satellite flies North or South, mountain shadows flip! Never mix opposite directions!',
    laliNepali: 'होसियार! राडारले छड्के हेर्छ। दिशा बदलिँदा पहाडको छायाँ उल्टिन्छ। फरक कोणका तस्बिर नदाँज्नुहोस्!',
    mood: 'curious',
    visualType: 'shadow_trap'
  },
  {
    id: 6,
    stageTitle: '7. How Radar Helps Us',
    laliText: 'Can radar sound a 10-minute warning on my phone? No! NISAR returns every 12 days. It is not an early warning siren—we use river sensors for fast alerts, while radar helps us rebuild!',
    laliNepali: 'के राडारले १० मिनेट अगाडि घण्टी बजाउन सक्छ? सक्दैन! तत्काल सूचना खोलाको सेन्सरले दिन्छ, राडारले बाटो पुनर्निर्माण गर्न सघाउँछ।',
    mood: 'happy',
    visualType: 'early_warning_choice'
  },
  {
    id: 7,
    stageTitle: '8. How to Play!',
    laliText: "Now let's explore! Walk around Syabrubesi, inspect the river beacons, and meet me at the lab. Let's go!",
    laliNepali: 'अब तयार हुनुहोस्! स्याफ्रुबेसी घुम्नुहोस्, सेन्सर जाँच्नुहोस् र प्रयोगशालामा आउनुहोस्!',
    mood: 'excited',
    visualType: 'mission_briefing'
  }
];

export const LaliStoryMode: React.FC<LaliStoryModeProps> = ({
  onStartGame,
  onOpenSupercomputer
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [useNepali, setUseNepali] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<boolean>(false);
  const [swipeSplitPct, setSwipeSplitPct] = useState<number>(50);
  const [shadowLookDir, setShadowLookDir] = useState<'east' | 'west'>('east');
  const [pixelSample, setPixelSample] = useState<CorridorPixelSample | null>(null);
  const [radarPulsing, setRadarPulsing] = useState<boolean>(false);
  const [floodViewMode, setFloodViewMode] = useState<'after' | 'before'>('after');

  const valleyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cloudCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const portraitCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const swipeContainerRef = useRef<HTMLDivElement | null>(null);

  const diffAdapter = useRef(createCorridorLayerAdapter('rasuwa_corridor_t98_diff'));
  const step = STORY_STEPS[currentStepIndex];

  // Mouth animation listener
  useEffect(() => {
    retroAudio.onMouthState((open) => {
      setMouthOpen(open);
    });
    return () => {
      retroAudio.onMouthState(null);
    };
  }, []);

  // Speak Lali's line when step changes or language toggled
  useEffect(() => {
    if (voiceEnabled) {
      const speechText = useNepali ? step.laliNepali : step.laliText;
      retroAudio.speakLali(speechText, step.mood);
    }
    return () => {
      retroAudio.stopSpeaking();
    };
  }, [currentStepIndex, voiceEnabled, useNepali, step.laliText, step.laliNepali, step.mood]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        retroAudio.playUiClick(450);
        onStartGame(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex]);

  // Draw Lali's animated pixel portrait
  useEffect(() => {
    const c = portraitCanvasRef.current;
    if (!c) return;
    c.width = 48;
    c.height = 48;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, 48, 48);

    const skin = '#e2aa7b';
    const skinShadow = '#c58d60';
    const blush = '#fb7185';
    const hair = '#1c1917';
    const ribbon = '#e11d48';
    const sweater = step.mood === 'sad' ? '#0284c7' : '#059669';
    const sweaterPattern = '#f59e0b';

    // Hair back & pigtails
    ctx.fillStyle = hair;
    ctx.fillRect(8, 6, 32, 28);
    ctx.fillRect(4, 18, 6, 20);
    ctx.fillRect(38, 18, 6, 20);

    // Ribbons
    ctx.fillStyle = ribbon;
    ctx.fillRect(3, 17, 8, 4);
    ctx.fillRect(37, 17, 8, 4);

    // Face base
    ctx.fillStyle = skin;
    ctx.fillRect(12, 12, 24, 22);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(12, 30, 24, 4);

    // Bangs
    ctx.fillStyle = hair;
    ctx.fillRect(12, 8, 24, 7);
    ctx.fillRect(10, 10, 5, 8);
    ctx.fillRect(33, 10, 5, 8);

    // Big expressive eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(17, 20, 4, 6);
    ctx.fillRect(27, 20, 4, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(18, 21, 2, 2);
    ctx.fillRect(28, 21, 2, 2);

    // Cheerful blush
    ctx.fillStyle = blush;
    ctx.fillRect(14, 25, 4, 2);
    ctx.fillRect(30, 25, 4, 2);

    // Animated mouth
    if (mouthOpen) {
      ctx.fillStyle = '#881337';
      ctx.fillRect(22, 29, 4, 4);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(23, 31, 2, 2);
    } else {
      ctx.fillStyle = '#9f1239';
      if (step.mood === 'sad') {
        ctx.fillRect(22, 30, 4, 2);
      } else {
        ctx.fillRect(22, 29, 4, 2);
        ctx.fillRect(21, 28, 1, 1);
        ctx.fillRect(26, 28, 1, 1);
      }
    }

    // Cozy sweater & neckline
    ctx.fillStyle = sweater;
    ctx.fillRect(10, 36, 28, 12);
    ctx.fillStyle = sweaterPattern;
    ctx.fillRect(14, 38, 20, 3);
    for (let i = 14; i <= 32; i += 4) {
      ctx.fillRect(i, 43, 2, 3);
    }
  }, [mouthOpen, step.mood]);

  // STEP 0: Animated Himalayan Valley Canvas
  useEffect(() => {
    if (step.visualType !== 'panoramic_valley') return;
    const c = valleyCanvasRef.current;
    if (!c) return;
    let animId = 0;
    let tick = 0;

    const renderValley = () => {
      tick++;
      const W = (c.width = 480);
      const H = (c.height = 270);
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      skyGrad.addColorStop(0, '#10241b');
      skyGrad.addColorStop(1, '#234433');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant snow mountains
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.lineTo(80, 45);
      ctx.lineTo(160, 115);
      ctx.lineTo(260, 35);
      ctx.lineTo(360, 120);
      ctx.lineTo(440, 50);
      ctx.lineTo(W, 110);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Snow caps
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(80, 45);
      ctx.lineTo(110, 75);
      ctx.lineTo(95, 80);
      ctx.lineTo(80, 70);
      ctx.lineTo(65, 80);
      ctx.lineTo(50, 75);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(260, 35);
      ctx.lineTo(300, 75);
      ctx.lineTo(280, 85);
      ctx.lineTo(260, 70);
      ctx.lineTo(240, 85);
      ctx.lineTo(220, 75);
      ctx.closePath();
      ctx.fill();

      // Midground pine-covered mountain ridges
      ctx.fillStyle = '#1b382b';
      ctx.beginPath();
      ctx.moveTo(0, 140);
      ctx.quadraticCurveTo(120, 100, 240, 150);
      ctx.quadraticCurveTo(360, 110, W, 145);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();

      // Stepped agricultural terraces
      ctx.fillStyle = '#2f593e';
      for (let y = 145; y < 190; y += 12) {
        ctx.fillRect(0, y, W, 4);
      }

      // Rushing Bhote Koshi River
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(180, 180);
      ctx.lineTo(300, 180);
      ctx.lineTo(380, H);
      ctx.lineTo(120, H);
      ctx.closePath();
      ctx.fill();

      // Foam rapids
      ctx.fillStyle = '#bae6fd';
      for (let i = 0; i < 7; i++) {
        const rx = 150 + ((tick * 2 + i * 40) % 200);
        const ry = 190 + i * 10;
        ctx.fillRect(rx, ry, 18, 3);
      }

      // River boulders
      ctx.fillStyle = '#64748b';
      ctx.fillRect(170, 215, 22, 14);
      ctx.fillRect(270, 230, 28, 16);
      ctx.fillRect(230, 200, 16, 10);

      // Traditional stone village house
      ctx.fillStyle = '#475569';
      ctx.fillRect(40, 165, 45, 30);
      ctx.fillStyle = '#b45309'; // wood roof
      ctx.beginPath();
      ctx.moveTo(35, 165);
      ctx.lineTo(62, 148);
      ctx.lineTo(90, 165);
      ctx.closePath();
      ctx.fill();

      // Fluttering Prayer Flags
      const flagColors = ['#0284c7', '#f8fafc', '#dc2626', '#16a34a', '#eab308'];
      const wave = Math.sin(tick * 0.08) * 3;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(90, 155);
      ctx.quadraticCurveTo(150, 160 + wave, 210, 155);
      ctx.stroke();
      for (let f = 0; f < 5; f++) {
        ctx.fillStyle = flagColors[f];
        const fx = 100 + f * 20;
        const fy = 156 + Math.sin(tick * 0.08 + f) * 2;
        ctx.fillRect(fx, fy, 12, 10);
      }

      // Animated Lali waving
      const laliX = 75;
      const laliY = 190;
      ctx.fillStyle = '#e2aa7b';
      ctx.fillRect(laliX + 2, laliY, 6, 6); // head
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(laliX, laliY - 1, 10, 3); // hair
      ctx.fillStyle = '#059669';
      ctx.fillRect(laliX + 1, laliY + 6, 8, 8); // dress
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(laliX + 2, laliY + 14, 2, 4); // legs
      ctx.fillRect(laliX + 6, laliY + 14, 2, 4);

      // Waving arm
      const armWave = Math.sin(tick * 0.2) > 0;
      ctx.fillStyle = '#e2aa7b';
      if (armWave) {
        ctx.fillRect(laliX + 9, laliY + 3, 3, 3);
        ctx.fillRect(laliX + 10, laliY + 1, 2, 3);
      } else {
        ctx.fillRect(laliX + 9, laliY + 7, 3, 3);
      }

      animId = requestAnimationFrame(renderValley);
    };

    renderValley();
    return () => cancelAnimationFrame(animId);
  }, [step.visualType]);

  // STEP 1: Monsoon Rain & Cloud Blanket Canvas
  useEffect(() => {
    if (step.visualType !== 'monsoon_clouds') return;
    const c = cloudCanvasRef.current;
    if (!c) return;
    let animId = 0;
    let tick = 0;

    const renderClouds = () => {
      tick++;
      const W = (c.width = 480);
      const H = (c.height = 270);
      const ctx = c.getContext('2d')!;

      // Dark stormy sky
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Village ground below (dim and obscured)
      ctx.fillStyle = '#14251c';
      ctx.fillRect(0, H - 60, W, 60);

      // Rain streaks
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) {
        const rx = (i * 17 + tick * 4) % W;
        const ry = (i * 29 + tick * 8) % H;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 4, ry + 16);
        ctx.stroke();
      }

      // Rolling thick storm cloud blanket
      ctx.fillStyle = 'rgba(100, 116, 139, 0.88)';
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 70 - tick * 0.8) % (W + 100)) - 40;
        const cy = 60 + Math.sin(i + tick * 0.03) * 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(148, 163, 184, 0.92)';
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 70 - tick * 0.5 + 30) % (W + 100)) - 40;
        const cy = 75 + Math.sin(i * 1.5 + tick * 0.02) * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 38, 0, Math.PI * 2);
        ctx.fill();
      }

      // Optical Satellite at Top
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(W / 2 - 14, 18, 28, 12);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(W / 2 - 38, 20, 20, 8); // left solar panel
      ctx.fillRect(W / 2 + 18, 20, 20, 8); // right solar panel

      // Optical camera ray hitting the clouds and STOPPING
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 30);
      ctx.lineTo(W / 2 - 50, 85);
      ctx.moveTo(W / 2, 30);
      ctx.lineTo(W / 2 + 50, 85);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(renderClouds);
    };

    renderClouds();
    return () => cancelAnimationFrame(animId);
  }, [step.visualType]);

  // STEP 2: Radar Beam Animation Canvas
  useEffect(() => {
    if (step.visualType !== 'nisar_beam') return;
    const c = radarCanvasRef.current;
    if (!c) return;
    let animId = 0;
    let tick = 0;

    const renderRadar = () => {
      tick++;
      const W = (c.width = 480);
      const H = (c.height = 270);
      const ctx = c.getContext('2d')!;

      // Deep space into atmosphere
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.35, '#0b1d16');
      bgGrad.addColorStop(1, '#152e20');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Cloud layer in middle
      ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(i * 80 + 20, 110, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground / River Valley at bottom
      ctx.fillStyle = '#1c3325';
      ctx.fillRect(0, H - 55, W, 55);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(W / 2 - 40, H - 55, 80, 55);

      // NISAR Satellite at top center
      const satX = W / 2;
      const satY = 32;
      // Golden 12m radar reflector mesh
      ctx.strokeStyle = '#d5b66b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(satX, satY - 4, 24, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      // Bus body
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(satX - 10, satY + 4, 20, 14);
      // Solar wings
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(satX - 36, satY + 7, 22, 8);
      ctx.fillRect(satX + 14, satY + 7, 22, 8);

      // Radar microwave waves pulsing down through clouds
      const pulseSpeed = 2.5;
      const numWaves = 4;
      for (let w = 0; w < numWaves; w++) {
        const waveProgress = ((tick * pulseSpeed + w * 55) % (H - 60)) + 30;
        const alpha = Math.max(0, 1 - waveProgress / H);
        ctx.strokeStyle = `rgba(213, 182, 107, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(satX, satY + 20, waveProgress, 0.3 * Math.PI, 0.7 * Math.PI);
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();
    return () => cancelAnimationFrame(animId);
  }, [step.visualType]);

  const handleNext = () => {
    retroAudio.playUiClick(620);
    if (currentStepIndex < STORY_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      retroAudio.playLaliCheer();
      onStartGame(false);
    }
  };

  const handleBack = () => {
    retroAudio.playUiClick(480);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    retroAudio.voiceEnabled = next;
    if (!next) {
      retroAudio.stopSpeaking();
    } else {
      retroAudio.speakLali(useNepali ? step.laliNepali : step.laliText, step.mood);
    }
  };

  const toggleLanguage = () => {
    const nextLang = !useNepali;
    setUseNepali(nextLang);
    retroAudio.playUiClick(540);
    if (voiceEnabled) {
      retroAudio.speakLali(nextLang ? step.laliNepali : step.laliText, step.mood);
    }
  };

  const handleFireRadarPulse = () => {
    retroAudio.playRadarBeamPulse();
    setRadarPulsing(true);
    setTimeout(() => setRadarPulsing(false), 900);
  };

  const handleSwipeMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!swipeContainerRef.current) return;
    const rect = swipeContainerRef.current.getBoundingClientRect();
    const u = (e.clientX - rect.left) / rect.width;
    const v = (e.clientY - rect.top) / rect.height;
    if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
      const sample = diffAdapter.current.getPixel(u, v);
      setPixelSample(sample);
    }
  }, []);

  return (
    <div className="lali-story-container" role="region" aria-label="Story Mode with Lali">
      {/* TOP HEADER */}
      <header className="lali-story-topbar">
        <div className="lali-story-brand">
          <span className="lali-story-badge">STORY MODE</span>
          <span className="lali-story-title">{step.stageTitle}</span>
        </div>

        <div className="lali-story-top-actions">
          {/* Language Toggle */}
          <button
            type="button"
            className="lali-lang-toggle-btn"
            onClick={toggleLanguage}
            title="Toggle Nepali / English narration text"
          >
            {useNepali ? '🇳🇵 नेपाली (Active)' : '🇬🇧 English (Active)'}
          </button>

          {/* Voice Toggle */}
          <button
            type="button"
            className={`lali-voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={toggleVoice}
            title="Toggle Lali's Childlike Voice Narration"
          >
            {voiceEnabled ? '🔊 Lali Voice: ON' : '🔇 Muted'}
          </button>

          {/* Skip Button */}
          <button
            type="button"
            className="lali-skip-btn"
            onClick={() => {
              retroAudio.playUiClick(450);
              onStartGame(false);
            }}
            title="Skip directly to the 2D field world in Syabrubesi"
          >
            Skip to Game [ESC]
          </button>
        </div>
      </header>

      {/* CENTRAL VISUAL STAGE */}
      <main className="lali-stage-area">
        <div className="lali-stage-canvas-wrap">
          {/* STEP 0: Panoramic Mountain Valley */}
          {step.visualType === 'panoramic_valley' && (
            <div className="lali-step-visual-wrap">
              <canvas ref={valleyCanvasRef} className="lali-interactive-canvas" />
              <div className="lali-visual-pill-bottom">
                📍 Syabrubesi, Rasuwa • Elevation 1,436 m • High Himalayan Gateway
              </div>
            </div>
          )}

          {/* STEP 1: Monsoon Clouds Roll In */}
          {step.visualType === 'monsoon_clouds' && (
            <div className="lali-step-visual-wrap">
              <canvas ref={cloudCanvasRef} className="lali-interactive-canvas" />
              <div className="lali-cloud-alert-badge">
                ❌ OPTICAL CAMERA SATELLITES: 100% BLOCKED BY MONSOON CLOUDS
              </div>
              <div className="lali-visual-pill-bottom">
                Visible light waves (0.0005 mm) bounce off clouds. The ground is completely invisible!
              </div>
            </div>
          )}

          {/* STEP 2: NISAR Radar Beam */}
          {step.visualType === 'nisar_beam' && (
            <div className="lali-step-visual-wrap">
              <canvas ref={radarCanvasRef} className="lali-interactive-canvas" />
              <div className="lali-radar-interactive-ctrl">
                <button
                  type="button"
                  className={`lali-fire-pulse-btn ${radarPulsing ? 'firing' : ''}`}
                  onClick={handleFireRadarPulse}
                >
                  ⚡ FIRE 24cm RADAR PULSE
                </button>
              </div>
              <div className="lali-visual-pill-bottom">
                🛰️ NASA-ISRO NISAR • Long 24 cm microwave radar pierces straight through rain!
              </div>
            </div>
          )}

          {/* STEP 3: The Debris Flow */}
          {step.visualType === 'flood_surge' && (
            <div className="lali-step-visual-wrap">
              <img
                src={
                  floodViewMode === 'after'
                    ? '/incident_photos/gyirong_rasuwagadhi_mudslide_2025.png'
                    : '/incident_photos/nepal_flood_2026_before_after.webp'
                }
                alt="26 August 2026 Flood surge in gorge"
                className="lali-photo-stage"
              />
              <div className="lali-photo-toggle-bar">
                <button
                  type="button"
                  className={`retro-chip-btn ${floodViewMode === 'after' ? 'active-amber' : ''}`}
                  onClick={() => setFloodViewMode('after')}
                >
                  ⚠️ Flood Debris in Gorge
                </button>
                <button
                  type="button"
                  className={`retro-chip-btn ${floodViewMode === 'before' ? 'active-cyan' : ''}`}
                  onClick={() => setFloodViewMode('before')}
                >
                  📸 Bridge &amp; Highway Damage
                </button>
              </div>
              <div className="lali-visual-pill-bottom danger">
                ⚠️ 26 August 2026: Catastrophic debris flow broke Miteri bridge piers and severed roads
              </div>
            </div>
          )}

          {/* STEP 4: Interactive Radar Swipe Wipe */}
          {step.visualType === 'interactive_wipe' && (
            <div
              ref={swipeContainerRef}
              className="story-swipe-container"
              onMouseMove={handleSwipeMove}
            >
              {/* Post-event Difference (right) */}
              <img
                src="/nisar-derived/rasuwa_corridor_t98_diff.png"
                alt="Backscatter Difference Map"
                className="story-swipe-img"
              />
              {/* Pre-event (left) */}
              <div
                className="story-swipe-clipper"
                style={{ clipPath: `inset(0 ${100 - swipeSplitPct}% 0 0)` }}
              >
                <img
                  src="/nisar-derived/rasuwa_corridor_t98_pre.png"
                  alt="Pre-event radar image"
                  className="story-swipe-img"
                />
              </div>

              {/* Slider divider */}
              <div className="story-swipe-slider" style={{ left: `${swipeSplitPct}%` }}>
                <span className="story-swipe-handle">◀ SLIDE WIPE ▶</span>
              </div>
              <input
                type="range"
                min={2}
                max={98}
                value={swipeSplitPct}
                onChange={(e) => setSwipeSplitPct(Number(e.target.value))}
                className="curtain-invisible-slider"
                aria-label="Compare pre-event radar with backscatter difference"
              />

              {/* Visual pins on the imagery */}
              <div className="lali-radar-pin cyan-pin" style={{ top: '35%', left: '58%' }}>
                🪨 +3.4 dB Rough Boulder Fan
              </div>
              <div className="lali-radar-pin dark-pin" style={{ top: '65%', left: '42%' }}>
                🌊 -2.1 dB Standing Mud Pool
              </div>

              {/* Calibrated Hover Readout */}
              <div className="lali-cursor-readout-pill">
                {pixelSample ? (
                  <div>
                    <strong style={{ color: 'var(--game-accent)' }}>{pixelSample.formatted}</strong>
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--game-text)' }}>
                      {pixelSample.description}
                    </span>
                  </div>
                ) : (
                  <span>Hover mouse over the riverbed to read calibrated decibels!</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Shadow Trap (Dual-Look) */}
          {step.visualType === 'shadow_trap' && (
            <div className="lali-shadow-stage">
              <div className="lali-orbit-toggle-bar">
                <button
                  type="button"
                  className={`retro-chip-btn ${shadowLookDir === 'east' ? 'active-cyan' : ''}`}
                  onClick={() => setShadowLookDir('east')}
                >
                  🛰️ Track 98 Ascending (Flies North, Looks East ~78°)
                </button>
                <button
                  type="button"
                  className={`retro-chip-btn ${shadowLookDir === 'west' ? 'active-amber' : ''}`}
                  onClick={() => setShadowLookDir('west')}
                >
                  🛰️ Track 48 Descending (Flies South, Looks West ~282°)
                </button>
              </div>

              <img
                src={
                  shadowLookDir === 'east'
                    ? '/nisar-derived/rasuwa_corridor_t98_coevent_gunw.png'
                    : '/nisar-derived/rasuwa_corridor_t48_coevent_gunw.png'
                }
                alt="Look direction comparison"
                className="lali-shadow-img"
              />

              <div className="lali-visual-pill-bottom warning">
                💡 <strong>The Shadow Trap:</strong> Mountain shadows flip sides when flight direction flips! Never subtract opposite orbits or you will create fake landslides.
              </div>
            </div>
          )}

          {/* STEP 6: Honest Boundary */}
          {step.visualType === 'early_warning_choice' && (
            <div className="lali-honesty-stage">
              <div className="lali-honesty-question">
                🤔 Can satellite radar alert us 10 minutes before a sudden mountain flood?
              </div>

              <div className="lali-choice-grid">
                <div className="lali-choice-card selected">
                  <div className="lali-card-icon">🛰️ 12-Day Orbit</div>
                  <strong style={{ color: 'var(--game-safe)' }}>No, 12-day revisit is too slow!</strong>
                  <p>
                    Flash floods happen in 15 minutes. Space radar is not an early warning siren—it maps damage so engineers know where to rebuild!
                  </p>
                </div>

                <div className="lali-choice-card dim">
                  <div className="lali-card-icon">🚨 Instant Siren</div>
                  <strong>Need River Gauges on the Ground</strong>
                  <p>
                    Rapid evacuation requires physical ultrasonic water sensors right in the riverbed sounding local horns.
                  </p>
                </div>
              </div>

              <div className="lali-visual-pill-bottom safe">
                ✓ Teammates: River sensors sound the alarm, while NASA radar guides safe reconstruction!
              </div>
            </div>
          )}

          {/* STEP 7: Mission Steps & How to Play */}
          {step.visualType === 'mission_briefing' && (
            <div className="lali-mission-stage">
              <div className="lali-mission-heading">
                🎮 How to Play in Syabrubesi:
              </div>

              <div className="lali-mission-steps">
                <div className="lali-mission-card">
                  <span className="lali-mission-num">1</span>
                  <div className="lali-mission-title">🚶 WALK AROUND</div>
                  <div className="lali-mission-desc">
                    Use <strong>W-A-S-D</strong> or <strong>Arrow Keys</strong> to explore the village and meet locals.
                  </div>
                </div>

                <div className="lali-mission-card">
                  <span className="lali-mission-num">2</span>
                  <div className="lali-mission-title">📡 INSPECT BEACONS</div>
                  <div className="lali-mission-desc">
                    Walk up to glowing river sensors and press <strong>[SPACE]</strong> or <strong>[E]</strong> to check flood impact.
                  </div>
                </div>

                <div className="lali-mission-card">
                  <span className="lali-mission-num">3</span>
                  <div className="lali-mission-title">🏛️ SUPERCOMPUTER</div>
                  <div className="lali-mission-desc">
                    Enter the village laboratory to inspect authentic NISAR radar data in full 2D and 3D!
                  </div>
                </div>
              </div>

              <div className="lali-mission-action-row">
                <button
                  type="button"
                  className="atlas-play-btn primary"
                  onClick={() => {
                    retroAudio.playLaliCheer();
                    onStartGame(false);
                  }}
                >
                  ▶ ENTER SYABRUBESI WITH LALI
                </button>
                {onOpenSupercomputer && (
                  <button
                    type="button"
                    className="atlas-play-btn secondary"
                    onClick={() => {
                      retroAudio.playUiClick(700);
                      onOpenSupercomputer();
                    }}
                  >
                    🏛️ GO DIRECTLY TO LAB
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DIALOGUE BOX WITH LALI */}
      <footer className="lali-dialogue-bar">
        <div className="lali-portrait-box">
          <canvas ref={portraitCanvasRef} className="lali-portrait-canvas" />
          <span className="lali-portrait-tag">LALI (7)</span>
        </div>

        <div className="lali-dialogue-content">
          <div className="lali-step-indicator">
            <span className="lali-step-dots">
              {STORY_STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`lali-dot ${idx === currentStepIndex ? 'active' : idx < currentStepIndex ? 'done' : ''}`}
                />
              ))}
            </span>
            <span className="lali-step-label">{step.stageTitle}</span>
          </div>

          <p className="lali-speech-text">
            &ldquo;{useNepali ? step.laliNepali : step.laliText}&rdquo;
          </p>
        </div>

        <div className="lali-nav-actions">
          {/* Replay Voice button */}
          <button
            type="button"
            className="lali-replay-voice-btn"
            onClick={() => {
              retroAudio.playUiClick(500);
              retroAudio.speakLali(useNepali ? step.laliNepali : step.laliText, step.mood);
            }}
            title="Replay Lali's voice"
          >
            🔊 Replay
          </button>

          {currentStepIndex > 0 && (
            <button
              type="button"
              className="lali-nav-btn"
              onClick={handleBack}
            >
              ◀ Back
            </button>
          )}

          <button
            type="button"
            className="lali-nav-btn primary"
            onClick={handleNext}
          >
            {currentStepIndex < STORY_STEPS.length - 1 ? 'Next ▶' : "Let's Go! 🚀"}
          </button>
        </div>
      </footer>
    </div>
  );
};
