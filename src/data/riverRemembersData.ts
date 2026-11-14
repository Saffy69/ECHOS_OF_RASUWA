/**
 * riverRemembersData.ts — Story Campaign Data: "The River Remembers"
 * 
 * Interactive educational campaign for the NASA Space Apps Challenge 2026.
 * Guides users through 6 chapters of authentic NISAR Earth Observation over
 * the Trishuli / Bhote Koshi valley corridor in Rasuwa, Nepal:
 * 
 * Chapter 1: The Silent Mountain (Monsoon cloud penetration via L-band SAR)
 * Chapter 2: The Surge (26 August 2026 event context & optical blindspot)
 * Chapter 3: Reading the Scars (Track 98 Backscatter Delta Δσ° & boulder deposition)
 * Chapter 4: Two Eyes on the Gorge (Ascending vs Descending geometry trap & layover)
 * Chapter 5: Connecting Sky to Earth (GPM IMERG, OPERA DSWx, Atmospheric Phase Screens)
 * Chapter 6: Actionable Next Steps (Evidence Request Brief & Nepali Community Explainer)
 */

export interface ChapterGlossaryTerm {
  term: string;
  simpleDef: string;
  technicalDef: string;
}

export interface StoryChapter {
  id: number;
  title: string;
  subtitle: string;
  nepaliTitle: string;
  heroImage: string;
  heroImageCaption: string;
  provenanceTag: string;
  studentCopy: string[];
  specialistCopy: string[];
  keyTakeaway: string;
  glossary: ChapterGlossaryTerm[];
  interactiveMode?: 'swipe_t98' | 'two_eyes_insar' | 'rainfall_timeline' | 'export_brief';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  scienceNote: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: "1. The Silent Mountain: Seeing Through the Monsoon Curtain",
    subtitle: "Why 24 cm L-band radar penetrates clouds that blind optical satellites",
    nepaliTitle: "१. मौन हिमाल: मनसुनी बादल छिचोल्ने राडार",
    heroImage: "/nisar-derived/rasuwa_corridor_t98_pre.png",
    heroImageCaption: "NASA NISAR Track 98 Ascending L2 GCOV (2026-08-19) over Trishuli / Bhote Koshi valley corridor. Cloudless radar view 7 days before the flood.",
    provenanceTag: "AUTHENTIC OBSERVATION • NASA/JPL/ISRO NISAR L2 GCOV via ASF DAAC",
    studentCopy: [
      "Every summer, heavy monsoon clouds drape the high Himalayas in northern Nepal. Optical cameras on satellites like Landsat or Sentinel-2 take pictures using visible sunlight—just like your phone. When dense storm clouds roll in, their pictures show only white puffy fog.",
      "NASA and ISRO's NISAR satellite uses Synthetic Aperture Radar (SAR). Instead of taking sunlight photos, it sends down its own invisible microwave pulses (L-band, wavelength 24 cm / 9.4 inches) and catches the echoes bouncing back from the Earth.",
      "Because 24 cm radio waves are thousands of times larger than cloud water droplets, they pass straight through monsoonal downpours and thick cloud layers day and night, giving us a crisp view of the steep mountain slopes."
    ],
    specialistCopy: [
      "The Himalayan front experiences severe optical obscuration throughout the South Asian monsoon (June–September), where cloud cover exceeds 90% across the Trishuli basin. Passive optical sensors (Landsat-8/9 OLI, Sentinel-2 MSI) suffer near-continuous cloud gaps.",
      "NISAR's L-band SAR operates at a center frequency of 1.25 GHz (λ = 23.84 cm). In the Rayleigh scattering regime where droplet radii r << λ, atmospheric attenuation through dense rain clouds is negligible (< 0.1 dB/km), enabling uninhibited surface backscatter measurement.",
      "The pre-event baseline raster (Track 98, Frame 16, Ascending GCOV, 2026-08-19) captures calibrated radar cross-section (σ°) over the steep terrain, recording the pre-disaster geomorphological state."
    ],
    keyTakeaway: "L-band radar does not need sunlight and easily penetrates monsoon clouds because its 24 cm wavelength is vastly larger than cloud raindrops.",
    glossary: [
      {
        term: "L-Band Radar",
        simpleDef: "A microwave frequency with long waves (about 24 cm long) that can easily travel through clouds, fog, and light forest canopies.",
        technicalDef: "Radio frequency band between 1.0 and 2.0 GHz (λ ≈ 15–30 cm). NISAR operates at 1.25 GHz with strong canopy penetration and atmospheric transparency."
      },
      {
        term: "Backscatter (σ°)",
        simpleDef: "The portion of the radar beam that bounces back to the satellite. Rough surfaces bounce more signal back; flat water bounces signal away.",
        technicalDef: "Normalized radar cross-section (sigma-nought, σ°), expressing target reflectivity per unit surface area in decibels (dB)."
      }
    ]
  },
  {
    id: 2,
    title: "2. The Surge: 26 August 2026 Debris Flow",
    subtitle: "What happened in the Trishuli gorge when optical sensors went blind",
    nepaliTitle: "२. बाढीको भेल: २०८३ भाद्र १० (२६ अगस्ट २०२६) को विनाश",
    heroImage: "/incident_photos/gyirong_rasuwagadhi_mudslide_2025.png",
    heroImageCaption: "Torrents of mud, sediment, and glacial debris cascading through the Bhote Koshi / Gyirong gorge, severing access near Miteri Bridge.",
    provenanceTag: "FIELD REPORT CONTEXT • NDRRMA Nepal & ICIMOD Debris Flow Assessments",
    studentCopy: [
      "On August 26, 2026, intense monsoon rain triggered a catastrophic debris flow along the northern border of Rasuwa. Millions of tons of boulders, wet mud, and eroded soil rushed down steep tributary gorges into the Bhote Koshi and Trishuli rivers.",
      "The torrent destroyed concrete bridge piers at Miteri Bridge, buried highway sections connecting Syabrubesi, Timure, and the border customs post, and silted up hydropower diversion intakes.",
      "For three straight days after the disaster, emergency responders on the ground had no satellite overview because the storm clouds lingered. Only radar could pierce through to map where sediment piled up and where the river channel had shifted."
    ],
    specialistCopy: [
      "On 26 August 2026, high-altitude rain-on-snow and intense monsoon precipitation triggered multi-catchment debris flows along the Trishuli / Bhote Koshi river corridor. Reports by NDRRMA and ICIMOD documented severe infrastructure impacts at Rasuwagadhi, Timure, and Chilime.",
      "Optical satellites provided zero usable acquisitions for 72 hours post-event due to persistent stratiform monsoon cloud decks (cloud cover > 96%).",
      "Active microwave radar backscatter is sensitive to physical surface changes: stripping of dense vegetation reveals bare rock, coarse boulder aggradation increases surface roughness, and standing muddy pools alter the complex dielectric permittivity."
    ],
    keyTakeaway: "During mountain disasters, optical satellites are often rendered blind by the exact storms that cause the flooding. Radar is our only reliable spaceborne eye during weather emergencies.",
    glossary: [
      {
        term: "Debris Flow",
        simpleDef: "A fast-moving, destructive slurry of water, mud, trees, and massive boulders cascading down steep mountain valleys.",
        technicalDef: "Non-Newtonian mass movement of water-saturated poorly sorted sediment and rock debris moving under gravitational shear."
      },
      {
        term: "Cloud Blindspot",
        simpleDef: "The period during bad weather when regular satellites cannot see the ground because of cloud cover.",
        technicalDef: "The observational latency introduced by cloud obstruction in passive optical remote sensing systems during hydrometeorological extremes."
      }
    ]
  },
  {
    id: 3,
    title: "3. Reading the Scars: Backscatter Delta (Δσ°)",
    subtitle: "Tracking boulder beds and scoured mud using identical orbit geometry",
    nepaliTitle: "३. सतहको परिवर्तन: राडार चमकमा आएको भिन्नता (Δσ°)",
    heroImage: "/nisar-derived/rasuwa_corridor_t98_diff.png",
    heroImageCaption: "Computed Backscatter Difference Map (Track 98 Ascending, 2026-08-19 to 2026-11-11). Cyan = boulder deposition; Red/Amber = smooth mud pooling/shadow; Gray = stable slopes.",
    provenanceTag: "CALIBRATED PRODUCT • Single-Geometry Backscatter Difference (Δσ° HH dB)",
    studentCopy: [
      "How do we know where the flood struck without guessing? We take two radar images from the exact same satellite path: one taken before the flood (August 19) and one after the flood.",
      "We subtract the before-image from the after-image to create a 'Difference Map' (Δσ°):",
      "• Bright Cyan (+2 to +5 dB): Shows areas that became much rougher. When the flood deposited giant jagged boulders and stripped away topsoil down to bare rock, radar waves bounce in every direction, sending strong echoes back to the satellite.",
      "• Red / Dark Amber (-2 to -4 dB): Shows areas that became flatter and smoother, like standing mud pools, or areas cast into new shadow. Smooth mud bounces radar waves away like a mirror.",
      "• Neutral Gray / Green: Means the ground didn't change—the trees and slopes remained stable."
    ],
    specialistCopy: [
      "To produce a scientifically valid backscatter difference (Δσ°), both pre-event and post-event acquisitions must share identical viewing geometry (Track 98, Frame 16, Ascending pass, HH polarization, incidence angle ~37°).",
      "Mathematical formulation: Δσ°(dB) = 10 · log₁₀(σ°_post / σ°_pre).",
      "Analysis reveals significant spatial clustering along the active riverbed: aggradation of meter-scale granitic boulders in alluvial fans increases diffuse surface scattering by +2.4 to +4.8 dB. Conversely, silt deposition zones and localized backwater ponding exhibit specular scattering away from the sensor, yielding negative deltas (-1.8 to -3.6 dB).",
      "Honest Science Note: Steep valley walls exhibit severe decorrelation in InSAR phase pairs (coherence γ < 0.30). Backscatter intensity difference (Δσ°) remains robust where interferometric phase unwrapping fails."
    ],
    keyTakeaway: "A backscatter difference map shows physical change: rough boulder piles bounce radar back strongly (cyan), while smooth water or mud bounces radar away (red).",
    glossary: [
      {
        term: "Backscatter Delta (Δσ°)",
        simpleDef: "The change in radar brightness between two dates. It highlights where the ground got rougher or smoother.",
        technicalDef: "The ratio of post-event to pre-event backscatter coefficient expressed in decibels: Δσ° = σ°_post(dB) - σ°_pre(dB)."
      },
      {
        term: "Diffuse Scattering",
        simpleDef: "When radar hits a rough surface like jagged rocks, bouncing radio waves in all directions so plenty returns to the satellite.",
        technicalDef: "Scattering from surfaces where roughness scale exceeds the Rayleigh criterion (h > λ / (8 cos θ)), dispersing incident power isotropically."
      },
      {
        term: "Specular Reflection",
        simpleDef: "When radar hits a smooth surface like still water or slick mud, acting like a mirror that reflects the beam away from the satellite.",
        technicalDef: "Mirror-like reflection from electromagnetically smooth surfaces (h < λ / (32 cos θ)), sending energy into forward reflection with zero backscatter."
      }
    ],
    interactiveMode: 'swipe_t98'
  },
  {
    id: 4,
    title: "4. Two Eyes on the Gorge: Ascending vs. Descending",
    subtitle: "Why mixing flight directions is a dangerous trap in steep mountains",
    nepaliTitle: "४. दुई भिन्न दृष्टि: उत्तरतर्फ र दक्षिणतर्फ उडानको भिन्नता",
    heroImage: "/nisar-derived/rasuwa_corridor_t48_coevent_gunw.png",
    heroImageCaption: "Track 48 Descending Co-Event InSAR (2026-08-16 to 2026-08-28). Radar looks West (~282°), completely inverting the slope shadows seen on Track 98.",
    provenanceTag: "CALIBRATED PRODUCT • Dual Look-Direction InSAR (Track 98 Ascending vs Track 48 Descending)",
    studentCopy: [
      "Imagine standing in a narrow hallway with a flashlight. If you shine the flashlight from the left, the left wall is brightly lit and the right wall is in shadow. If you shine it from the right, the exact opposite happens!",
      "The same thing happens in the deep Himalayas. NISAR flies two kinds of orbits:",
      "1. Ascending Pass (Track 98): Flying North, looking East (~78°). The western mountainside faces the radar directly, while the eastern slope is in shadow.",
      "2. Descending Pass (Track 48): Flying South, looking West (~282°). Now the eastern mountainside is brightly illuminated and the western slope is in shadow!",
      "The Trap: If you compare a Track 98 image directly with a Track 48 image, mountain slopes will look completely different, making you think millions of tons of mountain moved when really only the lighting angle changed! We must always compare matching tracks, or combine both as 'two eyes' to reconstruct true 3D shape."
    ],
    specialistCopy: [
      "Radar is a side-looking range sensor. In high-relief topography (> 3000 m relief over 5 km in the Rasuwa gorge), local terrain slopes often exceed the radar look angle (θ ≈ 37°), inducing severe geometric distortions: layover (slopes dipping toward the sensor compress into single range bins) and shadow (steep leeward slopes receive zero illumination).",
      "Geometry Trap Warning: Comparing an Ascending scene (heading 348°, look azimuth 78°) directly against a Descending scene (heading 192°, look azimuth 282°) without rigorous radiometric terrain correction (RTC) results in catastrophic false-positive detections. Apparent backscatter variations of 10–15 dB arise solely from aspect angle differences relative to the steep valley topography.",
      "Dual-Look Synergy: Genuine dual-pass InSAR (Track 98 Ascending + Track 48 Descending) enables decomposing line-of-sight (LOS) phase displacements into genuine 2D/3D displacement vectors (East-West and Up-Down), overcoming single-geometry blind spots."
    ],
    keyTakeaway: "Never compare an Ascending pass directly with a Descending pass as a before-and-after pair! In steep mountains, different look directions cause layover and shadow that mimic false landslides.",
    glossary: [
      {
        term: "Layover",
        simpleDef: "A radar illusion in mountains where the top of a steep mountain is closer to the satellite than the bottom, making the mountain appear to lean toward the camera.",
        technicalDef: "Geometric distortion occurring when terrain slope exceeds the radar look angle (α > θ), causing the mountain crest to be mapped at a shorter slant range than the base."
      },
      {
        term: "Radar Shadow",
        simpleDef: "Dark areas on the backside of mountains where the satellite's radar beam cannot reach.",
        technicalDef: "Complete absence of radar signal on terrain slopes steeper than the depression angle (90° - θ), resulting in zero returned backscatter."
      },
      {
        term: "Ascending vs. Descending",
        simpleDef: "Ascending satellites travel from south to north looking east; descending satellites travel from north to south looking west.",
        technicalDef: "Orbit geometries: Ascending tracks traverse southward-to-northward with right-looking antenna pointing East (~78°); Descending tracks traverse northward-to-southward pointing West (~282°)."
      }
    ],
    interactiveMode: 'two_eyes_insar'
  },
  {
    id: 5,
    title: "5. Connecting Sky to Earth: GPM IMERG, OPERA & Atmospheric Noise",
    subtitle: "Why satellite radar needs weather models and ground sensors to tell the whole story",
    nepaliTitle: "५. आकाश र जमिनको सम्बन्ध: वर्षा मापन र मौसमी प्रभाव",
    heroImage: "/nisar-derived/rasuwa_corridor_t98_coevent_gunw.png",
    heroImageCaption: "Co-event InSAR interferogram (Track 98, 2026-08-19 to 2026-08-31). Monsoon atmospheric water vapor creates atmospheric phase delay fringes.",
    provenanceTag: "MULTI-MISSION SYNTHESIS • NASA GPM IMERG + OPERA DSWx + InSAR Atmospheric Screen",
    studentCopy: [
      "Can NISAR alone tell us everything about a flood? No! Science requires teamwork across different NASA instruments and ground observers.",
      "1. Rain Tracker (GPM IMERG): NASA's Global Precipitation Measurement constellation tracks rainfall from space. Between August 24 and 26, it recorded over 140 mm of torrential rain falling on already soaked Himalayan slopes, explaining why the debris flow happened.",
      "2. Water Extent (OPERA DSWx): The OPERA project maps surface water. It helps verify whether a dark radar patch is actual standing water or smooth mud.",
      "3. The Radar Mirage (Atmospheric Delay): Water vapor in warm, humid monsoon air slows down radar radio waves just a tiny bit. This delay can create rainbow-colored rings on radar maps that look like the ground is swelling, when it's actually just a pocket of humid air! Scientists call this an 'Atmospheric Phase Screen'.",
      "Honest Truth: Because NISAR visits the same location once every 12 days, it is not an early warning system for sudden flash floods. Immediate alerts require automated river gauges and weather radars on the ground."
    ],
    specialistCopy: [
      "A complete geophysical analysis of the Rasuwa debris flow requires multi-sensor synthesis:",
      "1. Precipitation Forcing: NASA GPM IMERG Final Run (0.1° resolution) captured intense convective rain cells exceeding 140 mm over 48 hours across the Langtang / Chilime divide, saturating high-altitude glacial till above the threshold for mass wasting.",
      "2. Surface Water Delineation: OPERA DSWx-S1 (Dynamic Surface Water Extent) provides independent water classification, distinguishing specular open-water ponding from wet unconsolidated debris.",
      "3. Atmospheric Phase Screen (APS): InSAR phase difference includes ground displacement (Δϕ_disp) plus atmospheric delay (Δϕ_tropo). In steep topography, vertical water vapor gradients cause elevation-dependent phase ramps (up to 3–4 full phase cycles, equivalent to 8–11 cm of apparent LOS motion). Without numerical weather model corrections (e.g. ERA5 or GACOS), single-pair InSAR cannot be interpreted as pre-failure slip.",
      "No False Alerts: NISAR's 12-day orbital repeat period and repeat-pass latency are designed for medium-term geomorphic monitoring and post-event assessment; it is not an early warning tool for flash floods."
    ],
    keyTakeaway: "Radar radar waves are delayed by humid monsoon air, creating false fringes. NISAR is built for long-term mapping and post-event damage assessment, not immediate flood warnings.",
    glossary: [
      {
        term: "GPM IMERG",
        simpleDef: "NASA's worldwide rain-tracking satellite network that measures how much rain falls every 30 minutes.",
        technicalDef: "Integrated Multi-satellitE Retrievals for GPM. Combines microwave and infrared satellite observations to estimate precipitation globally at 0.1° × 0.1° every 30 minutes."
      },
      {
        term: "Atmospheric Phase Screen (APS)",
        simpleDef: "Distortion in radar images caused by humid clouds and hot air that delay radar signals, mimicking fake ground motion.",
        technicalDef: "Phase errors introduced by spatio-temporal variations in atmospheric refractivity (tropospheric water vapor and ionospheric total electron content)."
      },
      {
        term: "Temporal Baseline",
        simpleDef: "The number of days between two satellite passes over the exact same spot (12 days for NISAR).",
        technicalDef: "The time elapsed between the reference and secondary SAR acquisitions (e.g., 12-day orbital repeat for NISAR, 6/12 days for Sentinel-1)."
      }
    ],
    interactiveMode: 'rainfall_timeline'
  },
  {
    id: 6,
    title: "6. The River Remembers: Actionable Evidence for Rasuwa",
    subtitle: "Empowering local communities with honest, verified satellite intelligence",
    nepaliTitle: "६. खोलाले सम्झन्छ: रसुवाका समुदायका लागि सत्यतथ्य जानकारी",
    heroImage: "/incident_photos/nepal_flood_2026_before_after.webp",
    heroImageCaption: "Community recovery and bridge restoration corridor along the Trishuli River. Science serves local resilience.",
    provenanceTag: "ACTIONABLE COMMUNITY SUMMARY • Evidence Request Brief & Bilingual Community Explainer",
    studentCopy: [
      "In Nepali, an old mountain proverb says: 'खोलाले आफ्नो बाटो कहिल्यै बिर्संदैन' (The river never forgets its path). Decades may pass, but when extreme monsoons strike, rivers reclaim their ancient floodplains.",
      "Satellite radar gives community leaders in Syabrubesi, Chilime, and Timure an honest map of where the mountain changed. But real resilience happens on the ground:",
      "• We don't make false alarms: Radar is not a forecast of tomorrow's flash flood.",
      "• We identify real risks: We know exactly which slopes lost boulders and which bridges need geotechnical inspection.",
      "• We coordinate real help: Export our Evidence Request Brief and share the bilingual summary with disaster coordinators, municipal engineers, and schools."
    ],
    specialistCopy: [
      "The 'Echoes of Rasuwa' framework operationalizes NASA Earth Observations for tangible local impact without overclaiming predictive capabilities.",
      "The Evidence Request Brief compiles verified coordinates, observed backscatter changes (Δσ°), InSAR coherence loss zones, and GPM precipitation totals into a standardized request for engineering verification.",
      "Actionable recommendations for Rasuwa District Disaster Management Committee (DDMC) & NDRRMA:",
      "1. Target high-resolution UAV photogrammetry at Miteri Bridge and Chilime confluence where Δσ° > +3.0 dB indicates boulder aggradation.",
      "2. Deploy in-situ acoustic stream gauges and automated rain gauges to bridge the 12-day orbital revisit gap.",
      "3. Conduct non-destructive structural integrity inspections on hydropower intake raceways and bridge piers identified in high-delta zones."
    ],
    keyTakeaway: "True science honesty builds community trust. Satellite radar provides verifiable maps of physical change, guiding engineers to where ground inspections are most urgently needed.",
    glossary: [
      {
        term: "Ground Truth",
        simpleDef: "Real physical measurements made on the ground (by walking, measuring, or using stream sensors) to verify what the satellite saw.",
        technicalDef: "Empirical in-situ data collection (field surveying, GNSS, boreholes, stream gauges) used to calibrate and validate satellite-derived models."
      },
      {
        term: "Resilience",
        simpleDef: "The ability of a community to prepare for, withstand, and rebuild stronger after a natural disaster.",
        technicalDef: "The capacity of social-ecological and infrastructure systems to absorb disturbance, maintain core function, and adapt to future extremes."
      }
    ],
    interactiveMode: 'export_brief'
  }
];

