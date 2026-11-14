import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  STORY_CHAPTERS,
  LEARNING_CHECK_QUESTIONS,
  NEPALI_COMMUNITY_EXPLAINER,
  StoryChapter,
  QuizQuestion
} from '../data/riverRemembersData';
import {
  createCorridorLayerAdapter,
  CorridorPixelSample
} from '../services/corridorLayerAdapter';
import { retroAudio } from '../audio/retroAudioAndVoice';
import '../riverRemembers.css';

interface RiverRemembersStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteCampaign?: () => void;
}

export const RiverRemembersStoryModal: React.FC<RiverRemembersStoryModalProps> = ({
  isOpen,
  onClose,
  onCompleteCampaign
}) => {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [audienceMode, setAudienceMode] = useState<'student' | 'specialist'>('student');
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postScore, setPostScore] = useState<number | null>(null);

  // Chapter 3 interactive swipe state
  const [swipeSplitPct, setSwipeSplitPct] = useState<number>(50);
  const [viewModeCh3, setViewModeCh3] = useState<'swipe' | 'delta'>('swipe');
  const [pixelSampleCh3, setPixelSampleCh3] = useState<CorridorPixelSample | null>(null);

  // Chapter 4 interactive look state
  const [activeEyeCh4, setActiveEyeCh4] = useState<'t98_asc' | 't48_desc'>('t98_asc');
  const [pixelSampleCh4, setPixelSampleCh4] = useState<CorridorPixelSample | null>(null);

  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const eyeContainerRef = useRef<HTMLDivElement>(null);

  // Adapters
  const diffAdapter = useRef(createCorridorLayerAdapter('rasuwa_corridor_t98_diff'));
  const t98Adapter = useRef(createCorridorLayerAdapter('rasuwa_corridor_t98_coevent_gunw'));
  const t48Adapter = useRef(createCorridorLayerAdapter('rasuwa_corridor_t48_coevent_gunw'));

  // Load saved scores
  useEffect(() => {
    try {
      const savedPre = localStorage.getItem('river_remembers_quiz_pre');
      const savedPost = localStorage.getItem('river_remembers_quiz_post');
      if (savedPre !== null) setPreScore(Number(savedPre));
      if (savedPost !== null) setPostScore(Number(savedPost));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQuiz) setShowQuiz(false);
        else onClose();
      } else if (e.key === 'ArrowRight' && !showQuiz) {
        setActiveChapterId((curr) => Math.min(curr + 1, STORY_CHAPTERS.length));
      } else if (e.key === 'ArrowLeft' && !showQuiz) {
        setActiveChapterId((curr) => Math.max(curr - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showQuiz, onClose]);

  const currentChapter = STORY_CHAPTERS.find((c) => c.id === activeChapterId) || STORY_CHAPTERS[0];

  // Chapter 3 Pixel Sampling
  const handleMouseMoveCh3 = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!swipeContainerRef.current) return;
    const rect = swipeContainerRef.current.getBoundingClientRect();
    const u = (e.clientX - rect.left) / rect.width;
    const v = (e.clientY - rect.top) / rect.height;
    if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
      const sample = diffAdapter.current.getPixel(u, v);
      setPixelSampleCh3(sample);
    }
  }, []);

  // Chapter 4 Pixel Sampling
  const handleMouseMoveCh4 = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!eyeContainerRef.current) return;
    const rect = eyeContainerRef.current.getBoundingClientRect();
    const u = (e.clientX - rect.left) / rect.width;
    const v = (e.clientY - rect.top) / rect.height;
    if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
      const adapter = activeEyeCh4 === 't98_asc' ? t98Adapter.current : t48Adapter.current;
      const sample = adapter.getPixel(u, v);
      setPixelSampleCh4(sample);
    }
  }, [activeEyeCh4]);

  // Quiz submission
  const handleSubmitQuiz = () => {
    let score = 0;
    LEARNING_CHECK_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    setQuizSubmitted(true);
    retroAudio.playBadgeUnlock();

    try {
      if (preScore === null) {
        setPreScore(score);
        localStorage.setItem('river_remembers_quiz_pre', String(score));
      } else {
        setPostScore(score);
        localStorage.setItem('river_remembers_quiz_post', String(score));
      }
    } catch {
      // Ignore
    }
  };

  // Download Evidence Brief
  const handleDownloadBrief = () => {
    const briefText = `================================================================================
ECHOES OF RASUWA: EVIDENCE REQUEST BRIEF
NASA Space Apps Challenge 2026 — Track 98 & Track 48 InSAR Verification
================================================================================
Generated: ${new Date().toISOString()}
Study Corridor: Trishuli / Bhote Koshi Valley [85.12°E, 28.08°N to 85.53°E, 28.39°N]
Event Date: 2026-08-26 (Debris Flow & Infrastructure Severance)

1. SPACEBORNE OBSERVATIONAL EVIDENCE:
- Primary Satellite: NASA-ISRO Synthetic Aperture Radar (NISAR)
- Geometry 1: Track 98 Frame 16 Ascending GCOV (2026-08-19 to 2026-11-11)
  * Backscatter Difference (Δσ° HH): Channel boulder deposition exhibits +2.4 to +4.8 dB.
  * Saturated mud drape and scoured pools exhibit -1.8 to -3.2 dB.
- Geometry 2: Track 48 Frame 74 Descending GUNW (2026-08-16 to 2026-08-28)
  * Reverse look angle (~282° WNW) reveals opposite slope illumination.
  * InSAR coherence γ < 0.28 along active gorge channels confirms extreme flood-induced decorrelation.

2. SCIENTIFIC HONESTY & LIMITATION BOUNDARIES:
- NISAR 12-day orbital repeat cannot provide 30-minute flash flood warnings.
- Coherent upper ridge displacement is within SAR measurement uncertainty (±0.4 cm).
- Atmospheric Phase Screen (APS) from monsoon tropospheric moisture must be corrected via GACOS/ERA5 before estimating slow slope creep.

3. REQUIRED ACTIONABLE NEXT STEPS FOR RASUWA DISTRICT DISASTER COMMITTEE:
[ ] High-resolution drone (UAV) photogrammetry over Miteri Bridge and Chilime confluence.
[ ] In-situ automated water level gauges with satellite telemetry along Trishuli headwaters.
[ ] Structural geotechnical inspection of bridge abutments at Rasuwagadhi Customs.
[ ] Hydropower intake sediment desilting basin volume survey.

Citation: NASA/JPL-Caltech/ISRO via Alaska Satellite Facility (ASF) DAAC.
================================================================================`;

    const blob = new Blob([briefText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Rasuwa_InSAR_Evidence_Request_Brief.txt';
    a.click();
    URL.revokeObjectURL(url);
    retroAudio.playUiClick(700);
  };

  const handleDownloadNepali = () => {
    const blob = new Blob([NEPALI_COMMUNITY_EXPLAINER], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Rasuwa_Community_Radar_Explainer_Nepali.txt';
    a.click();
    URL.revokeObjectURL(url);
    retroAudio.playUiClick(700);
  };

  if (!isOpen) return null;

  return (
    <div className="story-campaign-overlay" role="dialog" aria-modal="true" aria-label="The River Remembers Story Campaign">
      <div className="story-campaign-shell">
        {/* TOP BAR */}
        <div className="story-campaign-topbar">
          <div className="story-campaign-title-area">
            <span className="story-kicker">🛰️ NASA SPACE APPS CHALLENGE 2026 • EDUCATIONAL STORY CAMPAIGN</span>
            <h2>🌊 The River Remembers: Himalayan Radar Science</h2>
          </div>

          <div className="story-topbar-controls">
            {/* AUDIENCE MODE TOGGLE */}
            <div className="story-mode-toggle" role="group" aria-label="Audience Reading Level">
              <button
                type="button"
                className={`story-mode-btn ${audienceMode === 'student' ? 'active' : ''}`}
                onClick={() => {
                  retroAudio.playUiClick(500);
                  setAudienceMode('student');
                }}
              >
                🌱 Student (Grade 8)
              </button>
              <button
                type="button"
                className={`story-mode-btn ${audienceMode === 'specialist' ? 'active' : ''}`}
                onClick={() => {
                  retroAudio.playUiClick(650);
                  setAudienceMode('specialist');
                }}
              >
                🔬 Specialist (SAR Physics)
              </button>
            </div>

            {/* QUIZ BUTTON */}
            <button
              type="button"
              className="story-quiz-btn"
              onClick={() => {
                retroAudio.playUiClick(600);
                setShowQuiz(true);
              }}
            >
              📝 Learning Check {postScore !== null ? `(${postScore}/5)` : preScore !== null ? `(${preScore}/5)` : ''}
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => {
                retroAudio.playUiClick(420);
                onClose();
              }}
            >
              ✕ EXIT [ESC]
            </button>
          </div>
        </div>

        {/* 6 CHAPTER TABS */}
        <nav className="story-campaign-nav" aria-label="Story Chapters">
          {STORY_CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`story-nav-tab ${activeChapterId === ch.id ? 'active' : ''}`}
              onClick={() => {
                retroAudio.playUiClick(580);
                setActiveChapterId(ch.id);
              }}
            >
              <span>Chapter {ch.id}</span>
              <small>{ch.title.split(':')[0].replace(/^\d+\.\s*/, '')}</small>
            </button>
          ))}
        </nav>

        {/* CHAPTER BODY */}
        <div className="story-campaign-body">
          {/* VISUAL & INTERACTIVE COLUMN (LEFT) */}
          <div className="story-visual-col">
            <div className="story-stage-box">
              <div className="story-stage-header">
                <span>{currentChapter.provenanceTag}</span>
                {currentChapter.id === 3 && (
                  <div className="curtain-toolbar" style={{ margin: 0, padding: 0 }}>
                    <button
                      type="button"
                      className={`retro-chip-btn ${viewModeCh3 === 'swipe' ? 'active-amber' : ''}`}
                      onClick={() => setViewModeCh3('swipe')}
                    >
                      ◀ Before / After Wipe ▶
                    </button>
                    <button
                      type="button"
                      className={`retro-chip-btn ${viewModeCh3 === 'delta' ? 'active-cyan' : ''}`}
                      onClick={() => setViewModeCh3('delta')}
                    >
                      Δσ° Difference Map
                    </button>
                  </div>
                )}
                {currentChapter.id === 4 && (
                  <div className="curtain-toolbar" style={{ margin: 0, padding: 0 }}>
                    <button
                      type="button"
                      className={`retro-chip-btn ${activeEyeCh4 === 't98_asc' ? 'active-cyan' : ''}`}
                      onClick={() => setActiveEyeCh4('t98_asc')}
                    >
                      Track 98 Ascending (Look East)
                    </button>
                    <button
                      type="button"
                      className={`retro-chip-btn ${activeEyeCh4 === 't48_desc' ? 'active-amber' : ''}`}
                      onClick={() => setActiveEyeCh4('t48_desc')}
                    >
                      Track 48 Descending (Look West)
                    </button>
                  </div>
                )}
              </div>

              <div className="story-stage-body">
                {currentChapter.id === 3 ? (
                  viewModeCh3 === 'swipe' ? (
                    <div
                      ref={swipeContainerRef}
                      className="story-swipe-container"
                      onMouseMove={handleMouseMoveCh3}
                    >
                      {/* Post-event raster (Right/Base) */}
                      <img
                        src="/nisar-derived/rasuwa_corridor_t98_post.png"
                        alt="Post-event Track 98 Ascending GCOV (2026-11-11)"
                        className="story-swipe-layer"
                        style={{ objectFit: 'contain' }}
                      />
                      {/* Pre-event raster (Left/Clipped) */}
                      <div
                        className="story-swipe-layer"
                        style={{
                          clipPath: `inset(0 ${100 - swipeSplitPct}% 0 0)`,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src="/nisar-derived/rasuwa_corridor_t98_pre.png"
                          alt="Pre-event Track 98 Ascending GCOV (2026-08-19)"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      {/* Divider line & handle */}
                      <div className="story-swipe-slider" style={{ left: `${swipeSplitPct}%` }}>
                        <span className="story-swipe-handle">◀ SLIDE WIPE ▶</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={99}
                        value={swipeSplitPct}
                        onChange={(e) => setSwipeSplitPct(Number(e.target.value))}
                        className="curtain-invisible-slider"
                        aria-label="Drag to compare pre-event and post-event radar rasters"
                      />
                    </div>
                  ) : (
                    <div
                      ref={swipeContainerRef}
                      className="story-swipe-container"
                      onMouseMove={handleMouseMoveCh3}
                    >
                      <img
                        src="/nisar-derived/rasuwa_corridor_t98_diff.png"
                        alt="Backscatter Difference Map Δσ° (Cyan = Boulder beds, Red = Mud/water)"
                        className="story-stage-img"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  )
                ) : currentChapter.id === 4 ? (
                  <div
                    ref={eyeContainerRef}
                    className="story-swipe-container"
                    onMouseMove={handleMouseMoveCh4}
                  >
                    <img
                      src={
                        activeEyeCh4 === 't98_asc'
                          ? '/nisar-derived/rasuwa_corridor_t98_coevent_gunw.png'
                          : '/nisar-derived/rasuwa_corridor_t48_coevent_gunw.png'
                      }
                      alt={
                        activeEyeCh4 === 't98_asc'
                          ? 'Track 98 Ascending Co-Event InSAR (Look East)'
                          : 'Track 48 Descending Co-Event InSAR (Look West)'
                      }
                      className="story-stage-img"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ) : currentChapter.id === 5 ? (
                  <div style={{ padding: '16px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--game-accent)' }}>
                      🌧️ NASA GPM IMERG 48-Hour Precipitation (Trishuli / Bhote Koshi Divide):
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '10px', padding: '10px', background: '#08110c', border: '1px solid var(--game-line)', borderRadius: '3px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: '25px', background: 'var(--game-safe)', borderRadius: '2px 2px 0 0' }} />
                        <small style={{ fontSize: '0.65rem', marginTop: '4px' }}>Aug 21: 18mm</small>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: '42px', background: 'var(--game-safe)', borderRadius: '2px 2px 0 0' }} />
                        <small style={{ fontSize: '0.65rem', marginTop: '4px' }}>Aug 23: 34mm</small>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: '145px', background: 'var(--game-danger)', borderRadius: '2px 2px 0 0' }} />
                        <strong style={{ fontSize: '0.68rem', marginTop: '4px', color: 'var(--game-danger)' }}>Aug 25-26: 142mm</strong>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '100%', height: '30px', background: 'var(--game-safe)', borderRadius: '2px 2px 0 0' }} />
                        <small style={{ fontSize: '0.65rem', marginTop: '4px' }}>Aug 28: 22mm</small>
                      </div>
                    </div>
                    <img
                      src="/nisar-derived/rasuwa_corridor_t98_coevent_gunw.png"
                      alt="Atmospheric delay fringes over Himalayan ridges"
                      style={{ maxHeight: '180px', objectFit: 'contain', border: '1px solid var(--game-line)' }}
                    />
                  </div>
                ) : (
                  <img
                    src={currentChapter.heroImage}
                    alt={currentChapter.title}
                    className="story-stage-img"
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>

              <div className="story-stage-caption">
                {currentChapter.heroImageCaption}
              </div>
            </div>

            {/* LIVE PIXEL SAMPLER READOUT FOR CHAPTER 3 & 4 */}
            {currentChapter.id === 3 && (
              <div className="story-pixel-inspector">
                <div className="story-inspector-header">
                  <span>🎯 Calibrated Pixel Inspector (Hover cursor over map):</span>
                  <span>{pixelSampleCh3 ? `${pixelSampleCh3.lat}°N, ${pixelSampleCh3.lon}°E` : 'Move mouse above'}</span>
                </div>
                {pixelSampleCh3 ? (
                  <div>
                    <div className="story-inspector-val">{pixelSampleCh3.formatted} (HH Δσ°)</div>
                    <div className="story-inspector-desc">{pixelSampleCh3.description}</div>
                  </div>
                ) : (
                  <div className="story-inspector-desc" style={{ fontStyle: 'italic' }}>
                    Hover over river corridor (Trishuli / Bhote Koshi) to inspect calibrated backscatter change.
                  </div>
                )}
              </div>
            )}

            {currentChapter.id === 4 && (
              <div className="story-pixel-inspector">
                <div className="story-inspector-header">
                  <span>📐 InSAR Geometry Inspector ({activeEyeCh4 === 't98_asc' ? 'Track 98 Ascending' : 'Track 48 Descending'}):</span>
                  <span>{pixelSampleCh4 ? `${pixelSampleCh4.lat}°N, ${pixelSampleCh4.lon}°E` : 'Move mouse above'}</span>
                </div>
                {pixelSampleCh4 ? (
                  <div>
                    <div className="story-inspector-val">{pixelSampleCh4.formatted}</div>
                    <div className="story-inspector-desc">{pixelSampleCh4.description}</div>
                  </div>
                ) : (
                  <div className="story-inspector-desc" style={{ fontStyle: 'italic' }}>
                    Hover over slopes or river gorge to observe coherence masking and stable ridge line-of-sight metrics.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STORY & SCIENCE COPY COLUMN (RIGHT) */}
          <div className="story-text-col">
            <div className="story-chapter-header">
              <h3>{currentChapter.title}</h3>
              <div className="story-chapter-sub">{currentChapter.subtitle}</div>
              <div className="story-chapter-nepali">{currentChapter.nepaliTitle}</div>
            </div>

            {/* MAIN COPY (STUDENT VS SPECIALIST) */}
            <div className="story-copy-container">
              {(audienceMode === 'student' ? currentChapter.studentCopy : currentChapter.specialistCopy).map((paragraph, pIdx) => (
                <p key={pIdx} className="story-copy-p">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* KEY TAKEAWAY CALLOUT */}
            <div className="story-takeaway-box">
              <strong>💡 Key Science Takeaway:</strong> {currentChapter.keyTakeaway}
            </div>

            {/* CHAPTER 6 ACTIONS */}
            {currentChapter.id === 6 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="atlas-play-btn primary"
                    onClick={handleDownloadBrief}
                  >
                    📥 Export Evidence Brief (.txt)
                  </button>
                  <button
                    type="button"
                    className="atlas-play-btn secondary"
                    onClick={handleDownloadNepali}
                  >
                    🇳🇵 Print Nepali Explainer (.txt)
                  </button>
                </div>
                <details className="science-boundary" style={{ marginTop: '8px' }}>
                  <summary>Preview Nepali Community Explainer (नेपाली सारांश)</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.74rem', background: '#0a140f', padding: '10px', borderRadius: '3px' }}>
                    {NEPALI_COMMUNITY_EXPLAINER}
                  </pre>
                </details>
              </div>
            )}

            {/* GLOSSARY ACCORDION */}
            {currentChapter.glossary && currentChapter.glossary.length > 0 && (
              <details className="story-glossary-box">
                <summary>📖 Technical Glossary &amp; Core Concepts ({currentChapter.glossary.length})</summary>
                <div className="story-glossary-list">
                  {currentChapter.glossary.map((g, gIdx) => (
                    <div key={gIdx} className="story-glossary-item">
                      <strong>{g.term}:</strong>{' '}
                      {audienceMode === 'student' ? g.simpleDef : g.technicalDef}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="story-campaign-footer">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--game-muted)' }}>
              Chapter {activeChapterId} of {STORY_CHAPTERS.length}
            </span>
          </div>

          <div className="story-footer-nav">
            <button
              type="button"
              className="retro-chip-btn"
              disabled={activeChapterId <= 1}
              onClick={() => {
                retroAudio.playUiClick(500);
                setActiveChapterId((curr) => Math.max(curr - 1, 1));
              }}
            >
              ◀ Previous Chapter
            </button>
            {activeChapterId < STORY_CHAPTERS.length ? (
              <button
                type="button"
                className="retro-chip-btn active-amber"
                onClick={() => {
                  retroAudio.playUiClick(650);
                  setActiveChapterId((curr) => Math.min(curr + 1, STORY_CHAPTERS.length));
                }}
              >
                Next Chapter ▶
              </button>
            ) : (
              <button
                type="button"
                className="retro-chip-btn active-cyan"
                onClick={() => {
                  retroAudio.playBadgeUnlock();
                  setShowQuiz(true);
                  if (onCompleteCampaign) onCompleteCampaign();
                }}
              >
                🏁 Take Final Learning Check
              </button>
            )}
          </div>
        </div>

        {/* 5-QUESTION LEARNING CHECK MODAL */}
        {showQuiz && (
          <div className="quiz-overlay" role="dialog" aria-modal="true" aria-label="Learning Check Quiz">
            <div className="quiz-shell">
              <div className="quiz-header">
                <div>
                  <h3 style={{ margin: 0, color: 'var(--game-accent)' }}>📝 Radar Science Learning Check</h3>
                  <small style={{ color: 'var(--game-muted)' }}>
                    Test your understanding of L-band radar, viewing geometry, and physical drivers in Rasuwa.
                  </small>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowQuiz(false)}
                >
                  ✕
                </button>
              </div>

              {quizSubmitted ? (
                <div className="quiz-result-card">
                  <div style={{ fontSize: '1.4rem' }}>
                    🏆 Score:{' '}
                    <strong>
                      {LEARNING_CHECK_QUESTIONS.filter((q) => quizAnswers[q.id] === q.correctIndex).length} /{' '}
                      {LEARNING_CHECK_QUESTIONS.length}
                    </strong>
                  </div>

                  {preScore !== null && postScore !== null && (
                    <div style={{ color: 'var(--game-safe)', fontSize: '0.9rem' }}>
                      📈 Learning Growth: Pre-Test: {preScore}/5 &rarr; Post-Test: {postScore}/5
                      {postScore > preScore ? ` (+${Math.round(((postScore - preScore) / 5) * 100)}% mastery improvement!)` : ' (Strong comprehension retained)'}
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: 'var(--game-text)' }}>
                    You have verified your understanding of spaceborne Synthetic Aperture Radar, single-geometry differencing, layover/shadow geometry traps, and why this is not an early warning system.
                  </p>

                  <button
                    type="button"
                    className="atlas-play-btn primary"
                    onClick={() => setShowQuiz(false)}
                    style={{ alignSelf: 'center', marginTop: '10px' }}
                  >
                    ✓ Return to Story Campaign
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {LEARNING_CHECK_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="quiz-question-box">
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {idx + 1}. {q.question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {q.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            className={`quiz-opt-btn ${quizAnswers[q.id] === oIdx ? 'selected' : ''}`}
                            onClick={() => {
                              retroAudio.playUiClick(550);
                              setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                            }}
                          >
                            <span style={{ fontWeight: 700, marginRight: '8px' }}>
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="atlas-play-btn primary"
                    disabled={Object.keys(quizAnswers).length < LEARNING_CHECK_QUESTIONS.length}
                    onClick={handleSubmitQuiz}
                    style={{ marginTop: '10px' }}
                  >
                    Submit Answers &amp; Verify Mastery
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
