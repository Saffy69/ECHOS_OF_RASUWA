# NASA Space Apps Challenge 2026: Pre-Flight Submission Checklist
## Project Title: Echoes of Rasuwa: Global Waltz
**Submission Name:** Dancing with SAR  
**Challenge:** Dancing with the SARs (NISAR)  
**Submission Window:** Final Hackathon Submission Window (LIVE)  

---

## 1. Challenge & Compliance Gates

- [x] **Official Challenge Alignment:** Specifically targets *"Dancing with the SARs"* (interactive use of NISAR radar data to track and visualize surface change over time, explain observations, and test physical hypotheses).
- [x] **Zero Fabricated Measurements Gate:** Absolute ban on hardcoded numbers or constant-filled values masquerading as real measurements. Browse data is explicitly labeled `BROWSE_RENDERED`, and calibrated corridor data provides genuine physical values ($\Delta\sigma^\circ\text{ dB}$, LOS displacement, coherence $\gamma$).
- [x] **Zero Prediction Claims Gate:** No claims of "earthquake prediction", "landslide forecast", or "operational early warning". The system explicitly states that NISAR's 12-day orbital repeat cycle cannot provide real-time flash flood alerts, and that real-time warning requires ground stream gauges.
- [x] **Honest Null Results:** Rigorous documentation of InSAR decorrelation along active flood channels ($\gamma < 0.28$) and absence of slow-moving precursory slope creep fringes before the 26 August 2026 cloudburst.
- [x] **Simulation Boundary Declarations:** All forward SAR simulations, scenario inputs, and educational quizzes display clear `[SIMULATED SCENARIO INPUTS]` badges and methodology notes.
- [x] **Total Payload Budget:** Strictly under 25 MB. Entire compiled bundle (`dist/`) plus authentic NASA corridor rasters (`public/nisar-derived/` at 896 KB) is ~2.1 MB total (< 10% of payload limit).

---

## 2. Authentic Space Agency Data Ingestion

- [x] **Alaska Satellite Facility (ASF) DAAC Ingestion:** Automated Python pipeline (`pipeline/fetch_manifest.py`, `pipeline/process_corridor_subset.py`) processes authentic NASA NISAR granules from ASF DAAC using `~/.netrc` Earthdata credentials.
- [x] **True Co-Event Spanning InSAR Pairs (Rasuwa, Nepal):**
  - **Track 98 Frame 16 Ascending (Look ~78° ENE):** `NISAR_L2_PR_GUNW_028_098_A_016_029...` spanning `2026-08-19` to `2026-08-31` (strictly brackets the August 26 event).
  - **Track 48 Frame 74 Descending (Look ~282° WNW):** `NISAR_L2_PR_GUNW_028_048_D_074_029...` spanning `2026-08-16` to `2026-08-28` (opposite look direction).
  - **Single-Geometry Backscatter Difference Map:** Track 98 GCOV (`2026-08-19` to `2026-11-11`) delineating coarse boulder aggradation (+2.4 to +4.8 dB) from scoured mud drapes (-1.8 to -3.2 dB).
- [x] **Cryptographic Data Integrity:** Every client-served raster in `public/nisar-derived/` has an authentic SHA-256 hash verified against the registry and on-disk files.
- [x] **Direct DAAC Granule Access:** Every observation links directly to the official NASA ASF DAAC endpoint for full 2.3 GB HDF5 product download.
- [x] **NASA Complementary Earth Fleet Integration:**
  - **NASA GPM IMERG:** 48-hour precipitation timeline capturing the 142 mm storm on 25–26 August 2026.
  - **NASA OPERA DSWx-S1:** Dynamic Surface Water Extent cross-check.
  - **NASA POWER:** Climatological precipitation and soil moisture indices.
  - **NASA GIBS & EONET v3:** Optical context and natural hazard event feeds.

---

## 3. Educational Story Campaign: "The River Remembers"

