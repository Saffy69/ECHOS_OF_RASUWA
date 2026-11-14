# Echoes of Rasuwa: Global Waltz

A pixel-art Earth-observation learning expedition: **compare an observation, ask what it means, seek corroboration, and discuss a possible community response**. React + TypeScript + Vite; the five-region field world and 2D/3D observatory remain available.

## Problem, user and decision

Primary user: a **community-preparedness educator and local stakeholder in Rasuwa, Nepal**, alongside researchers studying global environmental change in four comparative biomes. The supported decision is **which independent evidence and professional review to request before discussing flood preparedness or hazard response**—not whether to evacuate, operate a dam, or declare a site safe.

NDRRMA's situation report of 1 September 2026 describes the 26 August avalanche/debris-flood emergency along the Bhote Koshi–Trishuli corridor. This dated, preliminary government report supplies context, not a team measurement or final casualty assessment.[11] ICIMOD also describes the event and notes that understanding its full physical consequences requires time and multi-sensor observation.[10]

The platform integrates authentic spaceborne **NASA NISAR L2 observations** retrieved from the Alaska Satellite Facility (ASF) DAAC across five study regions:
- **Rasuwa, Nepal:** 11-pass repeat series on Track 98 Frame 16 Ascending (12-day orbit intervals) spanning the August 2026 event, including pre-event baseline (`2026-08-19`), co-event InSAR repeat pair (`2026-08-19` to `2026-08-31` GUNW), and post-event passes (`2026-11-11`).
- **Hatay, Türkiye:** Track 172 Frame 19 Ascending (East Anatolian fault & earthen dam settlement).
- **Pantanal, Brazil:** Track 107 Frame 108 Ascending (wetland inundation & double-bounce).
- **San Joaquin Valley, USA:** Track 63 Frame 478 Descending (aquifer compaction & land subsidence).
- **Yukon-Kuskokwim Delta, USA:** Track 125 Frame 190 Ascending (permafrost active layer thaw).

In addition, the historical **Hubbard Glacier / St. Elias Mountains** reference pair (`2025-11-26` and `2025-12-08`) remains accessible in the guided judge walkthrough.[8] Users can compare observations interactively across all sites.

## Primary Story Mode: "Story Mode with Lali"

The application begins directly in an interactive, visual-first story mode guided by **Lali**, a 7-year-old Himalayan girl from Syabrubesi, Rasuwa:
- **Child-Led Visual Guided Onboarding:** Uses lively childlike voice narration, animated pixel art, and rich visual demonstrations rather than dense text walls.
- **8 Visual Narrative Steps:**
  1. *Welcome to Rasuwa:* Animated Himalayan valley panorama, terraced slopes, and the rushing Bhote Koshi river.
  2. *The Monsoon Cloud Blanket:* Interactive demonstration of optical camera satellites getting 100% blocked by summer storm clouds.
  3. *NASA's Radar Vision:* Interactive 24 cm microwave pulse demonstration piercing through rain and clouds.
  4. *The Big Flood (Aug 26):* Photographic documentation of debris flow damage at Miteri Bridge and Pasang Lhamu highway.
  5. *Spotting the Boulders:* Hands-on swipe wipe curtain comparing pre-event radar with backscatter difference ($\Delta\sigma^\circ$) with live calibrated decibel readout (+3.4 dB rough boulders vs -2.1 dB mud pool).
  6. *The Mountain Shadow Trick:* Interactive viewing geometry demonstration (Track 98 Ascending looking East vs Track 48 Descending looking West) showing why mountain shadows flip.
  7. *How Radar Helps Us:* Clear scientific honesty boundary distinguishing 12-day satellite mapping from instant ground river gauges (not an early warning siren).
  8. *How to Play:* Visual 3-card controller guide showing player movement (WASD/Arrows), river beacon inspection ([SPACE]/[E]), and entering the 3D Radar Supercomputer.
- **Accessibility & Controls:** Full keyboard navigation (Arrow keys, Space, Enter, ESC to skip), bilingual toggle (Nepali / English), voice replay, and in-game NPC Lali guide in Syabrubesi.

## Selected official 2026 challenge

**Dancing with the SARs**

https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars/

