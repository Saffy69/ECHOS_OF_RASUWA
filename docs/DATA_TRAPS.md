# InSAR & Radar Remote Sensing Pitfalls: The Four Critical Data Traps

**Project:** Echoes of Rasuwa: Global Waltz ("Dancing with SAR")  
**NASA Space Apps Challenge 2026:** Dancing with the SARs  
**Author:** Science & Geospatial Data Engineering Team  

---

## Executive Summary for Judges

Synthetic Aperture Radar (SAR) and Repeat-Pass Interferometric SAR (InSAR) provide unmatched capabilities to observe Earth's dynamic surface through clouds and darkness. However, radar is not an optical photograph. Radar measures complex backscatter amplitude and phase along the slant-range line-of-sight (LOS). Interpreting raw radar data without rigorous physical safeguards leads to classic data traps.

This document outlines the four fundamental pitfalls that any rigorous scientific application must navigate, and details how our platform explicitly handles each one.

```
                    ┌─────────────────────────────────────────┐
                    │      THE FOUR InSAR DATA TRAPS          │
                    └────────────────────┬────────────────────┘
                                         │
     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
     │                   │                               │                   │
┌────┴────────────┐ ┌────┴────────────┐            ┌─────┴───────────┐ ┌─────┴───────────┐
│ 1. GEOMETRY     │ │ 2. PHASE        │            │ 3. LAYOVER &    │ │ 4. ATMOSPHERIC   │
│    MISMATCH     │ │    DECORRELATION│            │    SHADOW       │ │    PHASE SCREEN  │
│ (Asc vs Desc)   │ │ (Noise as Signal│            │ (Steep Relief)  │ │ (Water Vapor)    │
└─────────────────┘ └─────────────────┘            └─────────────────┘ └──────────────────┘
```

---

## 1. Geometry Mismatch Trap (Ascending vs. Descending Tracks)

### The Physical Trap
A radar satellite does not look straight down (nadir); it looks side-looking at an off-nadir angle (typically $30^\circ$–$45^\circ$).
- **Ascending Pass:** Satellite travels South-to-North and looks East/North-East.
- **Descending Pass:** Satellite travels North-to-South and looks West/South-West.

If an analyst naively compares an Ascending acquisition with a Descending acquisition, the target surface is illuminated from opposite azimuth and range directions:
1. **LOS Vector Inversion:** Eastward ground movement decreases the distance to an Ascending sensor (apparent uplift/shortening) but increases the distance to a Descending sensor (apparent subsidence/lengthening).
2. **Backscatter Discrepancy:** Surface slope orientation relative to look angle creates massive natural radiometric differences that do not represent physical ground change.
3. **Interferometric Impossibility:** Standard repeat-pass InSAR requires identical orbital geometry within a tight orbital baseline tube (for NISAR, controlled to within a narrow flight tube). Mixing passes produces total spatial baseline decorrelation.

### How Our Platform Handles It
- **Strict Single-Geometry Repeat Series:** In Rasuwa, Nepal, our multi-temporal tracking hero series strictly isolates **Track 98, Frame 16, Ascending** across all 11 passes (from July to November 2026) at 12-day orbital intervals.
- **Separate Descending Granules:** Descending acquisitions (e.g. Track 48 Frame 74) are catalogued separately and never differenced against Ascending passes in repeat-pass analysis.
- **UI Warning:** When switching geometry or viewing across passes, the platform displays the track, frame, and look direction explicitly.

---

## 2. Phase Decorrelation Trap (Interpreting Noise as Motion)

### The Physical Trap
InSAR measures ground deformation by differencing the phase ($\Delta\phi$) of two co-registered complex SAR images acquired at times $t_1$ and $t_2$:
$$\Delta\phi = \phi_{\text{def}} + \phi_{\text{topo}} + \phi_{\text{atm}} + \phi_{\text{orbit}} + \phi_{\text{noise}}$$

The quality of the interferometric phase is measured by **complex coherence** ($\gamma$), where $0 \le \gamma \le 1$:
$$\gamma = \frac{|\langle s_1 s_2^* \rangle|}{\sqrt{\langle |s_1|^2 \rangle \langle |s_2|^2 \rangle}}$$

When scatterers within a resolution cell rearrange (due to heavy rain, agricultural plowing, dense windblown vegetation, river scouring, or rapid catastrophic landslide mass wasting), $\gamma \to 0$. In decorrelated pixels, the wrapped phase distribution is completely uniform across $[-\pi, +\pi]$. Naively "unwrapping" noise creates wild, spurious displacement gradients of tens of centimeters.

