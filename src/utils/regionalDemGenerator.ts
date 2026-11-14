import { DemData, RadarLayerMode, TimelinePass } from '../types';
import { getGridGradient, getSimulatedRasuwaMotion, losToPhaseCycles, phaseCyclesToHue } from './simulatedRadarPhysics';
import { GlobalRegionId } from '../services/nasaEarthDataService';
import { GLOBAL_REGIONS_ATLAS } from '../data/globalRegionsAtlas';
import {
  buildRasterLayerCanvas,
  DEM as RASUWA_DEM,
  sampleElevationAtUV as sampleRasuwaElevationAtUV
} from './terrainHydrology';

const cachedDems = new Map<GlobalRegionId, DemData>();
const cachedRasterCanvases = new Map<string, HTMLCanvasElement>();

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

// Deterministic fast 2D value noise + FBM + ridged multifractal
function hash2(ix: number, iy: number, seed = 0): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed = 0): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const n00 = hash2(ix, iy, seed);
  const n10 = hash2(ix + 1, iy, seed);
  const n01 = hash2(ix, iy + 1, seed);
  const n11 = hash2(ix + 1, iy + 1, seed);
  return lerp(lerp(n00, n10, sx), lerp(n01, n11, sx), sy);
}

function fbm(x: number, y: number, octaves = 5, seed = 11): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + i * 31);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / (norm || 1);
}

function ridgedFbm(x: number, y: number, octaves = 4, seed = 73): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = valueNoise(x * freq, y * freq, seed + i * 47);
    const r = 1 - Math.abs(n * 2 - 1);
    sum += amp * r * r;
    norm += amp;
    amp *= 0.5;
    freq *= 2.07;
  }
  return sum / (norm || 1);
}

export function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { dist: number; t: number; side: number } {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const len2 = vx * vx + vy * vy || 1e-9;
  const t = clamp((wx * vx + wy * vy) / len2, 0, 1);
  const cx = ax + t * vx;
  const cy = ay + t * vy;
  const dx = px - cx;
  const dy = py - cy;
  const cross = vx * wy - vy * wx;
  return {
    dist: Math.hypot(dx, dy),
    t,
    side: cross >= 0 ? 1 : -1
  };
}

export function distToPolylineSigned(
  u: number,
  v: number,
  pts: Array<[number, number]>
): { dist: number; side: number; along: number } {
  let best = 1e9;
  let bestSide = 1;
  let bestAlong = 0;
  const segCount = Math.max(1, pts.length - 1);
  for (let i = 0; i < pts.length - 1; i++) {
    const res = distToSegment(u, v, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    if (res.dist < best) {
      best = res.dist;
      bestSide = res.side;
      bestAlong = (i + res.t) / segCount;
    }
  }
  return { dist: best, side: bestSide, along: bestAlong };
}

// Secondary hydrological / geomorphic polylines per region for realistic landform anatomy
const PANTANAL_CORIXO_EAST: Array<[number, number]> = [
  [0.78, 0.22],
  [0.71, 0.34],
  [0.66, 0.45],
  [0.57, 0.58],
  [0.45, 0.72],
  [0.50, 0.84]
];

const PANTANAL_OXBOWS: Array<[number, number, number, number]> = [
  [0.26, 0.44, 0.042, 0.026],
  [0.42, 0.56, 0.036, 0.022],
  [0.61, 0.49, 0.038, 0.025],
  [0.31, 0.76, 0.046, 0.028],
  [0.73, 0.66, 0.040, 0.024]
];

const SJV_FRIANT_CANAL: Array<[number, number]> = [
  [0.74, 0.10],
  [0.76, 0.32],
  [0.80, 0.58],
  [0.83, 0.88]
];

const SJV_KINGS_RIVER: Array<[number, number]> = [
  [0.88, 0.16],
  [0.66, 0.22],
  [0.47, 0.25],
  [0.36, 0.34]
];

// Asi (Orontes) River meandering from S/SE into Amik plain and SW through Antakya (0.44, 0.68)
export const HATAY_ASI_RIVER: Array<[number, number]> = [
  [0.64, 0.94],
  [0.57, 0.76],
  [0.45, 0.68],
  [0.33, 0.74],
  [0.16, 0.88]
];

const HATAY_KARASU_STREAM: Array<[number, number]> = [
  [0.74, 0.22],
  [0.63, 0.39],
  [0.52, 0.55],
  [0.45, 0.68]
];

const HATAY_DAM_STREAM: Array<[number, number]> = [
  [0.22, 0.23],
  [0.28, 0.30],
  [0.37, 0.44],
  [0.45, 0.68]
];

const ALASKA_TIDAL_SLOUGH_N: Array<[number, number]> = [
  [0.27, 0.35],
  [0.41, 0.39],
  [0.55, 0.34],
  [0.66, 0.38]
];

const ALASKA_TIDAL_SLOUGH_S: Array<[number, number]> = [
  [0.31, 0.63],
  [0.44, 0.60],
  [0.56, 0.65],
  [0.70, 0.72]
];

const ALASKA_THAW_LAKES: Array<[number, number, number, number, boolean]> = [
  [0.56, 0.64, 0.055, 0.036, true],
  [0.44, 0.48, 0.034, 0.022, false],
  [0.51, 0.24, 0.038, 0.024, false],
  [0.62, 0.49, 0.029, 0.020, false],
  [0.43, 0.78, 0.042, 0.026, false],
  [0.65, 0.81, 0.036, 0.022, true],
  [0.38, 0.22, 0.028, 0.019, false]
];

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const hh = ((h % 1) + 1) % 1;
  const i = Math.floor(hh * 6);
  const f = hh * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      return [v * 255, t * 255, p * 255];
    case 1:
      return [q * 255, v * 255, p * 255];
    case 2:
      return [p * 255, v * 255, t * 255];
    case 3:
      return [p * 255, q * 255, v * 255];
    case 4:
      return [t * 255, p * 255, v * 255];
    default:
      return [v * 255, p * 255, q * 255];
  }
}

export interface LayerLegendSpec {
  title: string;
  unit: string;
  minLabel: string;
  midLabel: string;
  maxLabel: string;
  gradientCss: string;
}

/**
 * Generates or returns the 160x148 DEM for any global region (unverified local height grid for Rasuwa,
 * multi-octave geomorphic DEM for Pantanal, San Joaquin, Hatay, and Yukon-Kuskokwim).
 */
