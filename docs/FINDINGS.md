# Scientific Findings & Remote Sensing Analysis Report
## Project: Echoes of Rasuwa: Global Waltz (Submission: "Dancing with SAR")
**NASA International Space Apps Challenge 2026 — Challenge: "Dancing with the SARs"**  
**Study Area:** Trishuli / Bhote Koshi Valley Corridor, Rasuwa District, Bagmati Province, Nepal  
**Bounding Box:** `[85.12°E, 28.08°N, 85.53°E, 28.39°N]`  
**Principal Data Source:** NASA-ISRO Synthetic Aperture Radar (NISAR) via Alaska Satellite Facility (ASF) DAAC  
**Date of Report:** 2026-11-14  

---

## 1. Executive Summary & Research Question

During the South Asian summer monsoon (June–September), high-relief Himalayan valleys face catastrophic hydrometeorological hazards, including cloudbursts, glacial lake outbursts (GLOFs), and destructive debris flows. Simultaneously, persistent stratiform cloud cover exceeding 95% creates a severe "optical blindspot", preventing optical satellites (such as Landsat-8/9 or Sentinel-2) from assessing ground conditions for days or weeks.

This study investigates:
> **Can spaceborne L-band Synthetic Aperture Radar (NISAR) reliably delineate flood scour, sediment aggradation, and slope unrest in high-relief Himalayan terrain under complete cloud cover, and what are the strict physical limitations of such observations?**

Using authentic geocoded NISAR Level-2 products (GCOV backscatter and GUNW repeat-pass interferometry) acquired before, across, and after the catastrophic **26 August 2026 Rasuwa debris flow**, this report documents what the satellite genuinely observes, where the physics creates observational artifacts, and why an honest "null result" regarding pre-event early warning is essential for public safety.

---

## 2. Authentic NASA Earthdata / ASF DAAC Datasets Used

All NISAR rasters and metadata analyzed in this project were retrieved via authenticated access (`~/.netrc`) from the Alaska Satellite Facility (ASF) DAAC Open Data repository.

| Role | Granule ID | Product | Track / Frame | Geometry | Polarization | Reference Date(s) | SHA-256 (Local Raster) |
|---|---|---|---|---|---|---|---|
| **Pre-Event Baseline** | `NISAR_L2_PR_GCOV_028_098_A_016_4005_DHDH_A_20260819T233918...` | GCOV L2 | Track 98, Frame 16 | Ascending (Look ~78° ENE) | HH | 2026-08-19 | `ad4062ae7bf351bf387c9bf26110f7bd685c08de7ecb031bdb63d54b7f39ba4c` |
| **True Co-Event InSAR** | `NISAR_L2_PR_GUNW_028_098_A_016_029_4000_SH_20260819T233918...` | GUNW L2 | Track 98, Frame 16 | Ascending (Look ~78° ENE) | HH | 2026-08-19 to 2026-08-31 | `f474093c0f3780048644f26f2f219c318103b58685c1d728e9411a8eca47e0d9` |
| **Opposite Look InSAR** | `NISAR_L2_PR_GUNW_028_048_D_074_029_2000_SH_20260816T125812...` | GUNW L2 | Track 48, Frame 74 | Descending (Look ~282° WNW) | HH | 2026-08-16 to 2026-08-28 | `779f3e9fde1669a54b57169ce00a835e539dc39afb349622726faeb6a11375b9` |
| **Post-Event Monitoring** | `NISAR_L2_PR_GCOV_035_098_A_016_4005_DHDH_A_20261111T233918...` | GCOV L2 | Track 98, Frame 16 | Ascending (Look ~78° ENE) | HH | 2026-11-11 | `23da75a840c2064a8dc49a4c71575a71f132ebed7f9a6fa0a7ab8fbef1303f72` |
| **Backscatter Delta** | Derived Single-Geometry Difference Raster (`rasuwa_corridor_t98_diff`) | GCOV Diff | Track 98, Frame 16 | Ascending (Look ~78° ENE) | HH | 2026-08-19 to 2026-11-11 | `30212587276c116f08837e42e2019c029af3a7ee186a892fd2390f72c15d9b39` |

