import React from 'react';
import { SarProductMetadata, SarMaturity } from '../services/sarLayerAdapter';

interface ProvenanceChipProps {
  meta?: SarProductMetadata | null;
  maturity?: SarMaturity;
  compact?: boolean;
}

export const ProvenanceChip: React.FC<ProvenanceChipProps> = ({
  meta,
  maturity = 'PHYSICAL_SIMULATION',
  compact = false
}) => {
  if (meta && maturity === 'BROWSE_RENDERED') {
    return (
      <div className="provenance-chip-container" title={`Granule: ${meta.granule_id}`}>
        <span className="provenance-status-tag authentic">
          🛰️ NASA NISAR BROWSE IMAGE ({meta.collection})
        </span>
        {!compact && (
          <span className="provenance-details-text">
            Track {meta.track} • Frame {meta.frame} • {meta.polarizations} • {meta.direction} • {meta.start_time.split('T')[0]} (Rendered browse, not calibrated)
          </span>
        )}
        {meta.h5_download_url && (
          <a
            href={meta.h5_download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="provenance-link"
            title="Download authentic HDF5 product from NASA ASF DAAC"
          >
            NASA H5 ↗
          </a>
        )}
      </div>
    );
  }

  if (meta && maturity === 'CALIBRATED_PRODUCT') {
    return (
      <div className="provenance-chip-container" title={`Granule: ${meta.granule_id}`}>
        <span className="provenance-status-tag authentic">
          🛰️ NASA NISAR CALIBRATED PRODUCT ({meta.collection})
        </span>
        {!compact && (
          <span className="provenance-details-text">
            Track {meta.track} • Frame {meta.frame} • {meta.polarizations} • Calibrated science data
          </span>
        )}
        {meta.h5_download_url && (
          <a
            href={meta.h5_download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="provenance-link"
            title="Download authentic HDF5 product from NASA ASF DAAC"
          >
            NASA H5 ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="provenance-chip-container">
      <span className="provenance-status-tag simulation">
        🔬 SIMULATION (ILLUSTRATIVE)
      </span>
      {!compact && (
        <span className="provenance-details-text">
          Forward geomechanical model • uncalibrated / unverified absolute datum
        </span>
      )}
    </div>
  );
};