export function getRegionalDem(regionId: GlobalRegionId): DemData {
  if (regionId === 'rasuwa_nepal') {
    return RASUWA_DEM;
  }
  const existing = cachedDems.get(regionId);
  if (existing) return existing;

  const reg = GLOBAL_REGIONS_ATLAS[regionId];
  const cols = 160;
  const rows = 148;
  const elevations: number[][] = [];
  let minElev = Infinity;
  let maxElev = -Infinity;

  for (let r = 0; r < rows; r++) {
    const v = r / (rows - 1);
    const rowArr: number[] = [];
    for (let c = 0; c < cols; c++) {
      const u = c / (cols - 1);

      const warpU = u + (fbm(u * 4.2, v * 4.2, 3, 201) - 0.5) * 0.065;
      const warpV = v + (fbm(u * 4.2 + 7.1, v * 4.2 + 3.4, 3, 307) - 0.5) * 0.065;

      const macroFbm = fbm(warpU * 3.4, warpV * 3.4, 5, 19);
      const detailFbm = fbm(u * 13.5, v * 13.5, 4, 53);
      const ridges = ridgedFbm(warpU * 4.6, warpV * 4.6, 5, 89);

      let elev = 100;

      if (regionId === 'pantanal_brazil') {
        const mainRiver = distToPolylineSigned(warpU, warpV, reg.riverOrFaultPathUV).dist;
        const eastCorixo = distToPolylineSigned(warpU, warpV, PANTANAL_CORIXO_EAST).dist;

        const northPlateau = smoothstep(0.38, 0.08, warpV + (macroFbm - 0.5) * 0.14);
        const plateauDissection = ridgedFbm(u * 8.5, v * 8.5, 4, 141) * 58;
        const cordilheiraLevees = Math.sin(warpU * 26 + macroFbm * 5) * 4.5 + detailFbm * 9;

        elev =
          104 +
          northPlateau * (165 + plateauDissection) +
          macroFbm * 22 +
          cordilheiraLevees -
          Math.exp(-(mainRiver * mainRiver) * 850) * 16 -
          Math.exp(-(eastCorixo * eastCorixo) * 1100) * 12;

        for (const [ou, ov, rx, ry] of PANTANAL_OXBOWS) {
          const d2 = ((u - ou) / rx) ** 2 + ((v - ov) / ry) ** 2;
          if (d2 < 1.6) {
            elev -= Math.exp(-d2 * 2.2) * 8.5;
          }
        }
      } else if (regionId === 'san_joaquin_usa') {
        const swRangeMetric = 0.34 - (warpU * 0.85 + (1 - warpV) * 0.34);
        const coastRange = smoothstep(-0.04, 0.24, swRangeMetric);
        const coastRidges = ridges * 480 + detailFbm * 95;

        const neFoothillMetric = warpU * 0.78 + (1 - warpV) * 0.42 - 0.86;
        const sierraToe = smoothstep(-0.03, 0.22, neFoothillMetric) * (290 + ridges * 220);

        const bowlDx = (u - 0.62) / 0.26;
        const bowlDy = (v - 0.50) / 0.28;
        const bowlFactor = Math.exp(-(bowlDx * bowlDx + bowlDy * bowlDy));

        const aqueductDist = distToPolylineSigned(u, v, reg.riverOrFaultPathUV).dist;
        const kingsDist = distToPolylineSigned(warpU, warpV, SJV_KINGS_RIVER).dist;

        elev =
          78 +
          coastRange * (260 + coastRidges) +
          sierraToe +
          macroFbm * 14 +
          detailFbm * 4.5 -
          bowlFactor * 21 -
          Math.exp(-(aqueductDist * aqueductDist) * 2600) * 4.5 -
          Math.exp(-(kingsDist * kingsDist) * 1600) * 5.5;
      } else if (regionId === 'hatay_turkiye') {
        // Rugged Amanos Mountains (Nur Dağları) to the west (u < 0.45)
        const amanosAxis = (0.42 - warpU) * 1.15 + (0.58 - warpV) * 0.35;
        const amanosMask = smoothstep(-0.02, 0.32, amanosAxis);
        const amanosPeaks = amanosMask * (580 + ridges * 1180 + detailFbm * 210);

        // Tahtaköprü / Yarseli reservoir basin
        const resDist = Math.hypot((u - 0.235) * 1.3, (v - 0.245) * 1.1);
        const damValleyCarve = Math.exp(-(resDist * resDist) * 95) * 180;
        const damStreamDist = distToPolylineSigned(warpU, warpV, HATAY_DAM_STREAM).dist;
        const canyonCarve = Math.exp(-(damStreamDist * damStreamDist) * 750) * 110 * amanosMask;

        // Eastern plateaus (Pazarcık / Gaziantep highlands)
        const eastUplandMask = smoothstep(0.48, 0.85, warpU + (0.5 - warpV) * 0.25);
        const eastHighlands = eastUplandMask * (340 + ridges * 520 + macroFbm * 140);

        // Southern Jebel Aqra / Samandağ coastal hills
        const southHills =
          smoothstep(0.66, 0.94, warpV) *
          smoothstep(0.32, 0.68, warpU) *
          (220 + ridges * 310);

        // East Anatolian / Dead Sea Transform Fault valley (subtle natural rift valley, 8-16m, NOT an artificial 165m ditch!)
        const faultInfo = distToPolylineSigned(warpU, warpV, reg.riverOrFaultPathUV);
        const subtleFaultValley = Math.exp(-(faultInfo.dist * faultInfo.dist) * 2200) * 16;

        // Amik Basin graben floor (flat fertile alluvial plain)
        const grabenMask =
          smoothstep(0.26, 0.04, Math.hypot((u - 0.48) * 1.1, (v - 0.64) * 0.95));
        const grabenFloor = grabenMask * 35;

        // Asi (Orontes) riverbed carve
        const asiDist = distToPolylineSigned(warpU, warpV, HATAY_ASI_RIVER).dist;
        const asiCarve = Math.exp(-(asiDist * asiDist) * 2400) * 14;

        elev =
          95 +
          macroFbm * 32 +
          amanosPeaks -
          damValleyCarve -
          canyonCarve +
          eastHighlands +
          southHills -
          subtleFaultValley -
          grabenFloor -
          asiCarve;

        elev = clamp(elev, 82, 2180);
      } else if (regionId === 'yukon_alaska') {
        const coastWobble =
          0.285 +
          0.035 * Math.sin(v * 7.5 + macroFbm * 2.4) +
          (detailFbm - 0.5) * 0.028;
        const inlandDist = u - coastWobble;

        if (inlandDist < 0) {
          const sandbar = Math.exp(-((inlandDist + 0.045) ** 2) * 1800) * 2.2;
          elev = clamp(-7.5 + inlandDist * 22 + sandbar + detailFbm * 1.6, -8, -0.3);
        } else {
          const bluffStep = smoothstep(0.0, 0.022, inlandDist) * 7.2;
          const ridgeMetric = (warpU - 0.54) * 0.85 + (0.58 - warpV) * 0.68;
          const uplandRidge = smoothstep(0.02, 0.42, ridgeMetric) * (58 + ridges * 82 + macroFbm * 24);

          const sloughN = distToPolylineSigned(warpU, warpV, ALASKA_TIDAL_SLOUGH_N).dist;
          const sloughS = distToPolylineSigned(warpU, warpV, ALASKA_TIDAL_SLOUGH_S).dist;
          const sloughCarve =
            Math.exp(-(sloughN * sloughN) * 3200) * 4.8 +
            Math.exp(-(sloughS * sloughS) * 3200) * 4.8;

          elev = 1.4 + bluffStep + macroFbm * 5.2 + detailFbm * 2.4 + uplandRidge - sloughCarve;

          for (const [lu, lv, rx, ry, drained] of ALASKA_THAW_LAKES) {
            const d2 = ((u - lu) / rx) ** 2 + ((v - lv) / ry) ** 2;
            if (d2 < 1.3) {
              elev -= smoothstep(1.2, 0.35, d2) * (drained ? 3.2 : 5.4);
            }
          }
          elev = Math.max(0.4, elev);
        }
      }

      const rounded = Math.round(elev * 10) / 10;
      if (rounded < minElev) minElev = rounded;
      if (rounded > maxElev) maxElev = rounded;
      rowArr.push(rounded);
    }
    elevations.push(rowArr);
  }

  const built: DemData = {
    bounds: {
      latMin: reg.lat - 0.18,
      latMax: reg.lat + 0.18,
      lonMin: reg.lon - 0.22,
      lonMax: reg.lon + 0.22,
      widthKm: 38,
      heightKm: 34
    },
    cols,
    rows,
    minElev: Math.round(minElev),
    maxElev: Math.round(maxElev),
    elevations
  };

  cachedDems.set(regionId, built);
  return built;
}

export interface RegionalSample {
  elev: number;
  slope: number;
  hillshade: number;
  nx: number;
  ny: number;
  nz: number;
}

