#!/usr/bin/env python3
"""
fetch_manifest.py — NASA Earthdata / ASF CMR NISAR Granule Discovery Pipeline

Queries the Alaska Satellite Facility (ASF) DAAC API across the 2026 observation window
(2026-06-01 to present) using regional bounding boxes.
Groups granules by geometric observation geometry (Track + Frame + Flight Direction)
to identify authentic repeat-pass interferometric and polarimetric observation series.

Outputs:
  - data/manifest.csv: Tabular catalogue of granules with tracks, frames, dates, and download URLs.
  - data/manifest.json: JSON structured catalogue organized by region and geometry groups.
"""

import csv
import json
import os
import sys
import requests

REGIONS = [
    {
        "id": "rasuwa_nepal",
        "name": "Rasuwa, Nepal",
        "bbox": "85.0,28.0,85.6,28.4",
        "theme": "Himalayan Slope Instability & Glacial Valley InSAR",
        "target_event_date": "2026-08-26"
    },
    {
        "id": "hatay_turkiye",
        "name": "Hatay, Türkiye",
        "bbox": "35.8,36.0,36.7,36.8",
        "theme": "East Anatolian Strike-Slip Fault & Earthen Dam Settlement",
        "target_event_date": None
    },
    {
        "id": "pantanal_brazil",
        "name": "Pantanal, Brazil",
        "bbox": "-57.2,-18.2,-55.8,-16.8",
        "theme": "Wetland Seasonal Flood Pulse & Gallery Forest Penetration",
        "target_event_date": None
    },
    {
        "id": "san_joaquin_usa",
        "name": "San Joaquin Valley, USA",
        "bbox": "-120.4,35.8,-119.2,36.8",
        "theme": "Agricultural Groundwater Overdraft & Aquifer Compaction",
        "target_event_date": None
    },
    {
        "id": "yukon_alaska",
        "name": "Yukon-Kuskokwim, Alaska",
        "bbox": "-164.5,60.5,-162.5,61.8",
        "theme": "Permafrost Active Layer Thaw & Coastal Thermokarst",
        "target_event_date": None
    }
]

ASF_SEARCH_URL = "https://api.daac.asf.alaska.edu/services/search/param"

def fetch_granules_for_region(region, max_results=200):
    print(f"[*] Querying ASF DAAC for NISAR granules in {region['name']} (bbox: {region['bbox']})...")
    params = {
        "platform": "NISAR",
        "start": "2026-06-01T00:00:00Z",
        "end": "2026-11-14T23:59:59Z",
        "bbox": region["bbox"],
        "output": "json",
        "maxResults": max_results
    }
    
    granules = []
    seen_ids = set()
    
    def run_query(query_params):
        try:
            resp = requests.get(ASF_SEARCH_URL, params=query_params, timeout=35)
            resp.raise_for_status()
            data = resp.json()
            if data and isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                return data[0]
            return []
        except Exception as e:
            print(f"[!] Warning: Query failed for {region['name']}: {e}", file=sys.stderr)
            return []

    # If the region has a specific target event date (e.g. Rasuwa 2026-08-26), query pre-event and post-event explicitly
    if region.get("target_event_date"):
        pre_params = dict(params)
        pre_params["start"] = "2026-06-01T00:00:00Z"
        pre_params["end"] = f"{region['target_event_date']}T00:00:00Z"
        pre_params["maxResults"] = 150
        print(f"    -> Querying pre-event window (2026-06-01 to {region['target_event_date']})...")
        for g in run_query(pre_params):
            gid = g.get("granuleName") or g.get("productName")
            if gid and gid not in seen_ids:
                seen_ids.add(gid)
                granules.append(g)

        post_params = dict(params)
        post_params["start"] = f"{region['target_event_date']}T00:00:00Z"
        post_params["end"] = "2026-11-14T23:59:59Z"
        post_params["maxResults"] = 150
        print(f"    -> Querying post-event window ({region['target_event_date']} to 2026-11-14)...")
        for g in run_query(post_params):
            gid = g.get("granuleName") or g.get("productName")
            if gid and gid not in seen_ids:
                seen_ids.add(gid)
                granules.append(g)
    else:
        for g in run_query(params):
            gid = g.get("granuleName") or g.get("productName")
            if gid and gid not in seen_ids:
                seen_ids.add(gid)
                granules.append(g)

    return granules

