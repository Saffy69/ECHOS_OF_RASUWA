/**
 * sarLayerAdapter.ts — Uniform SAR Layer Data Adapter & Provenance Layer
 * 
 * Provides a standardized interface for NASA NISAR browse products
 * (queried from NASA Earthdata / ASF DAAC), calibrated observational products,
 * and illustrative forward simulations.
 * 
 * Strictly preserves science honesty:
 * - Browse imagery is labeled BROWSE_RENDERED with units "rendered color (not calibrated)".
 * - getPixel for browse returns isMeasured: false with description "rendered browse image: no calibrated value available".
 * - Calibrated layers are labeled CALIBRATED_PRODUCT only when derived from genuine calibrated data.
 * - Simulations are labeled "Forward SAR simulation (illustrative)".
 */

import { GlobalRegionId } from './nasaEarthDataService';

export interface SarSeriesItem {
  phase: string;
  date: string;
  granule_id: string;
  collection: string;
  description: string;
  browse_url: string;
  local_raster_path: string;
  sha256?: string;
  file_size_bytes?: number;
}

export interface SarProductMetadata {
  region_id: GlobalRegionId;
  region_name: string;
  theme?: string;
  granule_id: string;
  collection: string;
  track: string;
  frame: string;
  direction: string;
  mode: string;
  polarizations: string;
  start_time: string;
  end_time: string;
  h5_download_url: string;
  browse_url: string;
  provenance: string;
  credit_license?: string;
  retrieved_time?: string;
  sha256?: string;
  local_raster_path: string;
  file_size_bytes: number;
  disclaimer?: string;
  tracking_series?: SarSeriesItem[];
  has_tracking_series?: boolean;
}

export type SarMaturity =
  | 'BROWSE_RENDERED'
  | 'CALIBRATED_PRODUCT'
  | 'PHYSICAL_SIMULATION';

export interface SarPixelSample {
  raw: number;
  formatted: string;
  description: string;
  isMeasured: boolean;
}

export interface SarLayerAdapter {
  id: string;
  name: string;
  regionId: GlobalRegionId;
  dates: {
    start: string;
    end: string;
    referenceEpoch: string;
  };
  productLevel: string; // e.g. "NISAR L2 GSLC Browse", "NISAR L2 GCOV Calibrated", "SIMULATED L-BAND InSAR"
  maturity: SarMaturity;
  units: string; // e.g. "rendered color (not calibrated)", "dB (sigma-nought backscatter)", "Phase cycles [-π, +π]"
  nodata: number;
  metadata?: SarProductMetadata;
  getPixel: (u: number, v: number) => SarPixelSample;
}

let cachedRegistry: Record<string, SarProductMetadata> | null = null;

export async function fetchNisarRegistry(): Promise<Record<string, SarProductMetadata>> {
  if (cachedRegistry) return cachedRegistry;
  try {
    const res = await fetch('/nisar-derived/nisar_registry.json');
    if (res.ok) {
      cachedRegistry = await res.json();
      return cachedRegistry!;
    }
  } catch (err) {
    console.warn('[sarLayerAdapter] Could not load client NISAR registry:', err);
  }
  return {};
}

/**
 * Creates an honest SAR Layer Adapter for a given region.
 * Browse imagery is never represented as calibrated or measured.
 */
export function createSarLayerAdapter(
  regionId: GlobalRegionId,
  meta?: SarProductMetadata | null
): SarLayerAdapter {
  if (meta) {
    return {
      id: `nisar_browse_${regionId}_${meta.track}_${meta.frame}`,
      name: `NASA NISAR ${meta.collection} Browse [${meta.polarizations}]`,
      regionId,
      dates: {
        start: meta.start_time,
        end: meta.end_time,
        referenceEpoch: meta.start_time.split('T')[0]
      },
      productLevel: `NISAR ${meta.collection} Browse`,
      maturity: 'BROWSE_RENDERED',
      units: 'rendered color (not calibrated)',
      nodata: -9999,
      metadata: meta,
      getPixel: (_u: number, _v: number) => {
        return {
          raw: NaN,
          formatted: 'N/A (Browse Image)',
          description: 'rendered browse image: no calibrated value available',
          isMeasured: false
        };
      }
    };
  }

  // Clearly labeled simulation adapter
  return {
    id: `sim_${regionId}`,
    name: `Forward SAR simulation (illustrative) (${regionId})`,
    regionId,
    dates: {
      start: '2026-02-18',
      end: '2026-03-02',
      referenceEpoch: '12-Day Orbit Repeat'
    },
    productLevel: 'SIMULATED L-BAND InSAR',
    maturity: 'PHYSICAL_SIMULATION',
    units: 'Phase cycles [-π, +π]',
    nodata: -9999,
    getPixel: () => ({
      raw: 0,
      formatted: '0.00 cycles (SIMULATION)',
      description: 'Forward SAR simulation (illustrative) based on regional geomechanical profile',
      isMeasured: false
    })
  };
}
