import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

function computeSha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

test('registry integrity: all registered rasters must exist on disk and match SHA-256 digests', async () => {
  const regPath = new URL('../public/nisar-derived/nisar_registry.json', import.meta.url);
  const regRaw = await readFile(regPath, 'utf8');
  const registry = JSON.parse(regRaw);

  const publicDir = new URL('../public', import.meta.url).pathname;

  for (const [regionId, meta] of Object.entries(registry)) {
    // 1. Verify primary raster
    const primaryPath = join(publicDir, meta.local_raster_path);
    const primaryBuf = await readFile(primaryPath);
    assert.ok(primaryBuf.length > 0, `Primary raster for ${regionId} must have non-zero size`);

    if (meta.sha256) {
      const hash = computeSha256(primaryBuf);
      assert.equal(hash, meta.sha256, `SHA256 mismatch for primary raster of ${regionId}`);
    }

    // 2. Verify tracking series rasters
    if (meta.tracking_series && Array.isArray(meta.tracking_series)) {
      for (const item of meta.tracking_series) {
        const itemPath = join(publicDir, item.local_raster_path);
        const itemBuf = await readFile(itemPath);
        assert.ok(itemBuf.length > 0, `Series raster ${item.local_raster_path} must exist and be non-empty`);

        if (item.sha256) {
          const itemHash = computeSha256(itemBuf);
          assert.equal(itemHash, item.sha256, `SHA256 mismatch for series item ${item.phase}`);
        }
      }
    }
  }

  // 3. Verify sidecar metadata files
  const expectedSidecars = [
    'rasuwa_corridor_t98_diff_meta.json',
    'rasuwa_corridor_t98_coevent_gunw_meta.json',
    'rasuwa_corridor_t48_coevent_gunw_meta.json'
  ];

  for (const sc of expectedSidecars) {
    const scPath = new URL(`../public/nisar-derived/${sc}`, import.meta.url);
    const scRaw = await readFile(scPath, 'utf8');
    const scJson = JSON.parse(scRaw);
    assert.ok(scJson.id, `Sidecar ${sc} must contain an id`);
    assert.ok(scJson.product, `Sidecar ${sc} must contain a product title`);
    assert.ok(scJson.provenance, `Sidecar ${sc} must contain provenance`);
    assert.ok(scJson.credit_license.includes('NASA'), `Sidecar ${sc} must credit NASA`);
  }
});

