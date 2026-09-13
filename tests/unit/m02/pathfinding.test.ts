import { describe, expect, it } from 'vitest';
import { NAV_NODES } from '@/simulation/model/locations';
import { pathLength, pathWaypoints, shortestNodePath } from '@/simulation/model/pathfinding';

/** NPC-MOVE-001 — deterministic waypoint routing. */
describe('NPC-MOVE-001 pathfinding', () => {
  it('is deterministic for the same query', () => {
    expect(shortestNodePath('home', 'store')).toEqual(shortestNodePath('home', 'store'));
  });

  it('routes home to store via the square (not through buildings)', () => {
    const path = shortestNodePath('home', 'store');
    expect(path[0]).toBe('home');
    expect(path[path.length - 1]).toBe('store');
    expect(path).toContain('SQ');
  });

  it('waypoints exclude the start node and end at the target', () => {
    const wps = pathWaypoints('home', 'work');
    expect(wps.length).toBeGreaterThan(0);
    expect(wps[wps.length - 1]).toEqual(NAV_NODES.work);
  });

  it('reports a positive path length', () => {
    const wps = pathWaypoints('home', 'store');
    expect(pathLength(NAV_NODES.home, wps)).toBeGreaterThan(0);
  });

  it('returns a single-node path when from === to', () => {
    expect(shortestNodePath('home', 'home')).toEqual(['home']);
    expect(pathWaypoints('home', 'home')).toEqual([]);
  });
});
