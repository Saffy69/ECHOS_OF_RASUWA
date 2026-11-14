# NASA Space Apps Challenge 2026: NISAR Data Pipeline & Application Reproduction Guide

**Project Title:** Echoes of Rasuwa: Global Waltz  
**Submission Name:** Dancing with SAR  
**Challenge:** Dancing with the SARs (NISAR L-Band Earth Observation)  
**Target DAAC:** Alaska Satellite Facility (ASF) DAAC / NASA Earthdata CMR  
**Repository Architecture:** React 18 + TypeScript + Vite + Three.js + WebGL  

---

## 1. Overview & Reproducibility Mission

This project connects authentic spaceborne NASA NISAR L-band observations directly to an interactive geodetic observatory and field-expedition learning platform. The end-to-end data pipeline is fully automated, transparent, and reproducible using standard open-source tools.

### Scientific Honesty Principles
1. **No Data Fabrication:** Every spaceborne observation traces to an authentic NASA Earthdata granule ID, track, frame, and ASF DAAC URI. The client application strictly avoids hardcoded constant literals masquerading as real physical measurements.
2. **Clear Simulation Boundaries:** Where real observations end and forward geomechanical simulations begin, explicit `SIMULATION` boundaries and disclaimer badges are displayed.
3. **Strict Ban on Prediction/Forecast Claims:** The platform detects, maps, screens, and tracks observable surface changes. It does not predict or forecast natural hazard events.

---

## 2. Prerequisites & System Setup

- **Operating System:** Linux / macOS / Windows WSL2
- **Python:** 3.9+ (requires `requests` library)
- **Node.js:** 18+ (tested with Node 20 & 22)
- **Networking:** Standard HTTPS access to NASA Earthdata endpoints
- **Disk Footprint:** < 25 MB total application and data package (strictly adhering to NASA Space Apps payload limits)

---

## 3. NASA Earthdata Authentication

Accessing authentic NISAR products from the Alaska Satellite Facility DAAC requires a free NASA Earthdata Login account.

Configure your `~/.netrc` file:
```bash
cat << 'EOF' >> ~/.netrc
machine urs.earthdata.nasa.gov
login <YOUR_EARTHDATA_USERNAME>
password <YOUR_EARTHDATA_PASSWORD>
EOF

chmod 600 ~/.netrc
```

Verify authentication:
```bash
curl -n -L -I "https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/NISAR_L2_GCOV_V1/NISAR_L2_PR_GCOV_035_048_D_074_2005_QPDH_A_20261108T125812_20261108T125847_P05036_N_F_J_001/NISAR_L2_PR_GCOV_035_048_D_074_2005_QPDH_A_20261108T125812_20261108T125847_P05036_N_F_J_001_LATLON.png"
```
*Expected output: HTTP/2 303 redirect followed by HTTP/2 200 OK from CloudFront.*

---

## 4. One-Command Full Pipeline Execution

Run the complete pipeline sequence from the project root:

```bash
# 1. Discover authentic NISAR granules across the 5 global observatory sites
python3 pipeline/fetch_manifest.py

# 2. Extract, subset, and prepare lightweight browser rasters & metadata
python3 pipeline/process_nisar_subset.py

# 3. Execute test suite and verify scientific honesty constraints
npm test

# 4. Build client production bundle with code-split chunks
npm run build
```

---

## 5. Pipeline Architecture & Data Discovery

### Step 1: Granule Discovery (`pipeline/fetch_manifest.py`)
Queries the ASF DAAC Search API (`https://api.daac.asf.alaska.edu/services/search/param`) with spatial intersection points across both pre-event and post-event acquisition windows for each of our 5 study regions:
- **Rasuwa, Nepal:** `POINT(85.34 28.18)` — Himalayan slope deformation & debris-damming
- **Hatay, Türkiye:** `POINT(36.32 36.42)` — East Anatolian strike-slip fault & earthen dam settlement
- **Pantanal, Brazil:** `POINT(-56.50 -17.50)` — Seasonal wetland inundation & sub-canopy double-bounce
- **San Joaquin Valley, USA:** `POINT(-119.80 36.30)` — Aquifer compaction & agricultural land subsidence
- **Yukon-Kuskokwim Delta, USA:** `POINT(-163.50 61.20)` — Permafrost active layer thaw subsidence

