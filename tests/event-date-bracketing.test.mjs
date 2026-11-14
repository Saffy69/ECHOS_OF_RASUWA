import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('event date bracketing: co-event InSAR pairs must strictly bracket the August 26, 2026 event', async () => {
  const regRaw = await readFile(new URL('../public/nisar-derived/nisar_registry.json', import.meta.url), 'utf8');
  const registry = JSON.parse(regRaw);

  const rasuwa = registry['rasuwa_nepal'];
  assert.ok(rasuwa, 'rasuwa_nepal must exist in registry');

  const coeventAsc = rasuwa.tracking_series.find((s) => s.phase === 'CO_EVENT_PAIR');
  const coeventDesc = rasuwa.tracking_series.find((s) => s.phase === 'CO_EVENT_PAIR_DESCENDING');

  assert.ok(coeventAsc, 'Ascending co-event pair must exist');
  assert.ok(coeventDesc, 'Descending co-event pair must exist');

  const EVENT_TIMESTAMP = new Date('2026-08-26T00:00:00Z').getTime();

  // 1. Validate Track 98 Ascending GUNW pair (2026-08-19 to 2026-08-31)
  const [ascStartStr, ascEndStr] = coeventAsc.date.split(' to ');
  const ascStart = new Date(`${ascStartStr}T00:00:00Z`).getTime();
  const ascEnd = new Date(`${ascEndStr}T23:59:59Z`).getTime();

  assert.ok(ascStart < EVENT_TIMESTAMP, `Ascending pair start (${ascStartStr}) must be BEFORE event (2026-08-26)`);
  assert.ok(ascEnd > EVENT_TIMESTAMP, `Ascending pair end (${ascEndStr}) must be AFTER event (2026-08-26)`);
  assert.equal(ascStartStr, '2026-08-19', 'Ascending start date must be 2026-08-19');
  assert.equal(ascEndStr, '2026-08-31', 'Ascending end date must be 2026-08-31');

  // Ensure false pre-event granule GUNW 026_098 (ending 2026-08-19) is not mislabeled as co-event
  assert.ok(!coeventAsc.granule_id.includes('GUNW_026_098'), 'Pre-event pair GUNW_026_098 must not be labeled CO_EVENT_PAIR');
  assert.ok(coeventAsc.granule_id.includes('GUNW_028_098'), 'Co-event pair must be GUNW_028_098');

  // 2. Validate Track 48 Descending GUNW pair (2026-08-16 to 2026-08-28)
  const [descStartStr, descEndStr] = coeventDesc.date.split(' to ');
  const descStart = new Date(`${descStartStr}T00:00:00Z`).getTime();
  const descEnd = new Date(`${descEndStr}T23:59:59Z`).getTime();

  assert.ok(descStart < EVENT_TIMESTAMP, `Descending pair start (${descStartStr}) must be BEFORE event (2026-08-26)`);
  assert.ok(descEnd > EVENT_TIMESTAMP, `Descending pair end (${descEndStr}) must be AFTER event (2026-08-26)`);
  assert.equal(descStartStr, '2026-08-16', 'Descending start date must be 2026-08-16');
  assert.equal(descEndStr, '2026-08-28', 'Descending end date must be 2026-08-28');
  assert.ok(coeventDesc.granule_id.includes('GUNW_028_048'), 'Descending pair must be GUNW_028_048');
});

