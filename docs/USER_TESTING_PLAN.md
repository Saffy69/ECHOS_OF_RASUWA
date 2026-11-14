# User Testing & Educational Evaluation Plan
## Project: Echoes of Rasuwa: Global Waltz (Submission: "Dancing with SAR")
**NASA International Space Apps Challenge 2026 — Challenge: "Dancing with the SARs"**  
**Component Evaluated:** "The River Remembers" Educational Campaign & Interactive Radar Tools  
**Document Version:** 1.0 (2026-11-14)  

---

## 1. Objectives & Overview

The goal of this evaluation plan is to test and validate whether "Echoes of Rasuwa" successfully achieves its two core missions:
1. **Educational Impact:** Can a non-technical learner (Grade 8+) understand the fundamental principles of spaceborne Synthetic Aperture Radar (SAR), microwave cloud penetration, viewing geometry, and multi-sensor validation?
2. **Scientific Honesty & Validity:** Does the user clearly comprehend the strict physical boundaries of satellite observations—specifically that a 12-day repeat radar satellite cannot provide real-time flash flood early warnings, and that naive subtraction across opposing look angles produces false signals?

---

## 2. Participant Profiles & Sample Size

We evaluate a target cohort of **8 to 12 participants** spanning three distinct user personas:

| Persona | Description | Sample Size | Primary Evaluation Focus |
|---|---|---|---|
| **A. Secondary Student (Grade 8–12)** | General science background; no prior remote sensing or radar exposure. | 4 participants | Clarity of language, engagement, analogical explanations (flashlight, microwave oven), comprehension growth. |
| **B. Community Planner / Municipal Responder** | Local administrative or disaster preparedness background; practical orientation. | 4 participants | Utility of the Evidence Request Brief, bilingual Nepali explainer, and understanding of ground truth needs. |
| **C. Geospatial / Science Educator** | Environmental science teacher or GIS specialist. | 2–4 participants | Scientific fidelity, correctness of SAR physics, avoidance of false claims, pedagogical pacing. |

---

## 3. Protocol & Test Procedure

The test session lasts approximately **30 to 40 minutes** per participant and follows a 5-step structured protocol:

```
[ Step 1: Pre-Test ]  ──► [ Step 2: Guided Story ]  ──► [ Step 3: Interactive Tasks ]  ──► [ Step 4: Post-Test ]  ──► [ Step 5: SUS & Feedback ]
   (5 Diagnostic Qs)         (6 Chapters Campaign)          (Swipe & Geometry Tools)         (Growth Metric)           (Usability Scale)
```

### Step 1: Pre-Test Knowledge Assessment (5 minutes)
Before launching the story or interacting with the satellite data, participants complete the 5-question baseline assessment embedded in the application:
1. *Why can radar penetrate clouds while optical cameras cannot?*
2. *What does a bright cyan return (+3 dB) in a riverbed mean after a flood?*
3. *Why is comparing an Ascending pass directly with a Descending pass a 'geometry trap'?*
4. *What is an Atmospheric Phase Screen (APS)?*
5. *Can NISAR's 12-day orbit provide 30-minute flash flood warnings?*

*Baseline score recorded in browser storage.*

---

### Step 2: Guided Exploration of "The River Remembers" (15 minutes)
Participants explore the 6 narrative chapters:
- **Chapter 1 (The Silent Mountain):** Read about L-band wavelength ($\lambda = 24\text{ cm}$) vs raindrop size.
- **Chapter 2 (The Surge):** Learn about the 26 August 2026 debris flow and optical cloud deck.
- **Chapter 3 (Reading the Scars):** Examine the Track 98 Backscatter Delta ($\Delta\sigma^\circ$) map.
- **Chapter 4 (Two Eyes on the Gorge):** Understand why flight direction matters in steep valleys.
- **Chapter 5 (Connecting Sky to Earth):** Explore GPM IMERG rainfall and atmospheric noise.
- **Chapter 6 (Next Steps):** Review the Evidence Request Brief and Nepali explainer.

*Participants may freely use the "Student (Grade 8)" vs "Specialist (SAR Physics)" toggle.*

---

### Step 3: Interactive Usability Tasks (10 minutes)
Participants are asked to perform 4 specific tasks without prompter assistance:

| Task ID | Task Description | Target Metric | Success Criteria |
|---|---|---|---|
| **T-1** | Use the Chapter 3 swipe wipe slider to compare pre-flood and post-flood radar imagery. | Time to complete < 20s | Participant drags handle across dividing line and locates boulder fan. |
| **T-2** | Hover over the active riverbed in Chapter 3 to identify the calibrated decibel change ($\Delta\sigma^\circ$). | Value identified correctly | Participant reads out $+2.4\text{ to }+4.8\text{ dB}$ (cyan boulder deposition). |
| **T-3** | Toggle between Track 98 Ascending and Track 48 Descending in Chapter 4 and describe why shadows flip. | Verbal explanation | Explains that the satellite looks East in one pass and West in the other. |
| **T-4** | Export the Evidence Request Brief and open the Nepali Community Explainer. | Actions completed | Participant clicks export buttons and previews the Nepali text. |

---

### Step 4: Post-Test Knowledge Assessment (5 minutes)
Participants retake the 5-question assessment. The system records the post-test score and calculates individual and cohort knowledge growth:
$$\text{Knowledge Growth (\%)} = \frac{\text{Post Score} - \text{Pre Score}}{\text{Total Questions (5)}} \times 100\%$$

---

### Step 5: System Usability Scale (SUS) & Qualitative Feedback (5 minutes)
Participants rate 10 standard System Usability Scale items on a 1–5 Likert scale:
1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

---

## 4. Target Quantitative Success Metrics

| Metric | Target Threshold | Rationale |
|---|---|---|
| **Task Completion Rate (T1–T4)** | $\ge 90\%$ | Ensures interfaces are intuitive and self-explanatory. |
| **Average Knowledge Growth** | $\ge +40\%$ improvement | Demonstrates effective pedagogy across Grade 8+ learners. |
| **Early Warning Boundary Comprehension** | $100\%$ on Q5 | Critical safety criterion: zero users should believe satellite radar warns of flash floods in advance. |
| **Geometry Trap Comprehension** | $\ge 85\%$ on Q3 | Confirms that users understand viewing angle artifacts. |
| **Mean System Usability Scale (SUS)** | $\ge 80 / 100$ (Grade A) | Validates high accessibility and retro UI clarity. |

---

## 5. Ethical Guidelines & Data Privacy

1. All participant responses and quiz records are anonymous and stored locally on the client machine (`localStorage`).
2. No personal identification data (names, IP addresses, emails) is harvested or transmitted.
3. Participants are reminded that scenarios and simulations are educational tools, and official emergency directives should always be sought from the Nepal Department of Hydrology and Meteorology (DHM) and NDRRMA.

