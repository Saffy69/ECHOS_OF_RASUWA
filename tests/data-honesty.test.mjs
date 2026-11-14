import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('sarLayerAdapter integrity: browse data is never marked isMeasured: true or given fake calibrated units', async () => {
  const content = await readFile(new URL('../src/services/sarLayerAdapter.ts', import.meta.url), 'utf8');

  // Verify no hardcoded numeric literal is returned with isMeasured: true
  assert.ok(!content.includes('-12.4'), 'Hard-coded -12.4 dB must be removed');
  assert.ok(!content.includes("isMeasured: true"), 'Browse layers must never claim isMeasured: true');
  assert.ok(content.includes('rendered browse image: no calibrated value available'), 'Browse layer must explicitly declare uncalibrated state');
  assert.ok(content.includes('rendered color (not calibrated)'), 'Browse units must be rendered color (not calibrated)');
  assert.ok(content.includes('BROWSE_RENDERED'), 'Must support BROWSE_RENDERED maturity');
  assert.ok(content.includes('Forward SAR simulation (illustrative)'), 'Simulation must be labeled Forward SAR simulation (illustrative)');
});