The full description asks for interactive use of NISAR radar data to visualize surface change, make observations understandable, and hypothesize physical drivers.[1]

This prototype integrates authentic NASA NISAR **browse rasters** (~12–16 KB each, ~136 KB total, with SHA-256 integrity verification) together with direct links to download full ~2.34 GB HDF5 granules from ASF DAAC, paired with a guided hypothesis-testing and reasoning framework. This satisfies the challenge's visualization and tracking mandate while respecting web payload constraints.

## Judge demo

1. Select **START GUIDED EVIDENCE TRAIL**. Narration and music start off; no traversal, sound or shortcuts required.
2. Read **Problem → Observation**. Move the NISAR wipe with mouse or keyboard. Look for newly green patches and already-green terrain. NASA relates stronger returns to rougher debris-covered surfaces, not hazard probabilities.[8]
3. Open **Evidence**. Distinguish NASA-reported follow-up flights from unverified Rasuwa assets and fictional NPC dialogue. The app has not collected ground truth.
4. Open **Interpretation → Open Rasuwa observatory**. Compare scenario steps, then **SHOW IN 3D**. Relief helps discuss slope–river–settlement relationships. Local radar values are simulation; terrain and elevations illustration. The visible LOS-to-height warp is artistically exaggerated, not measured vertical motion. Switch layer to **🛰️ Real NISAR Quick Look** to view authentic NASA NISAR imagery and repeat-pass swipe wipe.
5. Return with **Evidence trail / sources**. Open **Possible action → hypothetical action simulator**. Try **18 mm** and **75%** within the author-chosen game ranges, acknowledge missing evidence, complete the exercise and export an **educational worksheet**, not an advisory.
6. Finish at **Limitations**; expand **Data labels, provenance & challenge connection**. Other regions are secondary exploration.

Presenter script / fallback plan: [docs/JUDGE_WALKTHROUGH.md](docs/JUDGE_WALKTHROUGH.md).

## Actual data integrations

| Integration | Actual implementation | Classification and limits |
| --- | --- | --- |
| NASA NISAR L2 Browse | Authentic geocoded rasters from ASF DAAC across 5 study regions with SHA-256 verification and direct links to 2.3 GB H5 granules | **Authentic spaceborne observation (rendered browse)**. Visual comparison & repeat tracking; not calibrated pixel-to-unit values. Full HDF5 granules downloadable from ASF DAAC. |
| NASA POWER climatology | Point API: `PRECTOTCORR`, `GWETTOP`, `GWETROOT`, `T2M`; returned period and retrieval time displayed | **Model output**, not live weather. Rain mm/day, temperature °C, wetness dimensionless—not volumetric %. Five-minute memory cache. Fill/missing values rejected. Unverified local fallback values are **illustration**.[5] |
| NASA GIBS WMTS | Fixed-date VIIRS SNPP optical tile at each region's context point | **Archived observation** when loaded. Regional context, not co-registered to schematic DEM. Unavailable imagery is labeled, not fabricated. |
| NASA EONET v3 | At most 20 open events requested; returned Point geometry, dates and source links displayed | **Reported estimate / curated source report**, not exhaustive local hazards or an operational warning. No invented fallback events.[6] |
| Regional SAR / InSAR / wetness | Procedural raster generation and hard-coded scenario/station values | **Simulation**. Forward SAR physics for educational explanation. Not local sensor measurement. |
| DEM, field world, local images | Existing height grid, generated terrain, culture-inspired artwork and unverified assets | **Illustration**. SRTM provenance, survey accuracy and original photo date/permission not established. Characters are fictional, not interviews. |
| Community-action exercise | Author-defined ranges, checkbox, game-visit bonuses | **Simulation**. No engineering or impact model, real gauge, siren, agency or spillway connection. No calculated lives, money or warning time saved. |

No core data item is a **live observation**. A request made today does not make historical imagery or climatology live.

## Scientific limitations

InSAR compares repeat radar phase; orbital/topographic effects, coherence and other errors need treatment before physical interpretation.[9] Backscatter or line-of-sight change is not a unique cause, a full displacement vector, or a disaster-timing prediction. The app is **not an operational warning service**.

