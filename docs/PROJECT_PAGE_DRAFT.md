# NASA Space Apps Challenge 2026: Official Project Submission Form Draft

**Project Title:** Echoes of Rasuwa: Global Waltz  
**Submission / Team Display Name:** Dancing with SAR  
**Selected Challenge:** Dancing with the SARs (NISAR L-Band Earth Observation)  
**Location / Event:** NASA International Space Apps Challenge 2026  
**Primary Focus:** Interactive multi-temporal NISAR radar tracking, physical hypothesis reasoning, and community impact screening across 5 vulnerable biomes.

---

## 1. Short Project Description (Elevator Pitch — max 280 characters)
*An interactive Earth-observation platform combining authentic NASA NISAR L-band repeat-pass radar tracking with a 16-bit retro expedition to visualize optically unseen surface change, test physical drivers, and empower community preparedness from the Himalayas to the Amazon.*

---

## 2. Detailed Project Description

### The Challenge: "Dancing with the SARs"
Earth's surface is in constant, dynamic motion—an "endless dance" of tectonic creep, glacial flow, permafrost thaw, aquifer subsidence, and seasonal flood pulses. While optical satellites are blinded by monsoon clouds, smoke plumes, and polar winter darkness, NASA and ISRO's **NISAR** (NASA-ISRO Synthetic Aperture Radar) satellite penetrates through cloud decks using long-wavelength ($24\text{ cm}$) L-band radar to observe centimeter-scale deformations and surface roughness shifts anywhere on Earth every 12 days.

However, Synthetic Aperture Radar (SAR) and Repeat-Pass Interferometry (InSAR) remain inaccessible to the communities most impacted by geomorphic hazards and environmental changes. Furthermore, non-specialists often fall into critical data traps: conflating look directions, interpreting phase noise as motion, or assuming radar alone can predict natural disasters.

### Our Solution
**Echoes of Rasuwa: Global Waltz** bridges the gap between cutting-edge spaceborne geodetics and on-the-ground decision making. We combine:
1. **Authentic Spaceborne NISAR Observations:** Direct integration of authentic NISAR Level-2 geocoded products (GCOV backscatter, GSLC single-look complex, and GUNW unwrapped InSAR phase) retrieved from the Alaska Satellite Facility (ASF) DAAC across five global monitoring sites.
2. **Multi-Temporal Repeat Tracking:** Rather than evaluating isolated pairs, our hero dataset in Rasuwa, Nepal features an **11-pass repeat series on identical orbital geometry (Track 98, Frame 16, Ascending)** at 12-day orbit intervals spanning the catastrophic August 2026 debris-damming event.
3. **Interactive 2D/3D Geodetic Supercomputer:** An observatory interface allowing users to toggle between authentic NISAR browse rasters, forward physical SAR simulations, and a 3D digital elevation model (DEM) with interactive swipe-wipe comparison and wireframe controls.
4. **Hypothesis-Testing & Reasoning Trail:** Users follow an evidence-driven scientific workflow: Observe -> Hypothesize Physical Drivers -> Discriminate with Multi-Sensor Evidence -> Generate a structured 1-page **Evidence Request Brief**.
5. **Radical Scientific Honesty:** Explicit disclaimers ban unsupported prediction claims; browse imagery is clearly labeled as uncalibrated; and rule-based screening scores explicitly disclose their simulated scenario inputs.

---

## 3. Five Global Biomes Explored

| Region | Biome & Setting | Hidden Phenomenon Observed | NISAR Observable & Physical Driver |
| :--- | :--- | :--- | :--- |
| **Rasuwa, Nepal** | High Himalayan Glacial Valley ($1,400\text{–}7,200\text{ m}$) | Monsoon-cloud-obscured slope instability & debris dams | L-band InSAR phase fringes ($\lambda/2 = 12\text{ cm}$) & coherence loss from mass wasting |
| **Hatay, Türkiye** | East Anatolian Strike-Slip Fault & Agricultural Graben | Post-seismic fault creep & earthen irrigation dam settlement | Differential InSAR phase gradients across fault plane and dam crest |
| **Pantanal, Brazil** | Tropical Floodplain & Gallery Forest | Sub-canopy standing water hidden by dense forest crowns | HH/HV polarimetric backscatter enhancement via double-bounce trunk-water reflection |
| **San Joaquin, USA** | Semi-Arid Agricultural Central Valley | Deep groundwater overdraft & Corcoran Clay compaction | Broad continuous subsidence troughs warping regional aqueduct infrastructure |
| **Yukon Delta, USA** | Sub-Arctic Tundra & Bering Sea Coastline | Permafrost active-layer seasonal thaw & thermokarst slumping | Cyclic summer line-of-sight subsidence vs stable upland gravel ridge baseline |