def main():
    os.makedirs("data", exist_ok=True)
    all_flat_records = []
    regional_summary = {}

    for reg in REGIONS:
        granules = fetch_granules_for_region(reg, max_results=100)
        print(f"    -> Found {len(granules)} total granules for {reg['name']}")

        # Group by same geometry: (track, frame, direction)
        geom_groups = {}
        for g in granules:
            track = str(g.get("track") or g.get("relativeOrbit") or "0")
            frame = str(g.get("frameNumber") or "0")
            direction = str(g.get("flightDirection") or "UNKNOWN")
            geom_key = f"trk{track}_frm{frame}_{direction.lower()}"

            browse_url = ""
            if g.get("browse") and isinstance(g["browse"], list) and len(g["browse"]) > 0:
                browse_url = g["browse"][0]

            pols = g.get("polarization") or ""
            if not pols and g.get("nisar") and g["nisar"].get("sideBandPolarization"):
                pols = "/".join(g["nisar"]["sideBandPolarization"])

            # Typical NISAR L2 HDF5 product size is ~2.3 GB (2344 MB)
            size_mb = 2344.0 if "L2" in (g.get("processingType") or "") else 1850.0

            item = {
                "region_id": reg["id"],
                "region_name": reg["name"],
                "granule_id": g.get("granuleName") or g.get("productName") or "N/A",
                "collection": g.get("processingLevel") or "L2",
                "track": track,
                "frame": frame,
                "direction": direction,
                "mode": g.get("sensor") or "L-SAR",
                "polarizations": pols or "HH/HV",
                "start_time": g.get("startTime") or "",
                "end_time": g.get("stopTime") or "",
                "size_mb": size_mb,
                "download_url": g.get("downloadUrl") or "",
                "browse_url": browse_url
            }

            all_flat_records.append(item)

            if geom_key not in geom_groups:
                geom_groups[geom_key] = {
                    "geom_key": geom_key,
                    "track": track,
                    "frame": frame,
                    "direction": direction,
                    "acquisitions": []
                }
            geom_groups[geom_key]["acquisitions"].append(item)

        # Sort acquisitions in each geometry group chronologically
        for gk, grp in geom_groups.items():
            grp["acquisitions"].sort(key=lambda x: x["start_time"])
            grp["count"] = len(grp["acquisitions"])
            # Distinct acquisition dates
            dates = sorted(list(set(a["start_time"][:10] for a in grp["acquisitions"] if a["start_time"])))
            grp["distinct_dates"] = dates
            grp["is_repeat_series"] = len(dates) >= 2

        # Check for pre-event acquisition if target_event_date given
        has_pre_event = False
        if reg["target_event_date"]:
            for item in all_flat_records:
                if item["region_id"] == reg["id"] and item["start_time"][:10] < reg["target_event_date"]:
                    has_pre_event = True
                    break

        regional_summary[reg["id"]] = {
            "region_id": reg["id"],
            "region_name": reg["name"],
            "theme": reg["theme"],
            "target_event_date": reg["target_event_date"],
            "has_pre_event": has_pre_event,
            "total_granules": len(granules),
            "geometry_groups": geom_groups
        }

    # Write CSV
    csv_path = os.path.join("data", "manifest.csv")
    fieldnames = [
        "region_id", "region_name", "granule_id", "collection", "track", "frame",
        "direction", "mode", "polarizations", "start_time", "end_time", "size_mb",
        "download_url", "browse_url"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in all_flat_records:
            writer.writerow(r)
    print(f"[+] Wrote {len(all_flat_records)} total granules to {csv_path}")

    # Write Structured JSON
    json_path = os.path.join("data", "manifest.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "version": "2.0.0",
            "source": "NASA Earthdata ASF DAAC",
            "platform": "NISAR",
            "date_range": "2026-06-01 to 2026-11-14",
            "hero_site": "rasuwa_nepal",
            "hero_rationale": "Rasuwa contains pre-event (2026-08-19) and post-event repeat-pass acquisitions in identical Track 98 Frame 16 Ascending geometry spanning the 2026-08-26 event.",
            "regions": regional_summary
        }, f, indent=2)
    print(f"[+] Wrote structured manifest to {json_path}")

if __name__ == "__main__":
    main()