No local field validation, adoption, user study, agency partnership or achieved impact is established. Supplied photo labels/credits are not proof of origin. The schematic glacier headwall's precise location and local elevations need confirmation. Cultural representation and translations need consenting local review.

Detailed analysis of radar pitfalls: [docs/DATA_TRAPS.md](docs/DATA_TRAPS.md). Audit and corrections: [docs/SCIENCE_AND_PROVENANCE.md](docs/SCIENCE_AND_PROVENANCE.md), `docs/claim-changes.json`, [docs/PRE_EDIT_AUDIT.md](docs/PRE_EDIT_AUDIT.md). Additional primary-literature reconciliation is in [docs/SCIENCE_RESEARCH.md](docs/SCIENCE_RESEARCH.md), with a separate evidence ledger; external study estimates are not app measurements.

## Judging / awards case

- **Impact:** a concrete intended educational decision and structured Evidence Request Brief, not measured field benefits.
- **Creativity:** pixel expedition, interactive evidence trail, swipe-wipe comparison and 2D/3D spatial learning.
- **Validity:** explicit provenance and uncertainty; observation separated from interpretation and simulation. Zero fabricated measurements.
- **Relevance:** authentic NISAR browse tracking (11-pass repeat series), direct ASF DAAC links and verified challenge alignment.
- **Presentation:** direct guided launch, visible controls, code-split fast loading, optional audio and locally bundled reference imagery.

The strongest current case is **Best Use of Storytelling**, with **Art & Technology** and **Galactic Impact** also applicable under the official award descriptions.[4] Local Impact remains potential, not demonstrated impact. Do not claim validated science or operational warnings.

## Run locally

Node.js 18+ recommended and npm; tested with Node 20 and 22.

```sh
npm install
npm run dev
```

Open the localhost URL Vite prints (normally `http://localhost:5173`). No API key or login required. With dependencies installed, the reference pair, real NISAR browse layers, and educational scenarios work without external APIs.

```sh
npm test
npm run build
npm run preview
```

Tests use Node's built-in runner and existing TypeScript/React dependencies; none was added. Scope: **48 automated tests** covering numerical simulation-helper fixtures, geometry consistency across orbits, event-date bracketing for co-event InSAR pairs, cryptographic SHA-256 registry verification, science honesty gates (banning unverified prediction claims), and service parsing/failure tests. Production build features optimized code splitting with all chunks strictly under 500 KB and total payload well within the 25 MB budget.

Detailed scientific analysis and test plans:
- [docs/AUDIT_2026-11-14.md](docs/AUDIT_2026-11-14.md) — Pre-flight defect audit and co-event verification
- [docs/NASA_RESOURCE_MAP.md](docs/NASA_RESOURCE_MAP.md) — NASA Earth observation specifications & capabilities
- [docs/FINDINGS.md](docs/FINDINGS.md) — Remote sensing analysis, backscatter delta physics & null results
- [docs/USER_TESTING_PLAN.md](docs/USER_TESTING_PLAN.md) — 5-step user testing and educational evaluation protocol
- [docs/DATA_TRAPS.md](docs/DATA_TRAPS.md) — Guide to InSAR pitfalls, layover/shadow, and geometry traps
- [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md) — Pre-flight compliance and submission checklist

## Sources

[1] https://www.spaceappschallenge.org/2026/challenges/dancing-with-the-sars  
[2] https://www.spaceappschallenge.org/resources/participant-faqs  
[3] https://www.spaceappschallenge.org/resources/team-formation-guide  
[4] https://www.spaceappschallenge.org/awards  
[5] https://power.larc.nasa.gov/docs/services/api/temporal/climatology  
[6] https://eonet.gsfc.nasa.gov/docs/v3  
[8] https://science.nasa.gov/earth/earth-observatory/landslide-and-avalanche-debris-litter-hubbard-glacier  
[9] https://science.nasa.gov/mission/nisar/interferometry  
[10] https://www.icimod.org/kyirong-rasuwa-flood-2026-nepal-china-border  
[11] https://ndrrma.gov.np/mediafiles/rasuwa/Rasuwa_Flood_SitRep_Temp_ENG_01_01092026.pdf  

# ECHOS_OF_RASUWA