---

## 4. How We Developed This Project

### Technical Architecture
- **Frontend & Visualization:** React 18, TypeScript, Vite, Canvas 2D, Three.js (WebGL 3D geodetic DEM extrusion with custom terrain shaders and camera waypoints).
- **Data Discovery & Ingestion Pipeline:** Python 3 automated pipeline querying the NASA ASF DAAC Search API, indexing 700 authentic granules into `data/manifest.json`, and fetching client-optimized geocoded browse rasters with SHA-256 cryptographic verification into `public/nisar-derived/`.
- **Responsive Architecture & Performance:** Fully code-split bundle with vendor chunking (React, Three.js, data atlas) keeping all chunks $<500\text{ KB}$ and total package $<15\text{ MB}$ (well within the Space Apps 25 MB payload limit).
- **Audio & Accessibility:** Web Audio API procedural retro synthesized chimes and Web Speech API narrator, with full opt-in keyboard and visual controls.
- **Automated Quality & Honesty Gates:** Comprehensive test suite (45 tests) enforcing InSAR physical principles, zero fabricated numeric measurements, shared theme compliance, and strict bans on operational early-warning claims.

---

## 5. Space Agency Data Used

1. **NASA / ISRO NISAR (Alaska Satellite Facility DAAC):**
   - Collections: `NISAR_L2_GCOV_V1` (Geocoded Polarimetric Backscatter), `NISAR_L2_GUNW_V1` (Geocoded Unwrapped Interferograms), `NISAR_L2_GSLC_V1` (Geocoded Single Look Complex).
   - Volume: 700 granules discovered across 5 sites; 11-pass repeat series over Rasuwa (Track 98 Frame 16 Ascending).
   - Format: HDF5 (.h5) source granules linked directly at ASF DAAC with client-side SHA-256 verified browse rasters.
2. **NASA POWER API (Prediction of Worldwide Energy Resources):**
   - Climatology and point meteorology (`PRECTOTCORR`, `GWETTOP`, `GWETROOT`, `T2M`) providing regional atmospheric and moisture context.
3. **NASA GIBS (Global Imagery Browse Services):**
   - VIIRS SNPP true-color optical satellite imagery illustrating optical sensor blindspots during cloud and storm events.
4. **NASA EONET v3 (Earth Observatory Natural Event Tracker):**
   - Active global hazard and natural event feeds contextualizing real-time planetary dynamics.
5. **NASA Earth Observatory:**
   - Hubbard Glacier / St. Elias Mountains multi-temporal reference case study (`2025-11-26` and `2025-12-08`).

---

## 6. How It Addresses the Judging Criteria

- **Impact:** Empowers local community educators and decision-makers to formulate actionable **Evidence Request Briefs**, bridging space data to civil protection.
- **Creativity:** Uniquely merges 16-bit retro pixel exploration with a professional 2D/3D geodetic radar supercomputer and interactive swipe-wipe comparison.
- **Validity:** Absolute scientific honesty. Zero fabricated measurements; explicit separation of authentic spaceborne browse rasters, physical simulations, and scenario inputs.
- **Relevance:** Directly fulfills the "Dancing with the SARs" challenge by tracking multi-temporal surface change over time and guiding physical hypothesis discrimination.
- **Presentation:** Ultra-fast, code-split client loading in under 1 second, accessible WCAG-compliant interface, and comprehensive documentation.

---

## 7. Project Links & Repository
- **GitHub Repository:** [https://github.com/safal0715/echoes-of-rasuwa-nisar](https://github.com/safal0715/echoes-of-rasuwa-nisar)
- **Live Interactive Demo:** [http://localhost:5173](http://localhost:5173) (Local) / Deployment URL
- **Full Video Walkthrough:** 30-Second Demonstration Video (see `docs/video_script_30s.md` and `docs/video_subtitles.srt`)

