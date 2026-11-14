import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('geometry consistency: pre/post differencing requires identical track, frame, and look direction', async () => {
  const regRaw = await readFile(new URL('../public/nisar-derived/nisar_registry.json', import.meta.url), 'utf8');
  const registry = JSON.parse(regRaw);

  const rasuwa = registry['rasuwa_nepal'];
  assert.ok(rasuwa, 'rasuwa_nepal must exist in registry');
  assert.ok(rasuwa.tracking_series, 'tracking_series must exist for rasuwa_nepal');

  const pre = rasuwa.tracking_series.find((s) => s.phase === 'PRE_EVENT');
  const post = rasuwa.tracking_series.find((s) => s.phase === 'POST_EVENT_LATEST');
  const delta = rasuwa.tracking_series.find((s) => s.phase === 'BACKSCATTER_DELTA');
  const coeventAsc = rasuwa.tracking_series.find((s) => s.phase === 'CO_EVENT_PAIR');
  const coeventDesc = rasuwa.tracking_series.find((s) => s.phase === 'CO_EVENT_PAIR_DESCENDING');

  assert.ok(pre, 'PRE_EVENT must exist');
  assert.ok(post, 'POST_EVENT_LATEST must exist');
  assert.ok(delta, 'BACKSCATTER_DELTA must exist');
  assert.ok(coeventAsc, 'CO_EVENT_PAIR must exist');
  assert.ok(coeventDesc, 'CO_EVENT_PAIR_DESCENDING must exist');

  // Verify single-geometry consistency for pre, post, delta, and ascending co-event
  assert.equal(pre.track, '98', 'Pre-event track must be 98');
  assert.equal(post.track, '98', 'Post-event track must be 98');
  assert.equal(delta.track, '98', 'Delta map track must be 98');
  assert.equal(coeventAsc.track, '98', 'Ascending co-event pair track must be 98');

  assert.equal(pre.frame, '16', 'Pre-event frame must be 16');
  assert.equal(post.frame, '16', 'Post-event frame must be 16');
  assert.equal(delta.frame, '16', 'Delta map frame must be 16');
  assert.equal(coeventAsc.frame, '16', 'Ascending co-event pair frame must be 16');

  assert.equal(pre.direction, 'ASCENDING', 'Pre-event direction must be ASCENDING');
  assert.equal(post.direction, 'ASCENDING', 'Post-event direction must be ASCENDING');
  assert.equal(delta.direction, 'ASCENDING', 'Delta map direction must be ASCENDING');
  assert.equal(coeventAsc.direction, 'ASCENDING', 'Ascending pair direction must be ASCENDING');

  // Verify opposite look direction for descending pair
  assert.equal(coeventDesc.track, '48', 'Descending pair track must be 48');
  assert.equal(coeventDesc.frame, '74', 'Descending pair frame must be 74');
  assert.equal(coeventDesc.direction, 'DESCENDING', 'Descending pair direction must be DESCENDING');
});