- [x] **6 Guided Narrative Chapters:**
  1. *The Silent Mountain:* L-band 24 cm microwave cloud penetration vs optical blindspots.
  2. *The Surge:* 26 August 2026 debris flow context (NDRRMA & ICIMOD reports).
  3. *Reading the Scars:* Track 98 Backscatter Delta ($\Delta\sigma^\circ$) with interactive Swipe Wipe slider and calibrated cursor pixel inspector.
  4. *Two Eyes on the Gorge:* Track 98 Ascending vs Track 48 Descending dual look-direction viewer exposing mountain layover and shadow traps.
  5. *Connecting Sky to Earth:* Multi-sensor synthesis with GPM IMERG rainfall timeline and Atmospheric Phase Screen (APS) explanation.
  6. *Actionable Next Steps:* Actionable community takeaways with downloadable Evidence Request Brief (.txt) and bilingual Nepali Community Explainer.
- [x] **Audience Mode Switch:** Toggle between "Student (Grade 8 Friendly)" and "Specialist (Technical SAR Physics)" modes with customized analogies and equations.
- [x] **Pre/Post Learning Check (Quiz):** 5-question multiple choice assessment stored in `localStorage` measuring individual and cohort knowledge growth.

---

## 4. Software Architecture & Engineering

- [x] **Modular Code Splitting:**
  - Configured `rollupOptions.output.manualChunks` in `vite.config.ts`.
  - Vendor chunks: `three-vendor` (494 KB), `react-vendor` (143 KB), `data-atlas` (260 KB), and main `index.js` (352 KB).
  - **All JavaScript chunks are strictly under 500 KB**; zero chunk-size warnings during build.
- [x] **Automated Test Suite:**
  - **48/48 automated tests pass cleanly** via `npm test` using Node.js built-in runner.
  - Includes dedicated tests for geometry consistency (`tests/geometry-consistency.test.mjs`), event date bracketing (`tests/event-date-bracketing.test.mjs`), SHA-256 registry integrity (`tests/registry-integrity.test.mjs`), and science honesty gate (`tests/banned-words.test.mjs`).
- [x] **TypeScript Type Safety:**
  - Compiles cleanly with zero type errors (`npx tsc -b`).
- [x] **Clean Production Build:**
  - `npm run build` succeeds in ~6 seconds.

---

## 5. Scientific Documentation & Technical Reports

- [x] `docs/AUDIT_2026-11-14.md`: Systematic defect audit and verification of co-event InSAR granules and geometry matching.
- [x] `docs/NASA_RESOURCE_MAP.md`: Official specification and capability mapping for NISAR, OPERA, GPM, NASADEM, POWER, and GIBS.
- [x] `docs/FINDINGS.md`: Complete remote sensing and geomorphological research write-up with backscatter delta physics, InSAR coherence analysis, and honest null results.
- [x] `docs/USER_TESTING_PLAN.md`: Rigorous 5-step user evaluation protocol with Grade 8 students, community planners, and GIS educators.
- [x] `docs/REPRODUCE.md`: Complete one-command reproduction guide documenting the pipeline, ASF DAAC authentication, payload trade-offs, and test gates.
- [x] `docs/DATA_TRAPS.md`: Deep-dive technical guide for judges covering the four fundamental InSAR pitfalls (Geometry Mismatch, Phase Decorrelation, Layover & Shadow, and Atmospheric Phase Screen).
- [x] `docs/PROJECT_PAGE_DRAFT.md`: Complete, ready-to-paste Space Apps project page copy.
- [x] `docs/video_script_30s.md` & `docs/video_subtitles.srt`: 30.0-second video storyboard, voiceover narration, and timed subtitle file.
- [x] `docs/REFERENCES.md`: Comprehensive academic and institutional citations.

---

**Status:** ALL PHASES COMPLETE, AUDITED, TESTED (48/48 TESTS PASS), AND VERIFIED. READY FOR FINAL SUBMISSION.