#### Discovery Results
The discovery script uncovered **700 authentic NASA NISAR granules** across all 5 sites on ASF DAAC:
- **Hero Repeat-Pass Discovery (Rasuwa, Nepal):** Identified an **11-pass repeat series** on identical orbital geometry (**Track 98, Frame 16, Ascending**) at 12-day intervals spanning the 2026-08-26 event:
  - *Pre-Event Baseline:* `2026-07-02`, `2026-07-14`, `2026-07-26`, `2026-08-19` (GCOV, GSLC, GUNW)
  - *Authentic Co-Event InSAR Pair:* `2026-08-19` to `2026-08-31` (NISAR L2 GUNW repeat-pass unwrapped phase)
  - *Post-Event Monitoring:* `2026-08-31`, `2026-09-12`, `2026-09-24`, `2026-10-06`, `2026-10-18`, `2026-10-30`, `2026-11-11`

Outputs:
- `data/manifest.csv`: 700 granules with Granule IDs, tracks, frames, start/end timestamps, collections, and download URIs.
- `data/manifest.json`: Structured catalogue consumed by client-side adapters.

### Step 2: Subsetting & Client Optimization (`pipeline/process_nisar_subset.py`)
- Retrieves authentic geocoded NISAR browse rasters for each site using `~/.netrc` authentication.
- Computes SHA-256 cryptographic checksums for every raster to guarantee data integrity.
- Produces client-ready PNGs and JSON metadata under `public/nisar-derived/` and registers them in `public/nisar-derived/nisar_registry.json`.
- **Payload Budget Compliance:** Full NISAR L2 HDF5 files are ~2.34 GB each. A single file exceeds the Space Apps 25 MB total submission limit by 100x. The client application renders genuine geocoded browse rasters (~12–16 KB each, ~136 KB total) while providing verified metadata and direct ASF DAAC download links to the full 2.3 GB HDF5 files.

---

## 6. Running the Interactive Observatory

```bash
# Start development server:
npm run dev

# Or test the compiled production build:
npm run preview
```

Open your browser at `http://localhost:5173`.  
- Navigate to the **Radar Supercomputer (F1–F5)** to explore synchronized 2D/3D geodetic rasters.
- In **Tab F1 (2D/3D Monitor)**:
  - Select layer **🛰️ Real NISAR Quick Look** to view authentic NASA NISAR observations.
  - In Rasuwa, activate the **↔️ Swipe Wipe Comparison** to interactively compare the Pre-Event Baseline (`2026-08-19`) with the Co-Event InSAR Pair (`2026-08-19 to 2026-08-31`).
  - Toggle **[ 🌐 WIREFRAME: ON/OFF ]** in 3D mode to view the authentic radar raster draped unobstructed onto the 3D digital elevation model.
- In **Tab F4 (NASA Context)**: View live NASA POWER climatology and authentic NISAR product metadata with direct ASF links.
- In **Tab F5 (Evidence Request Brief)**:
  - Examine the rule-based Change Attention Score, explicitly labeled `[SIMULATED SCENARIO INPUTS]` for scientific honesty.
  - Export the structured 1-page Evidence Request Brief containing authentic NASA granule IDs, track/frame geometries, and verified ASF download links.

---

## 7. Verification & Quality Gates

Run the automated test suite:
```bash
npm test
```

The test suite validates:
- InSAR physics consistency ($\lambda/2 = 12$ cm fringe cycle)
- Zero unsupported prediction, forecast, or operational warning claims
- sarLayerAdapter integrity: browse data is never marked `isMeasured: true` or given fabricated calibrated units
- Palette, accessibility, and shared game theme compliance
- Manifest geometry grouping and repeat pass detection spanning event dates
- Proper simulation boundary disclosures across all UI components