export function sampleRegionalTerrain(dem: DemData, u: number, v: number): RegionalSample {
  const gx = clamp(u, 0, 1) * (dem.cols - 1);
  const gy = clamp(v, 0, 1) * (dem.rows - 1);
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const x1 = Math.min(dem.cols - 1, x0 + 1);
  const y1 = Math.min(dem.rows - 1, y0 + 1);
  const fx = gx - x0;
  const fy = gy - y0;

  const e00 = dem.elevations[y0][x0];
  const e10 = dem.elevations[y0][x1];
  const e01 = dem.elevations[y1][x0];
  const e11 = dem.elevations[y1][x1];
  const elev = lerp(lerp(e00, e10, fx), lerp(e01, e11, fx), fy);

  const { dzdx, dzdy } = getGridGradient(dem, y0, x0);
  const slope = clamp(Math.hypot(dzdx, dzdy) * 4.5, 0, 1);

  const zScale = 4.2;
  const snx = -dzdx * zScale;
  const sny = -dzdy * zScale;
  const snz = 1.0;
  const invLen = 1 / Math.hypot(snx, sny, snz);
  const nx = snx * invLen;
  const ny = sny * invLen;
  const nz = snz * invLen;

  // Sun from NW (azimuth 315°, elevation ~45°)
  const lx = -0.58;
  const ly = -0.52;
  const lz = 0.63;
  const dot = nx * lx + ny * ly + nz * lz;
  const hillshade = clamp(dot * 0.82 + 0.28, 0.16, 1.15);

  return { elev, slope, hillshade, nx, ny, nz };
}

export function sampleRegionalElevationAtUV(regionId: GlobalRegionId, u: number, v: number): number {
  if (regionId === 'rasuwa_nepal') {
    return sampleRasuwaElevationAtUV(u, v);
  }
  const dem = getRegionalDem(regionId);
  return sampleRegionalTerrain(dem, u, v).elev;
}

export function getLayerLegendSpec(mode: RadarLayerMode, regionId: GlobalRegionId): LayerLegendSpec {
  const dem = getRegionalDem(regionId);
  const minE = Math.round(dem.minElev);
  const maxE = Math.round(dem.maxElev);

  switch (mode) {
    case 'nisar_browse':
      return {
        title: 'REAL NASA NISAR RADAR OBSERVATION (BROWSE RASTER)',
        unit: 'Rendered color (visual comparison only; not calibrated)',
        minLabel: 'Low Return (Water / Flat)',
        midLabel: 'Medium (Soil / Crops)',
        maxLabel: 'High (Double-Bounce / Rough)',
        gradientCss: 'linear-gradient(90deg, #050b14, #1e3a5f, #38bdf8, #f59e0b, #ffffff)'
      };
    case 'lband_insar':
      return {
        title: 'L-BAND InSAR WRAPPED PHASE (Δφ)',
        unit: '12 cm LOS / fringe (nominal simulation)',
        minLabel: '-π (-6 cm)',
        midLabel: '0 rad',
        maxLabel: '+π (+6 cm)',
        gradientCss: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
      };
    case 'sar_rgb':
      return {
        title: 'ILLUSTRATIVE RADAR PALETTE (NOT CALIBRATED RGB)',
        unit: 'No numerical color scale',
        minLabel: 'Water-like palette',
        midLabel: 'Canopy-like palette',
        maxLabel: 'Built/rough palette',
        gradientCss: 'linear-gradient(90deg, #0b1838, #1d7a46, #95c95c, #f472b6, #e0f2fe)'
      };
    case 'sband_moisture':
      return {
        title: 'TOY WETNESS PALETTE (NOT εr OR VOLUMETRIC MOISTURE)',
        unit: 'Dimensionless illustration',
        minLabel: 'Low (0.08)',
        midLabel: 'Middle (0.45)',
        maxLabel: 'High (0.92)',
        gradientCss: 'linear-gradient(90deg, #b91c1c, #d97706, #65a30d, #0891b2, #38bdf8)'
      };
    case 'optical':
      return {
        title: 'TRUE-COLOR OPTICAL + CLOUD/SMOKE BLINDSPOT',
        unit: 'Illustrative color, not reflectance',
        minLabel: 'Deep Water',
        midLabel: 'Canopy / Soil',
        maxLabel: 'Cloud / Haze',
        gradientCss: 'linear-gradient(90deg, #163e64, #3d6b3c, #b59b6d, #e2e8f0, #ffffff)'
      };
    case 'retro_wireframe':
      return {
        title: 'GEODETIC TOPOGRAPHIC CONTOUR VECTOR',
        unit: `${minE}m–${maxE}m`,
        minLabel: `${minE}m`,
        midLabel: `${Math.round((minE + maxE) / 2)}m`,
        maxLabel: `${maxE}m`,
        gradientCss: 'linear-gradient(90deg, #041e2b, #0891b2, #22d3ee, #facc15, #f43f5e)'
      };
    case 'pixel':
    default:
      return {
        title: 'HYPSOMETRIC SHADED RELIEF (DEM)',
        unit: 'Illustrative meters; origin unverified',
        minLabel: `${minE}m`,
        midLabel: `${Math.round((minE + maxE) * 0.45)}m`,
        maxLabel: `${maxE}m`,
        gradientCss:
          regionId === 'hatay_turkiye'
            ? 'linear-gradient(90deg, #1b6ca8, #6b8e4e, #c29b61, #8c735b, #e2e8f0)'
            : regionId === 'san_joaquin_usa'
              ? 'linear-gradient(90deg, #1d70a2, #588b48, #d4b46a, #a67c52, #786452)'
              : regionId === 'yukon_alaska'
                ? 'linear-gradient(90deg, #1b4965, #5c6f44, #b07d3c, #8d867c, #cbd5e1)'
                : 'linear-gradient(90deg, #1b6488, #2b6e3f, #659b44, #b59257, #e2e8f0)'
      };
  }
}

