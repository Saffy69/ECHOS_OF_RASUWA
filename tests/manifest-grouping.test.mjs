import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic for grouping granules by observation geometry
function groupGranulesByGeometry(granules) {
  const groups = {};
  for (const g of granules) {
    const key = `trk${g.track}_frm${g.frame}_${g.direction.toLowerCase()}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        track: g.track,
        frame: g.frame,
        direction: g.direction,
        acquisitions: []
      };
    }
    groups[key].acquisitions.push(g);
  }

  for (const k in groups) {
    groups[k].acquisitions.sort((a, b) => a.start_time.localeCompare(b.start_time));
    const dates = [...new Set(groups[k].acquisitions.map(a => a.start_time.slice(0, 10)))].sort();
    groups[k].distinct_dates = dates;
    groups[k].is_repeat_series = dates.length >= 2;
  }
  return groups;
}

// Function to find pre-event and post-event pair in same geometry
function findPrePostPair(group, eventDate) {
  const pre = group.acquisitions.filter(a => a.start_time.slice(0, 10) < eventDate);
  const post = group.acquisitions.filter(a => a.start_time.slice(0, 10) >= eventDate);
  if (pre.length > 0 && post.length > 0) {
    return {
      reference: pre[pre.length - 1],
      secondary: post[0],
      temporalSpanDays: Math.round(
        (new Date(post[0].start_time).getTime() - new Date(pre[pre.length - 1].start_time).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    };
  }
  return null;
}

test('manifest geometry grouping and repeat pass detection', () => {
  const fixtureGranules = [
    {
      granule_id: 'NISAR_L2_PR_GCOV_028_098_A_016_20260819',
      track: 98,
      frame: 16,
      direction: 'ASCENDING',
      start_time: '2026-08-19T23:39:18Z',
      collection: 'L2_GCOV'
    },
    {
      granule_id: 'NISAR_L2_PR_GUNW_028_098_A_016_20260831',
      track: 98,
      frame: 16,
      direction: 'ASCENDING',
      start_time: '2026-08-31T23:39:18Z',
      collection: 'L2_GUNW'
    },
    {
      granule_id: 'NISAR_L2_PR_GCOV_035_098_A_016_20261111',
      track: 98,
      frame: 16,
      direction: 'ASCENDING',
      start_time: '2026-11-11T23:39:18Z',
      collection: 'L2_GCOV'
    },
    // Different geometry: descending pass
    {
      granule_id: 'NISAR_L2_PR_GCOV_028_048_D_075_20260816',
      track: 48,
      frame: 75,
      direction: 'DESCENDING',
      start_time: '2026-08-16T12:58:45Z',
      collection: 'L2_GCOV'
    }
  ];

  const groups = groupGranulesByGeometry(fixtureGranules);

  // Assert exactly 2 geometry groups
  assert.equal(Object.keys(groups).length, 2);

  const t98 = groups['trk98_frm16_ascending'];
  assert.ok(t98, 'Track 98 Frame 16 Ascending group must exist');
  assert.equal(t98.acquisitions.length, 3);
  assert.equal(t98.distinct_dates.length, 3);
  assert.equal(t98.is_repeat_series, true);

  // Assert chronological ordering
  assert.equal(t98.acquisitions[0].start_time, '2026-08-19T23:39:18Z');
  assert.equal(t98.acquisitions[1].start_time, '2026-08-31T23:39:18Z');
  assert.equal(t98.acquisitions[2].start_time, '2026-11-11T23:39:18Z');

  // Verify pre/post pair detection across 2026-08-26 event
  const pair = findPrePostPair(t98, '2026-08-26');
  assert.ok(pair, 'Must find valid pre/post pair spanning event date');
  assert.equal(pair.reference.granule_id, 'NISAR_L2_PR_GCOV_028_098_A_016_20260819');
  assert.equal(pair.secondary.granule_id, 'NISAR_L2_PR_GUNW_028_098_A_016_20260831');
  assert.equal(pair.temporalSpanDays, 12, 'NISAR repeat cycle must be 12 days');
});
