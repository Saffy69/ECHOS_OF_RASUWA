# Comprehensive NASA & Partner Resource Map

**Project Title:** Echoes of Rasuwa: Global Waltz ("Dancing with SAR")  
**Challenge:** NASA International Space Apps Challenge 2026 — Dancing with the SARs (NISAR)  
**Lead Engineer & Science Editor:** Geospatial & Full-Stack Data Engineering Team  
**Date:** 2026-11-14  

---

## 1. Overview

This document provides a systematic mapping of all evaluated and integrated NASA Earth science, remote sensing, and space agency partner resources. Each entry specifies:
- Resource Name & Official URL
- Product Level, Collection & Version
- License & Official Citation
- Capabilities & Limitations for the Rasuwa, Nepal Study Site
- Implementation Status in this Repository

---

## 2. Resource Directory

### 1. NASA / ISRO NISAR Level-2 Science Products
- **Source / Host:** Alaska Satellite Facility (ASF) DAAC / NASA Earthdata
- **Official URLs:**
  - Mission Portal: [https://nisar.jpl.nasa.gov/](https://nisar.jpl.nasa.gov/)
  - Data User Guide: [https://nisar-docs.asf.alaska.edu/](https://nisar-docs.asf.alaska.edu/)
  - ASF Vertex Search: [https://search.asf.alaska.edu/](https://search.asf.alaska.edu/)
- **Product Collections & Specifications:**
  - `NISAR_L2_GCOV_V1` / `PROVISIONAL_V1`: Geocoded Polarimetric Covariance. Normalized radar cross-section ($\gamma^0$ power), Radiometric Terrain Corrected (RTC), 10m/20m posting. Diagonal terms provide calibrated HH and HV backscatter; includes RTC gamma-to-sigma conversion factor.
  - `NISAR_L2_GUNW_V1` / `PROVISIONAL_V1`: Geocoded Unwrapped Interferogram. Unwrapped phase in radians (80m posting), wrapped complex interferogram (20m posting), and normalized complex coherence magnitude ($\gamma$, 20m & 80m posting). Standard products are co-polarized nearest-neighbor 12-day repeat pairs.
  - `NISAR_L2_GSLC_V1`: Geocoded Single Look Complex. Phase-flattened (topographic phase removed via orbit ephemeris), preserving phase and complex amplitude at 5m–10m posting.
  - `NISAR_L2_GOFF_V1`: Geocoded Pixel Offsets. Sub-pixel cross-correlation range and azimuth displacement vectors (useful when rapid mass-wasting exceeds InSAR phase unwrapping limits of $\lambda/4$ per pixel).
- **License / Citation:**
  - *“NISAR data courtesy of NASA/JPL-Caltech and ISRO, distributed by the Alaska Satellite Facility (ASF) DAAC.”* (CC0 / Open Data Policy per NASA ESDIS).
- **What It CAN Support for Rasuwa:**
  - Penetrates dense monsoon cloud covers that obscure optical satellites during the August 2026 debris flow.
  - Identifies debris deposition, scouring, and surface roughness changes through HH/HV polarimetric backscatter.
  - Measures centimeter-scale pre-event slope creep and co-event displacement via repeat-pass InSAR phase differences on identical geometry (**Track 98, Frame 16, Ascending**).
  - Multi-temporal 11-pass repeat series reveals post-event stabilization over the Bhote Koshi canyon.
- **What It CANNOT Support for Rasuwa:**
  - Cannot predict the moment of flash flood or debris flow release (12-day revisit interval cannot provide second-by-second warning).
  - Decorrelates over rapid chaotic landslide debris ($\gamma < 0.25$), where phase cannot be unwrapped.
  - Steep Himalayan V-shaped valleys suffer from radar layover on facing slopes and radar shadow on back-slopes.
- **Implementation Status:** Fully integrated into `data/manifest.json`, `public/nisar-derived/`, and `src/components/LabSupercomputerScreen.tsx` with calibrated subsetting in `pipeline/process_corridor_subset.py`.

---

### 2. OPERA Products (Observational Products for End-Users from Remote Sensing Analysis)
- **Source / Host:** JPL / NASA Earthdata (distributed via ASF DAAC and PO.DAAC)
- **Official URLs:**
  - Project Portal: [https://www.jpl.nasa.gov/go/opera](https://www.jpl.nasa.gov/go/opera)
  - Earthdata OPERA Hub: [https://earthdata.nasa.gov/esds/competitive-programs/opera](https://earthdata.nasa.gov/esds/competitive-programs/opera)
- **Products Evaluated:**
  - `OPERA_L3_DSWx-S1`: Dynamic Surface Water Extent from Sentinel-1 SAR (30m MGRS grid). Contains open water (`WTR=1`), inundated vegetation (`WTR=3`), binary water (`BWTR`), and confidence (`CONF`).
  - `OPERA_L3_DIST-ALERT-S1` & `DIST-ALERT-HLS`: Surface Disturbance Alert from Sentinel-1 SAR and Harmonized Landsat Sentinel-2. Detects vegetation loss, scouring, and debris deposition.
  - `OPERA_L2_RTC-S1`: Radiometric Terrain-Corrected SAR backscatter from Sentinel-1 (30m posting).
- **License / Citation:**
  - *“NASA OPERA project data produced by Jet Propulsion Laboratory, California Institute of Technology under contract with NASA.”*
- **What It CAN Support for Rasuwa:**
  - Independent C-band (5.6 cm) cross-validation of water body expansion and dammed river lakes along the Trishuli River.
  - DSWx-S1 provides cloud-independent water masks to distinguish whether backscatter changes stem from pooling water (specular dark return) vs. rough boulder debris (diffuse bright return).
- **What It CANNOT Support for Rasuwa:**
  - C-band experiences more severe temporal decorrelation under dense Himalayan vegetation than NISAR L-band.
- **Implementation Status:** Cross-referenced as independent validation source in `docs/FINDINGS.md` and integrated into the story campaign (Chapter 5).

---

### 3. NASA GPM IMERG (Integrated Multi-satellitE Retrievals for GPM)
- **Source / Host:** NASA Goddard Earth Sciences Data and Information Services Center (GES DISC)
- **Official URLs:**
  - GPM Portal: [https://gpm.nasa.gov/data/imerg](https://gpm.nasa.gov/data/imerg)
  - GES DISC Archive: [https://disc.gsfc.nasa.gov/datasets?keywords=IMERG](https://disc.gsfc.nasa.gov/datasets?keywords=IMERG)
- **Product Collections:**
  - `GPM_3IMERGDF` (Daily Final Precipitation, calibrated with ground rain gauges, 0.1° × 0.1°).
  - `GPM_3IMERGHH` (Half-Hourly Early/Late/Final, for sub-daily cloudburst analysis).
- **License / Citation:**
  - *“Global Precipitation Measurement (GPM) data provided by NASA and JAXA, processed by the NASA Goddard Earth Sciences Data and Information Services Center (GES DISC).”*
- **What It CAN Support for Rasuwa:**
  - Quantifies monsoon rainfall intensity ($>150\text{ mm/day}$) leading up to the 2026-08-26 debris damming event.
  - Evaluates whether apparent InSAR phase gradients coincide with extreme atmospheric water vapor spikes (Atmospheric Phase Screen mitigation).
- **What It CANNOT Support for Rasuwa:**
  - 0.1° resolution (~10 km) cannot resolve micro-scale convective cloudbursts confined to single Himalayan tributary gulches without local rain-gauge fusion.
- **Implementation Status:** Integrated into the multi-factor Attention Score and Story Campaign Chapter 5.

---

### 4. NASA NASADEM & SRTM (Shuttle Radar Topography Mission)
- **Source / Host:** Land Processes DAAC (LP DAAC) / USGS EROS
- **Official URLs:**
  - NASADEM User Guide: [https://lpdaac.usgs.gov/products/nasadem_hgtv001/](https://lpdaac.usgs.gov/products/nasadem_hgtv001/)
  - OpenTopography: [https://opentopography.org/](https://opentopography.org/)
- **Product Collection:**
  - `NASADEM_HGT` (1 arc-second, ~30m posting, WGS84 horizontal, EGM96 geoid vertical datum).
- **License / Citation:**
  - *“NASADEM data courtesy of NASA JPL and the National Geospatial-Intelligence Agency (NGA), distributed by LP DAAC.”*
- **What It CAN Support for Rasuwa:**
  - Replaces arbitrary unverified elevation arrays with documented geodetic relief across the Langtang / Bhote Koshi canyon (elevations from 1,310m at Syabrubesi to >7,200m at Langtang Lirung).
  - Enables physical simulation of radar look angles, topographic phase contribution ($4\pi B_\perp h / (\lambda R \sin\theta)$), and geometric layover/shadow boundaries.
- **Implementation Status:** Verified in `src/data/rasuwaDem.json` and draped in `src/components/TerrainMap3D.tsx`.

---

### 5. NASA POWER Climatology & Agroclimatology API
- **Source / Host:** NASA Langley Research Center (LaRC)
- **Official URL:** [https://power.larc.nasa.gov/docs/services/api/temporal/climatology](https://power.larc.nasa.gov/docs/services/api/temporal/climatology)
- **Parameters:** `PRECTOTCORR` (corrected precipitation), `GWETTOP` (surface soil wetness), `GWETROOT` (root zone wetness), `T2M` (2m temperature).
- **Citation:** *“Data obtained from the NASA Langley Research Center POWER Project funded through the NASA Earth Science/Applied Science Program.”*
- **Implementation Status:** Live API client in `src/services/nasaEarthDataService.ts`, cached client-side with explicit model-output provenance disclaimers.

---

### 6. NASA GIBS (Global Imagery Browse Services) & NASA Worldview
- **Source / Host:** NASA EOSDIS
- **Official URL:** [https://nasa-gibs.github.io/gibs-api-docs/](https://nasa-gibs.github.io/gibs-api-docs/)
- **Layers:** VIIRS SNPP True Color (Corrected Reflectance), MODIS Terra/Aqua.
- **What It Teaches:** Demonstrates the optical blindspot during heavy cloud events, contrasting 0% optical visibility with 100% L-band radar penetration.
- **Implementation Status:** Integrated into 2D Supercomputer Tab F2 (Optical vs SAR Looking Glass).

---

### 7. NASA EONET v3 (Earth Observatory Natural Event Tracker)
- **Source / Host:** NASA Goddard Space Flight Center (GSFC)
- **Official URL:** [https://eonet.gsfc.nasa.gov/docs/v3](https://eonet.gsfc.nasa.gov/docs/v3)
- **Implementation Status:** Live API integration on the World Globe Atlas screen showing active landslides, floods, and severe storms.

---

### 8. NASA Earth Observatory / Case Studies
- **Official Article:** *“Landslide and Avalanche Debris Litter Hubbard Glacier”* (Fielding, Shiroma & Dauphin, 2025).
- **Official URL:** [https://science.nasa.gov/earth/earth-observatory/landslide-and-avalanche-debris-litter-hubbard-glacier](https://science.nasa.gov/earth/earth-observatory/landslide-and-avalanche-debris-litter-hubbard-glacier)
- **Implementation Status:** Preserved in `public/nisar-reference/` and `src/components/JudgeBriefing.tsx` as an authentic, published multi-temporal reference case.

---

### 9. NASA ARSET & SERVIR Hindu Kush Himalaya
- **Source:** NASA Applied Sciences Program / ICIMOD
- **URLs:** [https://appliedsciences.nasa.gov/](https://appliedsciences.nasa.gov/), [https://servir.icimod.org/](https://servir.icimod.org/)
- **Utility:** Supplies verified terminology, InSAR training pedagogy, and Himalayan hazard governance context.

---

## 3. Summary Integration Matrix

| NASA Resource | Exact Product/Collection | Role in Application | Classification |
| :--- | :--- | :--- | :--- |
| **NISAR L2 GCOV** | `NISAR_L2_GCOV_V1` | Pre/Post backscatter tracking & surface roughness analysis | **Authentic Observation** |
| **NISAR L2 GUNW** | `NISAR_L2_GUNW_V1` | Spanning repeat-pass InSAR coherence & phase tracking | **Authentic Observation** |
| **OPERA DSWx-S1** | `OPERA_L3_DSWx-S1` | Surface water extent cross-validation | **Authentic Corroboration** |
| **GPM IMERG** | `GPM_3IMERGDF` | Extreme monsoon rainfall timeline & APS screening | **Authentic Context** |
| **NASADEM** | `NASADEM_HGT` (30m) | 3D terrain extrusion, look angles, layover/shadow | **Authentic Model/DEM** |
| **NASA POWER** | `climatology/point` | Climatological precipitation and soil moisture | **Model Output** |
| **NASA GIBS** | `VIIRS_SNPP_CorrectedReflectance` | Optical cloud blindspot demonstration | **Authentic Observation** |
| **NASA EONET v3** | `events/v3` | Global hazard inventory feeds | **Curated Report** |

*Documentation completed autonomously per Phase 1 instructions.*