export function computeRegionalDeformationM(
  regionId: GlobalRegionId,
  u: number,
  v: number,
  pass: TimelinePass
): { losMeters: number; coherenceLoss: number; isValid?: boolean } {
  if (regionId === 'rasuwa_nepal') {
    return getSimulatedRasuwaMotion(u, v, pass);
  }

  const reg = GLOBAL_REGIONS_ATLAS[regionId];

  if (regionId === 'hatay_turkiye') {
    const fault = distToPolylineSigned(u, v, reg.riverOrFaultPathUV);
    const isPostQuake = pass.index >= 1;
    const slipAmp =
      pass.index === 0
        ? 0.035
        : pass.index === 1
          ? 0.78
          : pass.index === 2
            ? 0.34
            : 0.14;

    const strikeEnvelope = Math.exp(-((fault.along - 0.48) ** 2) * 2.8);
    // Strike-slip dislocation across fault profile: dense 4-quadrant butterfly InSAR fringes
    const acrossProfile =
      (1 - Math.exp(-fault.dist / 0.022)) * Math.exp(-fault.dist * 3.4) +
      (fault.dist < 0.08 ? ((0.08 - fault.dist) / 0.08) * 0.75 : 0);
    let losMeters = fault.side * slipAmp * acrossProfile * strikeEnvelope;

    const damDist = Math.hypot(u - 0.28, v - 0.28);
    if (pass.index === 2) {
      // 11.2 cm settlement at earthen dam embankment
      losMeters -= Math.exp(-(damDist * damDist) * 380) * 0.112;
    } else if (pass.index === 1) {
      losMeters -= Math.exp(-(damDist * damDist) * 380) * 0.048;
    }

    const antakyaDist = Math.hypot((u - 0.44) * 1.2, (v - 0.68) * 1.2);
    const faultCoreDecor = isPostQuake
      ? Math.exp(-(fault.dist * fault.dist) * 2800) * (pass.index === 1 ? 0.94 : 0.42)
      : 0;
    const urbanDecor = pass.index === 1 ? Math.exp(-(antakyaDist * antakyaDist) * 260) * 0.78 : 0;

    return {
      losMeters,
      coherenceLoss: clamp(faultCoreDecor + urbanDecor, 0, 1)
    };
  }

  if (regionId === 'san_joaquin_usa') {
    const pumpScale =
      pass.index === 0 ? 0.10 : pass.index === 1 ? 0.28 : pass.index === 2 ? 0.52 : 0.38;
    const d1 = ((u - 0.62) / 0.22) ** 2 + ((v - 0.49) / 0.20) ** 2;
    const d2 = ((u - 0.40) / 0.14) ** 2 + ((v - 0.56) / 0.16) ** 2;
    let losMeters = -(Math.exp(-d1) * pumpScale + Math.exp(-d2) * pumpScale * 0.68);

    if (pass.index === 3) {
      const dMar = ((u - 0.46) / 0.13) ** 2 + ((v - 0.24) / 0.12) ** 2;
      losMeters += Math.exp(-dMar) * 0.16;
    }

    return { losMeters, coherenceLoss: 0.05 };
  }

  if (regionId === 'pantanal_brazil') {
    const mainR = distToPolylineSigned(u, v, reg.riverOrFaultPathUV).dist;
    const eastR = distToPolylineSigned(u, v, PANTANAL_CORIXO_EAST).dist;
    const floodCorr = Math.exp(-(mainR * mainR) * 45) + Math.exp(-(eastR * eastR) * 55) * 0.8;
    const peatBowl = Math.exp(-(((u - 0.66) / 0.16) ** 2 + ((v - 0.44) / 0.15) ** 2));

    const waterShift =
      pass.index === 0 ? 0.32 : pass.index === 1 ? 0.14 : pass.index === 2 ? -0.18 : 0.26;
    const losMeters = floodCorr * waterShift - (pass.index === 2 ? peatBowl * 0.24 : 0);
    const fireDecor = pass.index === 2 ? peatBowl * 0.72 : 0.08;
    return { losMeters, coherenceLoss: clamp(fireDecor, 0, 1) };
  }

  // yukon_alaska
  const bluffDist = distToPolylineSigned(u, v, reg.riverOrFaultPathUV).dist;
  const ak01Dist = Math.hypot((u - 0.30) * 1.1, (v - 0.58) * 0.9);
  const ak02Dist = Math.hypot((u - 0.56) * 1.0, (v - 0.64) * 1.1);
  const ridgeSafe = smoothstep(0.55, 0.72, u) * smoothstep(0.48, 0.22, v);

  const thawScale =
    pass.index === 0 ? 0.06 : pass.index === 1 ? 0.22 : pass.index === 2 ? 0.42 : 0.12;
  const losMeters =
    -(
      Math.exp(-(bluffDist * bluffDist) * 180) * thawScale +
      Math.exp(-(ak01Dist * ak01Dist) * 95) * thawScale * 0.85 +
      Math.exp(-(ak02Dist * ak02Dist) * 80) * thawScale * 0.55
    ) *
    (1 - ridgeSafe * 0.9);

  const stormDecor = pass.index === 2 ? Math.exp(-(bluffDist * bluffDist) * 950) * 0.82 : 0.06;
  return { losMeters, coherenceLoss: clamp(stormDecor, 0, 1) };
}