### How Our Platform Handles It
- **Coherence Gating:** In our geodetic cursor and attention scoring algorithms, pixels with coherence $\gamma < 0.25$ are marked as `DECORRELATED / UNRELIABLE` rather than calculating spurious displacements.
- **Physical Interpretation of Decorrelation:** We treat decorrelation as an informative signal in itself—catastrophic mass-wasting scars and flash flood scour zones exhibit abrupt drop in coherence ($\Delta\gamma > 0.40$), which our attention score incorporates into the multi-factor screening.
- **L-Band Resilience:** NISAR's $24\text{ cm}$ L-band wavelength penetrates dense forest canopy and soil surface roughness far better than C-band ($5.6\text{ cm}$) or X-band ($3.1\text{ cm}$), maintaining higher temporal coherence over vegetated rural terrain.

---

## 3. Geometric Distortion Trap (Layover and Shadow in Steep Relief)

### The Physical Trap
Radar measures distance in time of arrival (slant range). In mountainous terrain such as the Himalayas (Langtang and Rasuwa ranges, where relief varies from $1,400\text{ m}$ to $>7,000\text{ m}$ across just $15\text{ km}$):
- **Layover:** When the slope facing the satellite is steeper than the radar look angle, the mountain top is closer to the satellite than the mountain base. The top is received *before* the bottom, compressing and flipping the entire mountainside into a bright, collapsed radiometric band where phase cannot be unwrapped.
- **Foreshortening:** Facing slopes appear heavily compressed in slant range compared to ground distance.
- **Radar Shadow:** Slopes sloping away from the radar that are steeper than $90^\circ - \theta$ receive no radar illumination. They appear as black, zero-signal voids.

### How Our Platform Handles It
- **Explicit DEM Simulation & 3D Extrusion:** In 3D terrain mode, we extrude real regional DEMs and project the line-of-sight radar incidence vector, visually demonstrating where steep canyon walls obstruct or distort radar line-of-sight.
- **Complementary Data Mandate:** We explicitly declare in our scientific limitations banner that radar observations in steep V-shaped canyons must be verified with optical satellite imagery (e.g. Landsat/Sentinel-2 via NASA GIBS), terrestrial seismic networks, and field corner reflectors.

---

## 4. Atmospheric Phase Screen (APS) Trap

### The Physical Trap
Radar waves traverse the troposphere and ionosphere twice. The tropospheric delay is governed by temperature, pressure, and, most crucially, spatial variations in **water vapor**:
$$\Delta\phi_{\text{tropo}} = \frac{4\pi}{\lambda \cos\theta} \int (n - 1) \, dz$$

A localized pocket of humid air or monsoon convective cloud can introduce a 2–10 cm apparent phase shift across a 10 km valley. In a single interferogram, **tropospheric water vapor delay is mathematically indistinguishable from ground deformation.**

Mistaking an atmospheric phase screen for an impending slope collapse is one of the most common mistakes in disaster remote sensing.

### How Our Platform Handles It
- **Multi-Temporal Repeat Tracking:** Rather than evaluating an isolated two-pass pair, our pipeline provides an 11-pass repeat series at 12-day orbit intervals. Persistent ground motion accumulates linearly or monotonically over multiple cycles, whereas atmospheric turbulence decorrelates randomly from pass to pass.
- **NASA POWER Meteorological Fusion:** We query the NASA POWER meteorological API for climatological precipitation and surface wetness indices, contextualizing whether an apparent phase gradient coincides with extreme atmospheric moisture events.
- **Educational Disclaimers:** The interface explicitly warns users that a single-pass apparent fringe gradient requires multi-temporal stacking or weather model correction (e.g. GACOS) before being treated as physical surface displacement.

---

## Summary Matrix

| Data Trap | Root Physics | Naive Misinterpretation | How Platform Protects Judges & Users |
| :--- | :--- | :--- | :--- |
| **1. Geometry Mismatch** | Opposite look vectors & incidence angles | False apparent change or wrong motion sign | Enforces single-track repeat series (Track 98 Frame 16 Ascending) |
| **2. Phase Decorrelation** | Scatterer redistribution destroying phase | Unwrapping noise as massive displacement | Coherence gating ($\gamma < 0.25$ masked); treats decorrelation as scar proxy |
| **3. Layover & Shadow** | Slant-range time inversion on steep slopes | Inverted terrain and signal-less shadow voids | 3D look-angle projection & complementary optical sensor fusion mandate |
| **4. Atmospheric Phase Screen** | Tropospheric water vapor delay | Cloud humidity mistaken for tectonic motion | 11-pass multi-temporal series, POWER weather context & stacking disclosure |

*Echoes of Rasuwa: Global Waltz — NASA Space Apps Challenge 2026*

