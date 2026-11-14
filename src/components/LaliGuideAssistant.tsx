import React, { useState, useEffect, useRef } from 'react';
import { retroAudio } from '../audio/retroAudioAndVoice';
import '../laliGuideAssistant.css';

export interface LaliGuideAssistantProps {
  context: 'overworld' | 'lab_interior' | 'supercomputer' | 'intervention' | 'globe';
  subContext?: string; // e.g. 'observatory', 'curtain', 'physics', 'warning', 'nasa_live', or regionId
  scannedBeaconIds?: string[];
  nearbyTargetKind?: 'beacon' | 'npc' | 'door' | 'computer' | 'intervention' | null;
  nearbyTargetName?: string;
  onOpenStoryMode?: () => void;
  onOpenSupercomputer?: () => void;
  onOpenIntervention?: () => void;
  onOpenNavMap?: () => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const LaliGuideAssistant: React.FC<LaliGuideAssistantProps> = ({
  context,
  subContext,
  scannedBeaconIds = [],
  nearbyTargetKind,
  nearbyTargetName,
  onOpenStoryMode,
  onOpenSupercomputer,
  onOpenIntervention,
  onOpenNavMap,
  isOpenModal = false,
  onCloseModal
}) => {
  const [activeTab, setActiveTab] = useState<'next_step' | 'controls' | 'radar_basics' | 'story'>('next_step');
  const [mouthOpen, setMouthOpen] = useState<boolean>(false);
  const [collapsedToast, setCollapsedToast] = useState<boolean>(false);
  const portraitCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync mouth animation when Lali speaks
  useEffect(() => {
    retroAudio.onMouthState((open) => {
      setMouthOpen(open);
    });
    return () => {
      retroAudio.onMouthState(null);
    };
  }, []);

  // Compute contextual tip based on player location, nearby objects, and progress
  const getContextualTip = (): { title: string; text: string; actionLabel?: string; onAction?: () => void } => {
    // 1. If player is standing right next to something interactive in the 2D world
    if (nearbyTargetKind === 'beacon') {
      return {
        title: '📡 River Sensor Ahead!',
        text: `Press [SPACE] or [E] to scan ${nearbyTargetName || 'this beacon'}! It shows how the flood changed the riverbed.`
      };
    }
    if (nearbyTargetKind === 'door') {
      return {
        title: '🏛️ Radar Kendra Entrance',
        text: 'Step forward or press [SPACE] to enter our village radar laboratory!'
      };
    }
    if (nearbyTargetKind === 'npc') {
      return {
        title: '💬 Villager Nearby',
        text: `Press [SPACE] to speak with ${nearbyTargetName || 'the local villager'} about what happened during the storm!`
      };
    }
    if (nearbyTargetKind === 'computer') {
      return {
        title: '🖥️ 3D Supercomputer',
        text: 'Press [SPACE] to boot the giant 3D Radar Supercomputer and inspect satellite rasters!'
      };
    }
    if (nearbyTargetKind === 'intervention') {
      return {
        title: '⚡ Community Action',
        text: 'Press [SPACE] to launch the community action exercise and build our disaster resilience plan!'
      };
    }

    // 2. Specific Screen Contexts
    if (context === 'supercomputer') {
      if (subContext === 'curtain') {
        return {
          title: 'Curtain Comparison',
          text: 'Drag the slider wipe across the gorge! Bright cyan spots show where rough flood boulders were dumped.'
        };
      }
      if (subContext === 'physics') {
        return {
          title: 'Radar Physics Lab',
          text: 'Slide surface roughness up to see why rough rocks bounce radar waves straight back to space!'
        };
      }
      if (subContext === 'nasa_live') {
        return {
          title: 'NASA Satellite Context',
          text: 'These are authentic NASA NISAR passes! NISAR revisits our valley every 12 days on Track 98.'
        };
      }
      if (subContext === 'warning') {
        return {
          title: 'Evidence Brief',
          text: 'Click Export Brief to download a clear summary for engineers to plan safe bridge rebuilding!'
        };
      }
      return {
        title: '3D Observatory Monitor',
        text: 'Click "SHOW IN 3D" to raise the mountains! Drag with your mouse to rotate the valley slopes in full 3D.'
      };
    }

    if (context === 'intervention') {
      return {
        title: 'Community Action Plan',
        text: 'Adjust the rainfall threshold and river watch network. Satellites map the damage, while ground sirens sound the alarm!'
      };
    }

    if (context === 'globe') {
      return {
        title: 'Earth Surface Atlas',
        text: 'Radar tracks ground change everywhere! Click any of the 5 global hotspots to travel there with me.'
      };
    }

    if (context === 'lab_interior') {
      return {
        title: 'Inside DHM–NISAR Kendra',
        text: 'Walk up to the giant screen at the north wall and press [SPACE] to start the 3D Supercomputer!'
      };
    }

    // 3. Overworld Progression Guide in Rasuwa
    const count = scannedBeaconIds.length;
    if (count === 0) {
      return {
        title: 'Mission Step 1',
        text: 'Follow the stone path south along the Bhote Koshi river to inspect Beacon ST-01 at the bridge!'
      };
    }
    if (count < 3) {
      return {
        title: 'Mission Step 2',
        text: `Great work! You scanned ${count} beacon${count > 1 ? 's' : ''}. Keep following the river north to Timure and the Dam!`
      };
    }
    if (count < 5) {
      return {
        title: 'Mission Step 3',
        text: 'Almost done scanning! Head north to Miteri Bridge (ST-05) at the border gorge to inspect bridge damage.'
      };
    }
    return {
      title: 'Mission Complete!',
      text: 'You scanned all key river beacons! Head back to the DHM-NISAR Kendra in Syabrubesi to use the 3D Supercomputer.',
      actionLabel: 'Enter Lab',
      onAction: onOpenSupercomputer
    };
  };

  const tip = getContextualTip();

  // Draw miniature animated Lali portrait
  useEffect(() => {
    const c = portraitCanvasRef.current;
    if (!c) return;
    c.width = 36;
    c.height = 36;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, 36, 36);

    const skin = '#e2aa7b';
    const blush = '#fb7185';
    const hair = '#1c1917';
    const ribbon = '#e11d48';
    const sweater = '#059669';

    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(6, 4, 24, 22);
    ctx.fillRect(3, 14, 5, 14); // left pigtail
    ctx.fillRect(28, 14, 5, 14); // right pigtail

    // Ribbons
    ctx.fillStyle = ribbon;
    ctx.fillRect(2, 13, 6, 3);
    ctx.fillRect(28, 13, 6, 3);

    // Face
    ctx.fillStyle = skin;
    ctx.fillRect(9, 9, 18, 17);

    // Bangs
    ctx.fillStyle = hair;
    ctx.fillRect(9, 6, 18, 5);

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(13, 15, 3, 5);
    ctx.fillRect(20, 15, 3, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 16, 1, 1);
    ctx.fillRect(21, 16, 1, 1);

    // Blush
    ctx.fillStyle = blush;
    ctx.fillRect(10, 19, 3, 2);
    ctx.fillRect(23, 19, 3, 2);

    // Mouth
    ctx.fillStyle = mouthOpen ? '#881337' : '#9f1239';
    if (mouthOpen) {
      ctx.fillRect(16, 22, 4, 3);
    } else {
      ctx.fillRect(16, 22, 4, 2);
    }

    // Sweater
    ctx.fillStyle = sweater;
    ctx.fillRect(8, 27, 20, 9);
  }, [mouthOpen]);