export function renderRegionalRasterToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  regionId: GlobalRegionId,
  mode: RadarLayerMode,
  pass: TimelinePass,
  animTimeSec: number
): void {
  const dem = getRegionalDem(regionId);
  const reg = GLOBAL_REGIONS_ATLAS[regionId];
  const img = ctx.createImageData(width, height);
  const data = img.data;
  const elevSpan = Math.max(40, dem.maxElev - dem.minElev);

  for (let py = 0; py < height; py++) {
    const v = py / Math.max(1, height - 1);
    for (let px = 0; px < width; px++) {
      const u = px / Math.max(1, width - 1);
      const idx = (py * width + px) * 4;

      const samp = sampleRegionalTerrain(dem, u, v);
      const elev = samp.elev;
      const shade = samp.hillshade;
      const texFine = valueNoise(u * 95, v * 95, 601);
      const texMed = fbm(u * 28, v * 28, 3, 709);
      const warpU = u + (texMed - 0.5) * 0.025;
      const warpV = v + (fbm(u * 28 + 4.2, v * 28 + 1.9, 3, 811) - 0.5) * 0.025;

      let isOpenWater = false;
      let waterDepth = 0;
      let isUrban = false;
      let urbanDamage = 0;
      let vegCanopy = 0;
      let soilWetness = clamp(pass.soilMoisturePct / 100, 0.08, 0.95);
      let baseR = 90;
      let baseG = 115;
      let baseB = 78;

      if (regionId === 'pantanal_brazil') {
        const dMain = distToPolylineSigned(warpU, warpV, reg.riverOrFaultPathUV).dist;
        const dEast = distToPolylineSigned(warpU, warpV, PANTANAL_CORIXO_EAST).dist;
        const floodWidth = pass.index === 0 ? 0.022 : pass.index === 1 ? 0.015 : pass.index === 2 ? 0.009 : 0.019;

        let oxbowHit = false;
        for (const [ou, ov, rx, ry] of PANTANAL_OXBOWS) {
          const d2 = ((warpU - ou) / rx) ** 2 + ((warpV - ov) / ry) ** 2;
          if (d2 > 0.18 && d2 < (pass.index === 2 ? 0.62 : 0.95) && warpU - ou < rx * 0.65) {
            oxbowHit = true;
          }
        }

        if (dMain < floodWidth || dEast < floodWidth * 0.72 || oxbowHit) {
          isOpenWater = true;
          waterDepth = dMain < floodWidth * 0.45 ? 0.85 : 0.45;
          baseR = oxbowHit ? 24 : 58;
          baseG = oxbowHit ? 54 : 86;
          baseB = oxbowHit ? 64 : 72;
          soilWetness = 0.98;
        } else {
          const agroPatch =
            v < 0.27 &&
            valueNoise(Math.floor(u * 14), Math.floor(v * 14), 91) > 0.52 &&
            elev > 175;
          const peatDist = Math.hypot((u - 0.66) * 1.1, (v - 0.44) * 1.1);
          const peatBurn = pass.index === 2 ? smoothstep(0.24, 0.04, peatDist) * (0.55 + texMed * 0.45) : 0;

          if (agroPatch) {
            vegCanopy = 0.22;
            soilWetness = clamp(soilWetness * 0.62, 0.1, 0.9);
            baseR = 168 + texFine * 18;
            baseG = 132 + texMed * 16;
            baseB = 82;
          } else if (elev < 118) {
            vegCanopy = 0.58;
            const marshWet = pass.index === 0 || pass.index === 3 ? 0.88 : pass.index === 1 ? 0.52 : 0.22;
            soilWetness = clamp(marshWet + (texMed - 0.5) * 0.18, 0.12, 0.96);
            baseR = lerp(118, 52, marshWet) + texFine * 12;
            baseG = lerp(124, 118, marshWet) + texMed * 18;
            baseB = lerp(64, 74, marshWet);
          } else {
            vegCanopy = 0.88 - peatBurn * 0.65;
            soilWetness = clamp(soilWetness * (1 - peatBurn * 0.65) + (texMed - 0.5) * 0.16, 0.08, 0.94);
            baseR = 36 + texMed * 24 + (elev > 210 ? 18 : 0);
            baseG = 92 + texMed * 34 + texFine * 12;
            baseB = 46 + texMed * 14;
          }

          if (peatBurn > 0.15) {
            baseR = lerp(baseR, 74 + texFine * 45, peatBurn);
            baseG = lerp(baseG, 56 + texFine * 18, peatBurn);
            baseB = lerp(baseB, 48, peatBurn);
          }
        }
      } else if (regionId === 'san_joaquin_usa') {
        const dAqua = distToPolylineSigned(u, v, reg.riverOrFaultPathUV).dist;
        const dFriant = distToPolylineSigned(u, v, SJV_FRIANT_CANAL).dist;
        const dKings = distToPolylineSigned(warpU, warpV, SJV_KINGS_RIVER).dist;
        const marDist = Math.hypot((u - 0.46) * 1.2, (v - 0.24) * 1.3);
        const isMarPond =
          marDist < (pass.index === 3 ? 0.068 : 0.032) &&
          Math.abs(((u * 38) % 1) - 0.5) < 0.38 &&
          Math.abs(((v * 34) % 1) - 0.5) < 0.38;

        if (dAqua < 0.0085 || dFriant < 0.0065 || dKings < 0.0075 || isMarPond) {
          isOpenWater = true;
          waterDepth = 0.75;
          baseR = isMarPond ? 28 : 24;
          baseG = isMarPond ? 112 : 96;
          baseB = isMarPond ? 156 : 142;
          soilWetness = 0.96;
        } else if (elev > 165) {
          vegCanopy = elev > 420 ? 0.36 : 0.16;
          soilWetness = clamp(0.14 + (texMed - 0.5) * 0.1, 0.06, 0.38);
          baseR = lerp(188, 132, smoothstep(165, 680, elev)) + texFine * 14;
          baseG = lerp(158, 118, smoothstep(165, 680, elev)) + texFine * 10;
          baseB = lerp(98, 82, smoothstep(165, 680, elev));
        } else {
          const cellX = Math.floor(u * 22);
          const cellY = Math.floor(v * 20);
          const roadEdge = (u * 22) % 1 < 0.055 || (v * 20) % 1 < 0.055;
          const parcelSeed = hash2(cellX, cellY, 444);

          const townDist = Math.min(
            Math.hypot(u - 0.60, v - 0.52),
            Math.hypot(u - 0.36, v - 0.55)
          );
          if (townDist < 0.042 && texFine > 0.32) {
            isUrban = true;
            baseR = 168;
            baseG = 164;
            baseB = 158;
            vegCanopy = 0.12;
            soilWetness = 0.18;
          } else if (roadEdge) {
            baseR = 192;
            baseG = 178;
            baseB = 146;
            vegCanopy = 0.05;
            soilWetness = 0.14;
          } else if (parcelSeed < 0.38) {
            const rowStripe = Math.sin(u * 420) * 0.5 + 0.5;
            vegCanopy = 0.76;
            soilWetness = clamp(soilWetness * 1.18 + 0.12, 0.28, 0.88);
            baseR = 64 + rowStripe * 22;
            baseG = 116 + rowStripe * 24;
            baseB = 56 + rowStripe * 10;
          } else if (parcelSeed < 0.68) {
            vegCanopy = 0.48;
            soilWetness = clamp(soilWetness * 0.95, 0.2, 0.82);
            baseR = 96 + texFine * 16;
            baseG = 138 + texFine * 18;
            baseB = 68;
          } else {
            vegCanopy = 0.08;
            soilWetness = clamp(soilWetness * 0.52, 0.08, 0.45);
            baseR = 184 + texFine * 18;
            baseG = 152 + texFine * 14;
            baseB = 104 + texFine * 10;
          }
        }
      } else if (regionId === 'hatay_turkiye') {
        const rx = u - 0.232;
        const ry = v - 0.242;
        const resShape = (rx / 0.052) ** 2 + (ry / 0.044) ** 2 + texMed * 0.28;
        const behindDamWall = u * 0.75 + v * 0.66 < 0.408;
        const resLevel = pass.index === 3 ? 0.68 : 1.0;
        const inReservoir = resShape < resLevel && behindDamWall;

        const dAsi = distToPolylineSigned(warpU, warpV, HATAY_ASI_RIVER).dist;
        const dKarasu = distToPolylineSigned(warpU, warpV, HATAY_KARASU_STREAM).dist;
        const dDamOut = distToPolylineSigned(warpU, warpV, HATAY_DAM_STREAM).dist;
        const faultInfo = distToPolylineSigned(u, v, reg.riverOrFaultPathUV);

        const isDamCrest =
          Math.abs(u * 0.75 + v * 0.66 - 0.412) < 0.011 &&
          Math.hypot(u - 0.278, v - 0.298) < 0.036;

        if (inReservoir || dAsi < 0.0095 || dKarasu < 0.006 || (dDamOut < 0.0055 && u > 0.28)) {
          isOpenWater = true;
          waterDepth = inReservoir ? 0.92 : 0.62;
          baseR = inReservoir ? 20 : 34;
          baseG = inReservoir ? 96 : 108;
          baseB = inReservoir ? 138 : 124;
          soilWetness = 0.98;
        } else if (isDamCrest) {
          isUrban = true;
          baseR = 196;
          baseG = 188;
          baseB = 172;
          vegCanopy = 0.04;
          soilWetness = pass.index === 2 ? 0.78 : 0.28;
        } else {
          const dAntakya = Math.hypot((u - 0.44) * 1.05, (v - 0.68) * 1.25);
          const dPazarcik = Math.hypot((u - 0.68) * 1.2, (v - 0.34) * 1.2);
          const cityBlock =
            ((dAntakya < 0.095 && elev < 230) || dPazarcik < 0.042) &&
            (u * 85) % 1 > 0.16 &&
            (v * 85) % 1 > 0.16 &&
            texMed + (0.095 - Math.min(dAntakya, dPazarcik)) * 5 > 0.52;

          if (cityBlock) {
            isUrban = true;
            urbanDamage =
              pass.index === 1
                ? clamp(1.1 - dAntakya * 7 + (texFine - 0.4) * 0.5, 0, 1)
                : pass.index === 2
                  ? clamp(0.65 - dAntakya * 5, 0, 0.7)
                  : 0;
            baseR = lerp(194 + (texFine > 0.55 ? 24 : -12), 142, urbanDamage);
            baseG = lerp(172, 136, urbanDamage);
            baseB = lerp(154, 128, urbanDamage);
            vegCanopy = 0.08;
            soilWetness = 0.22;
          } else if (elev < 245) {
            const pX = Math.floor(u * 26);
            const pY = Math.floor(v * 24);
            const pSeed = hash2(pX, pY, 777);
            if (pSeed < 0.44) {
              vegCanopy = 0.66;
              soilWetness = clamp(0.42 + (texMed - 0.5) * 0.2, 0.22, 0.78);
              baseR = 86 + texFine * 16;
              baseG = 118 + texFine * 18;
              baseB = 72 + texFine * 10;
            } else if (pSeed < 0.76) {
              vegCanopy = 0.38;
              soilWetness = clamp(0.48 + (texMed - 0.5) * 0.22, 0.24, 0.84);
              baseR = 118 + texFine * 18;
              baseG = 136 + texFine * 16;
              baseB = 78;
            } else {
              vegCanopy = 0.12;
              soilWetness = clamp(0.32 + (texMed - 0.5) * 0.18, 0.16, 0.65);
              baseR = 166 + texFine * 18;
              baseG = 122 + texFine * 14;
              baseB = 86 + texFine * 10;
            }
          } else if (elev < 980) {
            const isAmanosWetSide = u < 0.44;
            vegCanopy = isAmanosWetSide ? 0.68 : 0.36;
            soilWetness = isAmanosWetSide ? 0.46 : 0.26;
            baseR = (isAmanosWetSide ? 78 : 138) + texMed * 24;
            baseG = (isAmanosWetSide ? 112 : 126) + texMed * 20;
            baseB = (isAmanosWetSide ? 68 : 88) + texFine * 12;
          } else if (elev < 1720) {
            vegCanopy = 0.22;
            soilWetness = 0.24;
            baseR = 134 + texFine * 22;
            baseG = 126 + texFine * 18;
            baseB = 112 + texFine * 16;
          } else {
            vegCanopy = 0.04;
            soilWetness = 0.35;
            const snowBlend = smoothstep(1700, 1980, elev + (texFine - 0.5) * 140);
            baseR = lerp(142, 226, snowBlend);
            baseG = lerp(136, 232, snowBlend);
            baseB = lerp(128, 242, snowBlend);
          }

          if (pass.index >= 1 && faultInfo.dist < 0.0085) {
            baseR = 178;
            baseG = 148;
            baseB = 118;
            vegCanopy = 0.02;
          }
        }
      } else {
        const dSloughN = distToPolylineSigned(warpU, warpV, ALASKA_TIDAL_SLOUGH_N).dist;
        const dSloughS = distToPolylineSigned(warpU, warpV, ALASKA_TIDAL_SLOUGH_S).dist;

        let inThawLake = false;
        let inDrainedBasin = false;
        for (const [lu, lv, rx, ry, drained] of ALASKA_THAW_LAKES) {
          const d2 = ((warpU - lu) / rx) ** 2 + ((warpV - lv) / ry) ** 2;
          if (d2 < 0.92) {
            if (drained && pass.index >= 1) {
              inDrainedBasin = true;
            } else {
              inThawLake = true;
            }
          }
        }

        if (elev <= 0.2 || inThawLake || dSloughN < 0.007 || dSloughS < 0.0075) {
          isOpenWater = true;
          const isSea = elev <= 0.2;
          waterDepth = isSea ? clamp(-elev / 7, 0.15, 0.95) : 0.55;
          const surfFoam =
            isSea && elev > -1.3
              ? (pass.index === 2 ? 0.55 : 0.24) * (0.5 + 0.5 * Math.sin(u * 140 + animTimeSec * 4))
              : 0;
          baseR = lerp(isSea ? 36 : 22, 198, surfFoam) + (isSea ? (1 - waterDepth) * 34 : 0);
          baseG = lerp(isSea ? 68 : 48, 212, surfFoam) + (isSea ? (1 - waterDepth) * 38 : 0);
          baseB = lerp(isSea ? 88 : 66, 224, surfFoam) + (isSea ? (1 - waterDepth) * 22 : 0);
          soilWetness = 0.99;
        } else {
          const dVillage = Math.hypot((u - 0.315) * 1.2, (v - 0.58) * 1.1);
          if (dVillage < 0.036 && (u * 95) % 1 > 0.42 && (v * 95) % 1 > 0.42 && texFine > 0.45) {
            isUrban = true;
            baseR = 204;
            baseG = 196;
            baseB = 184;
            vegCanopy = 0.05;
            soilWetness = 0.42;
          } else if (inDrainedBasin) {
            vegCanopy = 0.44;
            soilWetness = 0.84;
            baseR = 76 + texFine * 22;
            baseG = 108 + texMed * 26;
            baseB = 54;
          } else if (elev > 26) {
            vegCanopy = 0.18;
            soilWetness = 0.18;
            baseR = 148 + texFine * 24;
            baseG = 142 + texFine * 20;
            baseB = 128 + texFine * 18;
          } else {
            const polyGrid =
              Math.abs(((warpU * 54) % 1) - 0.5) < 0.08 ||
              Math.abs(((warpV * 54) % 1) - 0.5) < 0.08;
            vegCanopy = 0.36;
            soilWetness = clamp(
              (pass.index === 2 ? 0.82 : pass.index === 1 ? 0.68 : 0.46) + (polyGrid ? 0.16 : 0),
              0.2,
              0.94
            );
            baseR = (polyGrid ? 78 : 134) + texMed * 28 + texFine * 14;
            baseG = (polyGrid ? 88 : 112) + texMed * 22;
            baseB = (polyGrid ? 62 : 58) + texFine * 10;
          }
        }
      }

      let R = baseR;
      let G = baseG;
      let B = baseB;

      if (mode === 'pixel') {
        // Multi-tier hypsometric shaded relief tailored to real regional geography
        let hypsR = baseR;
        let hypsG = baseG;
        let hypsB = baseB;

        if (regionId === 'hatay_turkiye') {
          if (isOpenWater) {
            hypsR = 24; hypsG = 82; hypsB = 142;
          } else {
            // Smooth natural hypsometric ramp from Amik plain (85m) to Amanos summits (1980m)
            const normElev = clamp((elev - 85) / 1600, 0, 1);
            if (normElev < 0.12) {
              const t = normElev / 0.12;
              const parcel = (Math.floor(u * 48) + Math.floor(v * 44)) % 2;
              const pOchre = parcel ? 14 : 0;
              hypsR = lerp(86 + pOchre, 114, t);
              hypsG = lerp(128 + pOchre, 138, t);
              hypsB = lerp(68, 76, t);
            } else if (normElev < 0.35) {
              const t = (normElev - 0.12) / 0.23;
              hypsR = lerp(114, 164, t);
              hypsG = lerp(138, 134, t);
              hypsB = lerp(76, 84, t);
            } else if (normElev < 0.70) {
              const t = (normElev - 0.35) / 0.35;
              hypsR = lerp(164, 188, t);
              hypsG = lerp(134, 164, t);
              hypsB = lerp(84, 136, t);
            } else {
              const t = (normElev - 0.70) / 0.30;
              hypsR = lerp(188, 226, t);
              hypsG = lerp(164, 220, t);
              hypsB = lerp(136, 214, t);
            }
          }
        } else if (regionId === 'san_joaquin_usa') {
          if (isOpenWater) {
            hypsR = 22; hypsG = 104; hypsB = 168;
          } else {
            const normElev = clamp((elev - 70) / 750, 0, 1);
            if (normElev < 0.16) {
              const t = normElev / 0.16;
              const parcel = (Math.floor(u * 44) + Math.floor(v * 40)) % 2;
              const pOchre = parcel ? 18 : 0;
              hypsR = lerp(104 + pOchre, 138, t);
              hypsG = lerp(142 + pOchre, 156, t);
              hypsB = lerp(72, 82, t);
            } else if (normElev < 0.48) {
              const t = (normElev - 0.16) / 0.32;
              hypsR = lerp(138, 192, t);
              hypsG = lerp(156, 168, t);
              hypsB = lerp(82, 104, t);
            } else {
              const t = (normElev - 0.48) / 0.52;
              hypsR = lerp(192, 142, t);
              hypsG = lerp(168, 132, t);
              hypsB = lerp(104, 116, t);
            }
          }
        } else if (regionId === 'pantanal_brazil') {
          if (isOpenWater) {
            hypsR = 18; hypsG = 76; hypsB = 112;
          } else if (elev < 114) {
            // Low seasonally-inundated floodplains & marshes
            hypsR = 48; hypsG = 112; hypsB = 62;
          } else if (elev < 145) {
            // Elevated sandy cordilheiras & savanna
            const t = (elev - 114) / 31;
            hypsR = lerp(68, 136, t);
            hypsG = lerp(124, 142, t);
            hypsB = lerp(56, 78, t);
          } else {
            // Northern sandstone plateau
            hypsR = 158; hypsG = 96; hypsB = 64;
          }
        } else {
          // Yukon-Kuskokwim Alaska
          if (isOpenWater) {
            hypsR = 24; hypsG = 68; hypsB = 98;
          } else if (elev < 6) {
            // Coastal tundra & wetlands
            hypsR = 76; hypsG = 108; hypsB = 74;
          } else if (elev < 22) {
            // Lowland peat & thaw lake plain
            hypsR = 112; hypsG = 124; hypsB = 86;
          } else {
            // Upland glacial gravel ridge
            hypsR = 154; hypsG = 148; hypsB = 132;
          }
        }

        const adaptiveStep = elevSpan < 200 ? 12 : elevSpan < 500 ? 30 : elevSpan < 1200 ? 80 : 160;
        const contourMod = ((elev % adaptiveStep) + adaptiveStep) % adaptiveStep;
        const isContour = !isOpenWater && contourMod < adaptiveStep * 0.08 && samp.slope > 0.015;
        const cFactor = isContour ? 0.78 : 1.0;

        R = Math.min(255, Math.round(hypsR * shade * cFactor));
        G = Math.min(255, Math.round(hypsG * shade * cFactor));
        B = Math.min(255, Math.round(hypsB * shade * cFactor));
      } else if (mode === 'optical') {
        R = baseR * (0.3 + shade * 0.72);
        G = baseG * (0.3 + shade * 0.72);
        B = baseB * (0.3 + shade * 0.72);

        const cloudDensity = pass.cloudCoverPct / 100;
        if (cloudDensity > 0.04) {
          const drift = animTimeSec * 0.012;
          const cFbm = fbm(u * 5.8 + drift, v * 5.2 - drift * 0.5, 5, 991);
          const cBillow = ridgedFbm(u * 9.5 + drift * 1.3, v * 9.5, 3, 997);
          const rawMask = cFbm * 0.75 + cBillow * 0.25;
          const thresh = 1 - cloudDensity * 1.06;
          if (rawMask > thresh) {
            const alpha = clamp(((rawMask - thresh) / Math.max(0.14, 1 - thresh)) * 1.25, 0, 0.96);
            const isSmoke = regionId === 'pantanal_brazil' && pass.index >= 1;
            const cR = isSmoke ? 218 : 244;
            const cG = isSmoke ? 198 : 247;
            const cB = isSmoke ? 176 : 252;
            R = lerp(R, cR, alpha);
            G = lerp(G, cG, alpha);
            B = lerp(B, cB, alpha);
          }
        }
      } else if (mode === 'lband_insar') {
        const speckle = 0.88 + (hash2(px, py, 1301) - 0.5) * 0.24;
        const radarBase = (isOpenWater ? 22 : clamp(46 + shade * 128 + vegCanopy * 18, 28, 195)) * speckle;

        const def = computeRegionalDeformationM(regionId, u, v, pass);
        const absDef = Math.abs(def.losMeters);

        if (isOpenWater && regionId !== 'pantanal_brazil') {
          R = 16 + hash2(px, py, 17) * 28;
          G = 28 + hash2(px, py, 29) * 32;
          B = 52 + hash2(px, py, 43) * 44;
        } else if (def.coherenceLoss > 0.52 && hash2(px, py, 883 + pass.index) < def.coherenceLoss) {
          // Co-seismic or disturbance phase decorrelation (radar speckle noise)
          const rndHue = hash2(px * 3, py * 3, 555 + pass.index);
          const [nr, ng, nb] = hsvToRgb(rndHue, 0.85, 0.85);
          R = lerp(radarBase, nr, 0.75);
          G = lerp(radarBase, ng, 0.75);
          B = lerp(radarBase, nb, 0.75);
        } else if (absDef > 0.006) {
          // Wrapped rainbow phase fringes (-π to +π): 12 cm LOS motion per fringe
          const cycles = losToPhaseCycles(def.losMeters);
          const wrappedHue = phaseCyclesToHue(cycles);
          const [fr, fg, fb] = hsvToRgb(wrappedHue, 0.95, 0.98);
          const blend = clamp(absDef * 8.2, 0.25, 0.88);
          R = lerp(radarBase * 0.75, fr, blend);
          G = lerp(radarBase * 0.75, fg, blend);
          B = lerp(radarBase * 0.75, fb, blend);
        } else {
          R = radarBase * 0.78;
          G = radarBase * 0.92;
          B = radarBase * 1.06;
        }
      } else if (mode === 'sar_rgb') {
        // Dual-Pol NISAR L-Band Composite: R=HH, G=HV, B=HH/HV with authentic scattering physics
        const speckle = 0.84 + (hash2(px, py, 2203) + hash2(px + 17, py + 31, 2207)) * 0.16;
        // Radar look vector from WNW (azimuth 285°, 37° incidence)
        const radarLookDot = samp.nx * -0.62 + samp.ny * -0.22 + samp.nz * 0.75;
        const radarSlopeGain = clamp(radarLookDot * 0.85 + 0.35, 0.30, 1.45);

        if (isOpenWater) {
          const floodedTrees =
            regionId === 'pantanal_brazil' && waterDepth < 0.65 && (pass.index === 0 || pass.index === 3);
          if (floodedTrees) {
            // L-Band double-bounce off tree trunks + water surface -> brilliant electric magenta!
            R = Math.min(255, Math.round(238 * speckle));
            G = Math.min(255, Math.round(92 * speckle));
            B = Math.min(255, Math.round(224 * speckle));
          } else {
            // Calm open water: specular reflection away from satellite -> dark radar return (-22 dB)
            const waveRough = regionId === 'yukon_alaska' && pass.index === 2 ? 38 : 8;
            R = Math.min(255, Math.round((12 + waveRough * 0.4) * speckle));
            G = Math.min(255, Math.round((18 + waveRough * 0.5) * speckle));
            B = Math.min(255, Math.round((36 + waveRough * 0.9) * speckle));
          }
        } else if (isUrban) {
          // Built structures: dihedral right-angle corner reflection (high HH, high double bounce)
          const intactFactor = 1 - urbanDamage * 0.75;
          R = Math.min(255, Math.round(lerp(148, 252, intactFactor) * speckle));
          G = Math.min(255, Math.round(lerp(142, 228, intactFactor) * speckle));
          B = Math.min(255, Math.round(lerp(118, 178, intactFactor) * speckle));
        } else {
          // Agricultural plains & natural terrain: authentic parcel scattering & volume scatter
          const cellX = Math.floor(u * 54);
          const cellY = Math.floor(v * 48);
          const pSeed = hash2(cellX, cellY, regionId === 'san_joaquin_usa' ? 444 : 777);
          const furrowPhase = Math.sin((u * 320 + v * 180) + pSeed * 6.28) * 0.08;

          let hhNorm = 0.5;
          let hvNorm = 0.5;
          let ratioNorm = 0.5;

          if (regionId === 'hatay_turkiye' || regionId === 'san_joaquin_usa') {
            if (elev < 260) {
              // Agricultural parcel patchwork with realistic SAR returns
              if (pSeed < 0.32) {
                // Dense crop / orchard: moderate HH, strong HV volume scattering
                hhNorm = 0.58 + (texFine - 0.5) * 0.12;
                hvNorm = 0.65 + (texMed - 0.5) * 0.14;
                ratioNorm = 0.48;
              } else if (pSeed < 0.62) {
                // Tilled moist field: surface scattering + furrow resonance
                hhNorm = 0.72 + furrowPhase + (texFine - 0.5) * 0.10;
                hvNorm = 0.36 + (texMed - 0.5) * 0.08;
                ratioNorm = 0.74;
              } else if (pSeed < 0.85) {
                // Rough furrowed soil: high surface roughness
                hhNorm = 0.78 + furrowPhase + (texFine - 0.5) * 0.12;
                hvNorm = 0.30 + (texMed - 0.5) * 0.08;
                ratioNorm = 0.80;
              } else {
                // Smooth dry fallow field: low backscatter
                hhNorm = 0.34 + (texFine - 0.5) * 0.08;
                hvNorm = 0.18 + (texMed - 0.5) * 0.06;
                ratioNorm = 0.44;
              }
            } else {
              // Rugged mountain slopes: rough surface scattering + volume canopy
              hhNorm = clamp(0.52 + samp.slope * 0.38 + (texFine - 0.5) * 0.12, 0.20, 0.95);
              hvNorm = clamp(0.28 + vegCanopy * 0.48 + (texMed - 0.5) * 0.12, 0.12, 0.82);
              ratioNorm = clamp(0.40 + (hhNorm - hvNorm * 0.6) * 0.58, 0.18, 0.92);
            }
          } else if (regionId === 'pantanal_brazil') {
            // Tropical forest volume scatter & wetland grasses
            hhNorm = clamp(0.38 + soilWetness * 0.45 + (texFine - 0.5) * 0.12, 0.15, 0.95);
            hvNorm = clamp(0.42 + vegCanopy * 0.52 + (texMed - 0.5) * 0.12, 0.15, 0.95);
            ratioNorm = clamp(0.32 + (hhNorm - hvNorm * 0.5) * 0.7, 0.15, 0.95);
          } else {
            // Yukon Alaska tundra & bluff
            hhNorm = clamp(0.42 + (1 - vegCanopy) * 0.35 + (texFine - 0.5) * 0.14, 0.15, 0.95);
            hvNorm = clamp(0.28 + vegCanopy * 0.48 + (texMed - 0.5) * 0.12, 0.12, 0.88);
            ratioNorm = clamp(0.38 + (hhNorm - hvNorm * 0.55) * 0.65, 0.15, 0.95);
          }

          R = Math.min(255, Math.round(hhNorm * 218 * radarSlopeGain * speckle));
          G = Math.min(255, Math.round(hvNorm * 196 * radarSlopeGain * speckle));
          B = Math.min(255, Math.round(ratioNorm * 184 * radarSlopeGain * speckle));
        }
      } else if (mode === 'sband_moisture') {
        const topoDrainage = clamp(1 - samp.slope * 1.15, 0.25, 1.05);
        const spatialWet = clamp(
          isOpenWater
            ? 0.99
            : soilWetness * topoDrainage + (texMed - 0.5) * 0.16 + (texFine - 0.5) * 0.06,
          0.04,
          0.99
        );

        let mR = 0;
        let mG = 0;
        let mB = 0;
        if (spatialWet < 0.28) {
          const t = spatialWet / 0.28;
          mR = lerp(185, 224, t);
          mG = lerp(38, 132, t);
          mB = lerp(38, 32, t);
        } else if (spatialWet < 0.55) {
          const t = (spatialWet - 0.28) / 0.27;
          mR = lerp(224, 96, t);
          mG = lerp(132, 168, t);
          mB = lerp(32, 68, t);
        } else if (spatialWet < 0.80) {
          const t = (spatialWet - 0.55) / 0.25;
          mR = lerp(96, 14, t);
          mG = lerp(168, 165, t);
          mB = lerp(68, 198, t);
        } else {
          const t = (spatialWet - 0.80) / 0.20;
          mR = lerp(14, 72, t);
          mG = lerp(165, 226, t);
          mB = lerp(198, 255, t);
        }

        const reliefFactor = isOpenWater ? 0.96 : 0.42 + shade * 0.66;
        R = mR * reliefFactor;
        G = mG * reliefFactor;
        B = mB * reliefFactor;
      } else {
        const majorStep = elevSpan < 200 ? 16 : elevSpan < 400 ? 32 : elevSpan < 1000 ? 90 : 180;
        const minorStep = majorStep / 4;
        const modMajor = ((elev % majorStep) + majorStep) % majorStep;
        const modMinor = ((elev % minorStep) + minorStep) % minorStep;

        const isMajor = !isOpenWater && modMajor < majorStep * 0.085;
        const isMinor = !isOpenWater && modMinor < minorStep * 0.12;
        const isGrid = px % 36 === 0 || py % 36 === 0;

        const def = computeRegionalDeformationM(regionId, u, v, pass);
        const isHazardRing =
          Math.abs(def.losMeters) > 0.08 &&
          Math.sin(Math.abs(def.losMeters) * 42 - animTimeSec * 4.5) > 0.72;

        if (isHazardRing) {
          R = 248;
          G = 82;
          B = 114;
        } else if (isOpenWater) {
          const waveLine = (px + py + Math.floor(animTimeSec * 12)) % 9 === 0;
          R = waveLine ? 24 : 6;
          G = waveLine ? 128 : 34;
          B = waveLine ? 210 : 68;
        } else if (isMajor) {
          R = 56;
          G = 224;
          B = 248;
        } else if (isMinor) {
          R = 18;
          G = 118;
          B = 148;
        } else if (isGrid) {
          R = 12;
          G = 46;
          B = 72;
        } else {
          R = 4 + shade * 10;
          G = 14 + shade * 24;
          B = 26 + shade * 36;
        }
      }

      data[idx] = clamp(Math.round(R), 0, 255);
      data[idx + 1] = clamp(Math.round(G), 0, 255);
      data[idx + 2] = clamp(Math.round(B), 0, 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

const loadedNisarImages = new Map<string, HTMLImageElement>();

export function getNisarImagePath(regionId: GlobalRegionId, pass?: TimelinePass): string {
  if (regionId === 'rasuwa_nepal' && pass) {
    if (pass.index === 0) return '/nisar-derived/rasuwa_nepal_pre.png';
    if (pass.index === 1 || pass.index === 2) return '/nisar-derived/rasuwa_nepal_pair.png';
    return '/nisar-derived/rasuwa_nepal_nisar.png';
  }
  return `/nisar-derived/${regionId}_nisar.png`;
}

export function renderNisarBrowseToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  regionId: GlobalRegionId,
  pass?: TimelinePass
): void {
  const imgPath = getNisarImagePath(regionId, pass);
  let img = loadedNisarImages.get(imgPath);

  if (!img && typeof window !== 'undefined' && typeof Image !== 'undefined') {
    img = new Image();
    img.src = imgPath;
    img.onload = () => {
      for (const k of cachedRasterCanvases.keys()) {
        if (k.includes(':nisar_browse:')) {
          cachedRasterCanvases.delete(k);
        }
      }
    };
    loadedNisarImages.set(imgPath, img);
  }

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, 0, 0, width, height);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 4, width - 8, height - 8);
    return;
  }

  // High-fidelity fallback while loading or in node environment
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const sp = 0.5 + (hash2(px, py, 9901) - 0.5) * 0.4;
      const scan = (py % 4 === 0) ? 0.85 : 1.0;
      data[idx] = Math.round(24 * sp * scan);
      data[idx + 1] = Math.round(48 * sp * scan);
      data[idx + 2] = Math.round(72 * sp * scan);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(width * 0.08, height * 0.40, width * 0.84, 48);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width * 0.08, height * 0.40, width * 0.84, 48);
  ctx.fillStyle = '#bae6fd';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🛰️ NASA NISAR L-BAND ACQUISITION (ASF DAAC)', width * 0.5, height * 0.40 + 20);
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Rendered Browse Image • Visual Comparison Only', width * 0.5, height * 0.40 + 36);
}