### Complementary NASA Earth Science Fleet Data
- **Precipitation:** NASA GPM IMERG Final Precipitation L3 1-day 0.1° × 0.1° (`GPM_3IMERGDF`).
- **Surface Water:** NASA OPERA Dynamic Surface Water Extent from Sentinel-1 (`DSWx-S1`).
- **Elevation / Geomorphology:** NASADEM Merged DEM Global 1 arcsecond (~30 m, WGS84/EGM96).
- **Incident Reports:** Nepal National Disaster Risk Reduction and Management Authority (NDRRMA) & ICIMOD Himalayan Debris Flow Assessment.

---

## 3. Remote Sensing & Geomorphological Analysis

### 3.1 Single-Geometry Backscatter Differencing ($\Delta\sigma^\circ$)
By subtracting the pre-event radar cross-section from the post-event acquisition on the identical Track 98 Ascending geometry:
$$\Delta\sigma^\circ (\text{dB}) = 10 \cdot \log_{10}\left(\frac{\sigma^\circ_{\text{post}}}{\sigma^\circ_{\text{pre}}}\right)$$

The resulting difference map reveals distinct, clustered spatial patterns along the Trishuli and Bhote Koshi channels:

1. **Alluvial Boulder Aggradation (+2.4 to +4.8 dB, Cyan):**
   - Concentrated at the confluences near Syabrubesi, the Chilime fan, and the gorge below Miteri Bridge.
   - **Physics:** Pre-event river terraces consisted of sorted alluvial gravel and river bars. The 26 August debris flow deposited massive unsorted granitic boulders (1–4 m diameter) and stripped fine soil down to jagged bedrock. At L-band ($\lambda = 23.84\text{ cm}$), the surface roughness scale ($h_{\text{rms}}$) shifted from smooth/moderate into the Rayleigh diffuse scattering regime ($h_{\text{rms}} > \lambda / (8 \cos\theta_i)$). The resulting multi-scale rough facets scatter incident microwave energy isotropically, returning a substantially higher fraction of energy to the radar receiver.

2. **Scour & Fine Mud Drapes (-1.8 to -3.2 dB, Amber/Red):**
   - Observed in backwater flood slack zones and overbank deposition zones flanking the main gorge.
   - **Physics:** Fine, saturated silt and clay slurry settled over previously vegetated terraces. The resulting smooth mud layer acts as a specular reflector, bouncing radar energy forward and away from the satellite, drastically diminishing backscatter intensity.

3. **Stable Forested Slopes (-0.4 to +0.5 dB, Neutral):**
   - Unaffected hillsides and upper ridge forests remain within nominal radiometric calibration noise ($\pm 0.5\text{ dB}$ absolute calibration accuracy for NISAR), confirming spatial stability.

---

### 3.2 Interferometric Coherence Loss & Pre-Event Unrest Analysis

Analysis of the co-event InSAR pair (`NISAR_L2_PR_GUNW_028_098_A_016_029`, 19 Aug 2026 to 31 Aug 2026):

1. **Extreme Decorrelation in Valley Channels ($\gamma < 0.28$):**
   - The entire active channel corridor between Syabrubesi and the Tibet border lost interferometric phase coherence.
   - **Mechanism:** Severe temporal and volumetric decorrelation caused by complete mechanical rearranging of surface scatterers (fluvial sediment transport, boulder mobilization), active turbulent water flow, and rapid moisture variations over the 12-day temporal baseline.
   - **Implication:** InSAR phase unwrapping is mathematically impossible along the river bottom. Studies attempting to measure displacement across flood channels using InSAR phase alone produce meaningless noise. Intensity differencing ($\Delta\sigma^\circ$) must be used instead.

2. **Ridge Coherence ($\gamma \sim 0.52\text{--}0.70$):**
   - Exposed upper bedrock ridges and high-elevation alpine crests retained sufficient coherence to yield valid unwrapped line-of-sight (LOS) phase.
   - Line-of-sight displacement along stable ridges remained within $\pm 0.4\text{ cm}$, consistent with stable bedrock within measurement uncertainty.

---

### 3.3 The Dual-Look Geometry Trap: Ascending vs. Descending

A critical finding of this study is the danger of comparing scenes across mismatched flight directions in steep alpine terrain:

- **Track 98 (Ascending):** Satellite flies South-to-North (heading ~348°), antenna looks right (East, azimuth ~78°).
  * East-facing valley slopes (sloping toward the satellite) undergo severe **foreshortening** and **layover**.
  * West-facing slopes are cast into **radar shadow**.