  const handleSpeakTip = () => {
    retroAudio.playUiClick(520);
    retroAudio.speakLali(tip.text, 'happy');
  };

  return (
    <>
      {/* 1. FLOATING COMPANION TOAST (Always in-game) */}
      {!isOpenModal && (
        <aside
          className={`lali-companion-dock ${collapsedToast ? 'collapsed' : ''}`}
          aria-label="Lali's Guide Assistant"
        >
          <div className="lali-dock-bubble">
            <div className="lali-mini-portrait-box" onClick={() => setCollapsedToast(!collapsedToast)}>
              <canvas ref={portraitCanvasRef} className="lali-mini-portrait" />
              <span className="lali-mini-tag">LALI</span>
            </div>

            {!collapsedToast && (
              <div className="lali-dock-speech">
                <div className="lali-dock-header">
                  <span className="lali-dock-title">{tip.title}</span>
                  <div className="lali-dock-btns">
                    <button
                      type="button"
                      className="lali-mini-audio-btn"
                      onClick={handleSpeakTip}
                      title="Listen to Lali speak this tip"
                    >
                      🔊
                    </button>
                    <button
                      type="button"
                      className="lali-mini-close-btn"
                      onClick={() => setCollapsedToast(true)}
                      title="Minimize Lali's tip"
                    >
                      –
                    </button>
                  </div>
                </div>

                <p className="lali-dock-text">{tip.text}</p>

                {tip.actionLabel && tip.onAction && (
                  <button
                    type="button"
                    className="lali-dock-action-btn"
                    onClick={tip.onAction}
                  >
                    {tip.actionLabel} ➔
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 2. FULL INTERACTIVE GUIDEBOOK MODAL (When clicked from HUD or Lali) */}
      {isOpenModal && (
        <div className="lali-guidebook-overlay" role="dialog" aria-modal="true" aria-label="Lali's Field Guidebook">
          <div className="lali-guidebook-chassis">
            {/* TOP BAR */}
            <header className="lali-guidebook-topbar">
              <div className="lali-guidebook-brand">
                <span className="lali-guidebook-badge">👧 LALI&apos;S FIELD GUIDE</span>
                <span className="lali-guidebook-subtitle">Your Step-by-Step Science Companion</span>
              </div>

              <button
                type="button"
                className="lali-guidebook-close-btn"
                onClick={onCloseModal}
                title="Close Guidebook (ESC)"
              >
                ✕ Close [ESC]
              </button>
            </header>

            {/* TAB SELECTOR */}
            <nav className="lali-guidebook-tabs">
              <button
                type="button"
                className={`lali-tab-btn ${activeTab === 'next_step' ? 'active' : ''}`}
                onClick={() => {
                  retroAudio.playUiClick(500);
                  setActiveTab('next_step');
                }}
              >
                🎯 Where to Go
              </button>
              <button
                type="button"
                className={`lali-tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
                onClick={() => {
                  retroAudio.playUiClick(520);
                  setActiveTab('controls');
                }}
              >
                🎮 How to Play
              </button>
              <button
                type="button"
                className={`lali-tab-btn ${activeTab === 'radar_basics' ? 'active' : ''}`}
                onClick={() => {
                  retroAudio.playUiClick(540);
                  setActiveTab('radar_basics');
                }}
              >
                📡 Reading Radar
              </button>
              <button
                type="button"
                className={`lali-tab-btn ${activeTab === 'story' ? 'active' : ''}`}
                onClick={() => {
                  retroAudio.playUiClick(560);
                  setActiveTab('story');
                }}
              >
                🎬 Replay Story
              </button>
            </nav>

            {/* MAIN GUIDE CONTENT */}
            <main className="lali-guidebook-body">
              {/* TAB 1: WHERE TO GO NEXT */}
              {activeTab === 'next_step' && (
                <div className="lali-guide-panel">
                  <div className="lali-guide-card highlight">
                    <div className="lali-guide-card-icon">🎯</div>
                    <div>
                      <h4 className="lali-guide-card-title">{tip.title}</h4>
                      <p className="lali-guide-card-text">{tip.text}</p>
                    </div>
                  </div>

                  <div className="lali-guide-quest-summary">
                    <strong>📡 Your Rasuwa River Sensors:</strong>
                    <div className="lali-beacons-checklist">
                      {[
                        { id: 'syabrubesi', name: 'ST-01: Syabrubesi Confluence' },
                        { id: 'chilime', name: 'ST-02: Chilime Saturated Terraces' },
                        { id: 'timure', name: 'ST-03: Timure Tamang Tea-House' },
                        { id: 'rasuwagadhi_hydro', name: 'ST-04: 111 MW Dam Intake' },
                        { id: 'miteri_bridge', name: 'ST-05: Miteri Border Bridge' },
                        { id: 'purugu_glacier', name: 'ST-06: Purugu Glacier Headwall' }
                      ].map((b) => {
                        const isDone = scannedBeaconIds.includes(b.id);
                        return (
                          <div key={b.id} className={`lali-beacon-item ${isDone ? 'done' : ''}`}>
                            <span>{isDone ? '✓' : '○'}</span>
                            <span>{b.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lali-guide-quick-links">
                    {onOpenNavMap && (
                      <button
                        type="button"
                        className="retro-chip-btn active-cyan"
                        onClick={() => {
                          onCloseModal?.();
                          onOpenNavMap();
                        }}
                      >
                        🚁 Fast-Travel Map [M]
                      </button>
                    )}
                    {onOpenSupercomputer && (
                      <button
                        type="button"
                        className="retro-chip-btn active-amber"
                        onClick={() => {
                          onCloseModal?.();
                          onOpenSupercomputer();
                        }}
                      >
                        🖥️ Open 3D Supercomputer
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CONTROLS & HOW TO PLAY */}
              {activeTab === 'controls' && (
                <div className="lali-guide-panel">
                  <div className="lali-controls-grid">
                    <div className="lali-control-item">
                      <span className="lali-key-badge">W A S D / Arrows</span>
                      <div>
                        <strong>Walk Around</strong>
                        <p>Explore Syabrubesi village and hike along the Bhote Koshi river gorge.</p>
                      </div>
                    </div>

                    <div className="lali-control-item">
                      <span className="lali-key-badge">SPACE / E</span>
                      <div>
                        <strong>Interact &amp; Scan</strong>
                        <p>Walk up to blinking beacons, NPCs, and building doors to interact.</p>
                      </div>
                    </div>

                    <div className="lali-control-item">
                      <span className="lali-key-badge">M</span>
                      <div>
                        <strong>Helicopter Survey Sites</strong>
                        <p>Fast-travel between Syabrubesi, Chilime, Timure, and Miteri Bridge.</p>
                      </div>
                    </div>

                    <div className="lali-control-item">
                      <span className="lali-key-badge">Q</span>
                      <div>
                        <strong>Expedition Logbook</strong>
                        <p>Check active community missions and review scientific findings.</p>
                      </div>
                    </div>

                    <div className="lali-control-item">
                      <span className="lali-key-badge">C</span>
                      <div>
                        <strong>Radar Supercomputer</strong>
                        <p>Direct shortcut to the diegetic 2D/3D radar console.</p>
                      </div>
                    </div>

                    <div className="lali-control-item">
                      <span className="lali-key-badge">R</span>
                      <div>
                        <strong>Ask Lali for Help</strong>
                        <p>Opens this guidebook anytime you want advice or tips!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RADAR BASICS */}
              {activeTab === 'radar_basics' && (
                <div className="lali-guide-panel">
                  <div className="lali-radar-cheat-sheet">
                    <div className="lali-cheat-card cyan">
                      <div className="lali-cheat-badge">+3 to +6 dB (Bright Cyan)</div>
                      <strong>Rough Boulders &amp; Rock Debris</strong>
                      <p>
                        High backscatter! When flood waters dump giant jagged boulders, radar waves bounce straight back to space.
                      </p>
                    </div>

                    <div className="lali-cheat-card dark">
                      <div className="lali-cheat-badge">-12 to -18 dB (Dark Blue)</div>
                      <strong>Smooth Water &amp; Mud Pools</strong>
                      <p>
                        Specular reflection! Flat, smooth standing water acts like a mirror, reflecting radar waves away from the satellite.
                      </p>
                    </div>

                    <div className="lali-cheat-card rainbow">
                      <div className="lali-cheat-badge">Rainbow Fringes (InSAR Phase)</div>
                      <strong>Ground Deformation</strong>
                      <p>
                        Interferometry compares radar wave peaks. Each full rainbow cycle represents approximately 12 cm of ground movement.
                      </p>
                    </div>

                    <div className="lali-cheat-card warning">
                      <div className="lali-cheat-badge">⚠️ Mountain Shadow Trap</div>
                      <strong>Opposite Flight Directions</strong>
                      <p>
                        Radar shines sideways. Ascending (flying North) looks East, while Descending (flying South) looks West. Never subtract opposite orbits!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REPLAY STORY MODE */}
              {activeTab === 'story' && (
                <div className="lali-guide-panel center">
                  <div className="lali-story-launch-card">
                    <div style={{ fontSize: '2.5rem' }}>🏔️ 👧 🛰️</div>
                    <h3>Re-Play Lali&apos;s 8-Step Story Mode</h3>
                    <p>
                      Want to review how 24 cm microwaves penetrate monsoon clouds, how the August 26 flood happened, and how to use the interactive tools?
                    </p>

                    <button
                      type="button"
                      className="atlas-play-btn primary"
                      onClick={() => {
                        retroAudio.playLaliCheer();
                        onCloseModal?.();
                        onOpenStoryMode?.();
                      }}
                    >
                      ▶ START STORY MODE WITH LALI
                    </button>
                  </div>
                </div>
              )}
            </main>

            {/* FOOTER */}
            <footer className="lali-guidebook-footer">
              <span className="lali-footer-quote">
                &ldquo;Remember: Satellites cannot predict sudden flash floods; they are not an early warning siren. They map where damage occurred so our community can rebuild safely!&rdquo;
              </span>
              <button
                type="button"
                className="lali-nav-btn"
                onClick={onCloseModal}
              >
                Back to Game
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

