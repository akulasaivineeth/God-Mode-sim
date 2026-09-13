import { describe, expect, it } from 'vitest';
import { findPath, nearestNodeId, NAV_GRAPH } from '@/world/navigation';
import { M02_CITIZEN_ASSIGNMENTS } from '@/world/facilityPoints';

describe('PATH-001 navigation graph', () => {
  it('connects home, store, and workplace through the authored network', () => {
    expect(NAV_GRAPH.nodes.size).toBeGreaterThan(20);

    const homeNode = `facility-${M02_CITIZEN_ASSIGNMENTS.homeId}`;
    const storeNode = `facility-${M02_CITIZEN_ASSIGNMENTS.storeId}`;
    const workNode = `facility-${M02_CITIZEN_ASSIGNMENTS.workplaceId}`;

    const homeToStore = findPath(homeNode, storeNode);
    const storeToWork = findPath(storeNode, workNode);
    const workToHome = findPath(workNode, homeNode);

    expect(homeToStore).not.toBeNull();
    expect(storeToWork).not.toBeNull();
    expect(workToHome).not.toBeNull();
    expect(homeToStore!.totalDistance).toBeGreaterThan(0);
  });

  it('finds a nearest node for arbitrary ground positions', () => {
    const nodeId = nearestNodeId({ x: 0, z: 0 });
    expect(nodeId.length).toBeGreaterThan(0);
    expect(NAV_GRAPH.nodes.has(nodeId)).toBe(true);
  });
});