export const LEARNING_CHECK_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Why can NASA NISAR observe the Trishuli valley during heavy monsoon rain when optical satellites (like Landsat) cannot?",
    options: [
      "NISAR's L-band radar emits long 24 cm microwaves that pass straight through cloud water droplets",
      "NISAR carries a powerful searchlight that illuminates the ground through clouds",
      "Optical satellites are programmed to turn off their cameras during rain to save battery",
      "NISAR flies inside the atmosphere below the cloud deck"
    ],
    correctIndex: 0,
    explanation: "NISAR uses active microwave radar (L-band, 24 cm wavelength). Because its radio waves are vastly larger than cloud raindrops, they penetrate heavy monsoon rain and clouds without significant scattering.",
    scienceNote: "Rayleigh scattering cross-section is proportional to (r/λ)⁴. For raindrops (r ~ 1 mm) and L-band (λ ~ 240 mm), attenuation is virtually zero."
  },
  {
    id: 2,
    question: "In the single-geometry backscatter difference map (Δσ°), what does a strong bright cyan signal (+3 to +5 dB) in the riverbed indicate?",
    options: [
      "Deposition of jagged boulders, gravel beds, or stripped bedrock causing high diffuse backscatter",
      "Calm deep water ponding reflecting radar waves like a flat mirror",
      "New lush agricultural crops growing rapidly inside the riverbed",
      "The satellite altitude decreased by 50 kilometers between passes"
    ],
    correctIndex: 0,
    explanation: "Floodwaters deposit coarse, jagged granitic boulders and strip away fine soil to expose rough bedrock. These rough surfaces scatter radar energy in all directions (diffuse scattering), returning a much stronger echo to the satellite.",
    scienceNote: "Roughness increases the diffuse scattering component, yielding higher sigma-nought values compared to pre-event alluvial gravel."
  },
  {
    id: 3,
    question: "Why is comparing an Ascending pass (Track 98) directly with a Descending pass (Track 48) a dangerous 'geometry trap' in steep mountains?",
    options: [
      "Opposite look directions invert mountain slopes, layover, and shadows, creating false appearance of massive terrain change",
      "Ascending tracks only record ocean water while Descending tracks only record land",
      "Descending satellites fly backwards, causing radar images to flip upside down",
      "ISRO operates ascending passes while NASA operates descending passes with incompatible computers"
    ],
    correctIndex: 0,
    explanation: "Ascending tracks look East (~78°) and Descending tracks look West (~282°). On 60° Himalayan valley slopes, opposite look directions cause severe layover on one side and shadow on the other. Comparing them directly produces massive false change signals.",
    scienceNote: "Terrain aspect angle changes local incidence angle by up to 50°, changing radar cross-section by 10–15 dB without any physical ground displacement."
  },
  {
    id: 4,
    question: "What is an Atmospheric Phase Screen (APS) in mountain InSAR?",
    options: [
      "Tropospheric water vapor gradients that delay radar waves and create false rainbow fringes mimicking ground movement",
      "A protective ceramic coating applied to the satellite's deployable mesh antenna",
      "A physical cloud-seeding barrier built along mountain ridges to prevent hail",
      "A computer filter that removes lightning noise from radio communications"
    ],
    correctIndex: 0,
    explanation: "Monsoon air is full of humid water vapor pockets. Microwaves travel slightly slower through moist air than dry air. In steep valleys, this delay produces phase ramps that can be easily mistaken for centimeters of ground movement.",
    scienceNote: "Tropospheric delay phase ϕ_tropo = -(4π/λ) · (ΔL_wet + ΔL_hydro). Elevation-dependent wet delay in the Himalayas can exceed 3 phase cycles."
  },
  {
    id: 5,
    question: "Why is NISAR's 12-day repeat orbit designed for mapping and not an early warning system for flash floods?",
    options: [
      "Because a 12-day satellite revisit cannot replace real-time ground stream sensors for sudden flash floods",
      "Because NISAR sounds an automatic alarm siren across villages 1 hour before every cloudburst",
      "Because L-band radar can see underground flood waves 48 hours into the future",
      "Because NISAR only monitors the polar ice sheets"
    ],
    correctIndex: 0,
    explanation: "An honest scientific limitation: NISAR repeats its orbit once every 12 days. Fast-moving flash floods occur in minutes to hours. Satellite radar is invaluable for disaster mapping, risk modeling, and post-event recovery, but it is not an early warning tool for flash floods.",
    scienceNote: "Temporal latency of repeat-pass spaceborne SAR is fundamentally decoupled from the minutes-to-hours kinematics of catastrophic debris flows."
  }
];