/**
 * Unified entry point used by both LabSupercomputerScreen (2D + Split Looking Glass)
 * and TerrainMap3D (WebGL Draped Surface Shader).
 */
export function buildRegionalRasterCanvas(
  regionId: GlobalRegionId,
  mode: RadarLayerMode,
  pass: TimelinePass,
  animPhase = 0,
  scale = 2
): HTMLCanvasElement {
  if (regionId === 'rasuwa_nepal' && mode !== 'nisar_browse') {
    return buildRasterLayerCanvas(mode, pass, animPhase, scale);
  }

  const effectiveScale = Math.min(3, Math.max(2, scale));
  const cacheKey = `${regionId}:${mode}:${pass.id}:${effectiveScale}:${Math.round(animPhase * 2)}`;
  const hit = cachedRasterCanvases.get(cacheKey);
  if (hit) return hit;

  const dem = getRegionalDem(regionId);
  const width = dem.cols * effectiveScale;
  const height = dem.rows * effectiveScale;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  if (mode === 'nisar_browse') {
    renderNisarBrowseToCanvas(ctx, width, height, regionId, pass);
  } else {
    renderRegionalRasterToCanvas(ctx, width, height, regionId, mode, pass, animPhase);
  }

  if (cachedRasterCanvases.size > 48) {
    const oldest = cachedRasterCanvases.keys().next().value;
    if (oldest) cachedRasterCanvases.delete(oldest);
  }
  cachedRasterCanvases.set(cacheKey, canvas);
  return canvas;
}