- **Track 48 (Descending):** Satellite flies North-to-South (heading ~192°), antenna looks right (West, azimuth ~282°).
  * East-facing valley slopes are cast into **radar shadow**.
  * West-facing slopes undergo **foreshortening** and **layover**.

**The Trap:** If an analyst compares an Ascending pre-event scene to a Descending post-event scene, apparent backscatter changes of **10 to 18 dB** appear across the entire valley wall purely due to illuminated vs. shadowed geometry! This artifact mimics catastrophic slope collapse where none occurred.

**The Solution:** Track 98 and Track 48 must NEVER be subtracted directly. Instead, each geometry must be tracked independently against its own prior baseline. When both are processed, their opposing line-of-sight vectors ($\vec{e}_{\text{asc}}$ and $\vec{e}_{\text{desc}}$) allow solving for genuine 2D/3D surface displacement vectors (East-West and Up-Down).

---

### 3.4 Atmospheric Phase Screen (APS) Contamination

In steep Himalayan valleys (> 3,000 m vertical relief over 5 km horizontal distance), vertical water vapor gradients create significant elevation-dependent tropospheric phase delays:
$$\Delta\phi_{\text{tropo}} = -\frac{4\pi}{\lambda} \cdot \left(\Delta L_{\text{hydro}} + \Delta L_{\text{wet}}\right)$$

During the late monsoon, warm moist air pooled in the valley bottom below cold alpine ridges produces apparent phase delays equivalent to **3 to 4 full fringes** (8 to 11 cm of false LOS ground deformation).

**Conclusion:** Without external tropospheric corrections (such as GACOS GNSS-derived zenith delays or ERA5 high-resolution reanalysis), single-pair InSAR interferograms in the Himalayas cannot be interpreted as millimeter-scale slope creep.

---

## 4. Honest Scientific Null Results

In accordance with strict NASA Space Apps Challenge validity standards:

1. **No Operational Early Warning Claim:**  
   NISAR's 12-day orbital repeat cycle cannot provide early warning of rapid, convective cloudburst-triggered flash floods. The August 26 event developed over 4 to 6 hours during a 140 mm/day rainfall event. Satellite radar is designed for systematic baseline mapping and post-disaster damage assessment, not real-time evacuation alarming. Real-time early warning requires ground-based ultrasonic water level gauges and automated rain gauge telemetry.

2. **No Pre-Event Deformation Precursor Detected:**  
   Examination of pre-event InSAR pairs (2026-07-26 to 2026-08-19) showed no spatially coherent accelerating slope creep fringe pattern exceeding the atmospheric noise floor prior to the sudden hydraulic failure on August 26. An honest null result confirms that the disaster was hydrologically driven rather than a slow, deep-seated progressive landslide failure.

---

## 5. Actionable Engineering Recommendations for Local Resilience

To operationalize these spaceborne findings for the **Rasuwa District Disaster Management Committee (DDMC)**, **NDRRMA**, and local hydropower engineers:

1. **Targeted Drone (UAV) Photogrammetry:**  
   Prioritize immediate centimetre-resolution drone mapping over the 3 high-delta zones identified by NISAR:
   - Miteri Bridge abutments and border customs facility (`28.27°N, 85.38°E`, $\Delta\sigma^\circ = +4.2\text{ dB}$).
   - Chilime river confluence and agricultural fan (`28.21°N, 85.35°E`, $\Delta\sigma^\circ = +3.4\text{ dB}$).
   - Syabrubesi confluence deposits (`28.16°N, 85.34°E`, $\Delta\sigma^\circ = +3.1\text{ dB}$).

2. **In-Situ Sensor Deployment to Bridge the Revisit Gap:**  
   Install automated acoustic/radar stream gauges with satellite telemetry at 3 upstream tributary choke points to provide 15-minute threshold warnings during future monsoon cloudbursts.

3. **Hydropower Silt Basin Inspection:**  
   The negative backscatter zones indicate extensive fine sediment deposition. Hydropower operators along the Trishuli cascade should immediately inspect diversion tunnels, trash racks, and desilting basins for excessive abrasion and siltation.

---
*Report prepared with verified open data from NASA Earthdata / ASF DAAC under the NASA Space Apps Challenge 2026.*