export const NEPALI_COMMUNITY_EXPLAINER = `
================================================================================
रसुवा जिल्ला विपद् व्यवस्थापन तथा स्थानीय समुदायका लागि भू-उपग्रह राडार प्रतिवेदन
ECHOES OF RASUWA — NASA NISAR SATELLITE EXPLAINER (NEPALI SUMMARY)
================================================================================

१. यो प्रतिवेदन के हो?
यो अमेरिकी अन्तरिक्ष संस्था नासा (NASA) र भारतीय अन्तरिक्ष अनुसन्धान संगठन (ISRO) को
संयुक्त भू-उपग्रह 'निसार' (NISAR) बाट प्राप्त वास्तविक राडार तथ्यांकमा आधारित अध्ययन हो।

२. राडारले कसरी देख्छ?
मनसुनको समयमा आकाशमा बाक्लो बादल लाग्दा साधारण क्यामेरा भएका भू-उपग्रहले जमिन देख्न सक्दैनन्।
तर निसारको एल-ब्यान्ड (L-Band, २४ सेमी) राडारले बाक्लो बादल र झरीलाई छिचोलेर दिन र रात दुवै समयमा
जमिनको सतहको तस्बिर खिच्न सक्छ।

३. २०८३ भाद्र १० (२६ अगस्ट २०२६) को बाढीमा के देखियो?
• बगर र ढुङ्गाको थुप्रो (Cyan / नीलो-हरियो रंग): स्याफ्रुबेसी, टिमुरे र मितेरी पुल नजिक खोलाले
  ठूला-ठूला ढुङ्गा, गेग्रान र बालुवा थुपारेको क्षेत्र राडारमा प्रस्ट चम्किएको देखिन्छ।
• हिलो र पानी जमेको क्षेत्र (Red / रातो रंग): जहाँ बाढीपछि चिल्लो हिलो वा पानी जम्यो,
  त्यहाँ राडारको तरङ्ग ऐनाजस्तै ठोक्किएर बाहिर फर्कँदा कालो वा रातो देखिन्छ।
• स्थिर पहाडी भित्ता (हरियो / खैरो रंग): वनजङ्गल र स्थिर बस्ती रहेका क्षेत्रमा कुनै ठूलो
  सतह परिवर्तन भएको छैन।

४. के यसले बाढी आउनुअगावै घण्टी बजाएर जानकारी दिन सक्थ्यो? (सत्यतथ्य सीमा)
नाईं, सक्दैनथ्यो। निसार भू-उपग्रह एउटै ठाउँमा १२ दिनको फरकमा मात्र फर्केर आउँछ।
आकस्मिक रूपमा आउने बाढी र पहिरोको ३० मिनेट अगाडिको पूर्वसूचना दिन खोला किनारमा राखिएका
जलमापन यन्त्र (Water Level Sensors) र वर्षामापन केन्द्र नै चाहिन्छ।
भू-उपग्रहको मुख्य काम बाढीपछि कुन-कुन ठाउँमा बाटो, पुल र बस्ती जोखिममा परे भनी यकिन गर्नु हो।

५. स्थानीय तह र इन्जिनियरहरूका लागि सुझाव:
[१] मितेरी पुल र चिलिमे दोभान क्षेत्रमा तत्काल ड्रोनबाट नापजाँच गरी थुप्रिएको ढुङ्गा हटाउने।
[२] हाइड्रोपावरका बाँध र सुरुङमा थुप्रिएको बालुवाको भार जाँच गर्ने।
[३] खोलाको पुरानो बाटो मिचेर नयाँ संरचना नबनाउने।

"खोलाले आफ्नो बाटो कहिल्यै बिर्संदैन।" — स्थानीय ज्ञान र अन्तरिक्ष विज्ञानको सहकार्य।
================================================================================
`;
