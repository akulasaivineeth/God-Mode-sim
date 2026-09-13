import { describe, expect, it } from 'vitest';
import { poseForAction } from '@/rendering/citizenPresentation';
import { toRenderSnapshot } from '@/rendering/types';
import { createM02Citizen } from '@/simulation/core/citizens/createCitizen';
import { createM02WorldSnapshot } from '@/simulation/core/m02Init';
import { Mulberry32Prng } from '@/simulation/core/prng';
import { facingAlongPath } from '@/world/navigation';
import { getFacilityPoint, M02_CITIZEN_ASSIGNMENTS } from '@/world/facilityPoints';

describe('M02 citizen presentation', () => {
  it('maps eat/shop/drink/sleep to sit pose', () => {
    expect(poseForAction('eat')).toBe('sit');
    expect(poseForAction('shop')).toBe('sit');
    expect(poseForAction('drink')).toBe('sit');
    expect(poseForAction('sleep')).toBe('sit');
  });

  it('maps travel and work to walk/work poses', () => {
    expect(poseForAction('travel')).toBe('walk');
    expect(poseForAction('work')).toBe('work');
    expect(poseForAction('shower')).toBe('idle');
  });

  it('returns a stable facing angle along home-to-store path', () => {
    const homeNode = `facility-${M02_CITIZEN_ASSIGNMENTS.homeId}`;
    const storeNode = `facility-${M02_CITIZEN_ASSIGNMENTS.storeId}`;
    const facing = facingAlongPath([homeNode, storeNode], 1);
    expect(Number.isFinite(facing)).toBe(true);
    expect(facing).not.toBe(0);
  });

  it('renders citizens at presentation spots while simulation stays at interior', () => {
    const prng = new Mulberry32Prng('test-seed');
    const citizen = createM02Citizen(prng);
    const interior = getFacilityPoint(M02_CITIZEN_ASSIGNMENTS.homeId).interior;
    const presentation = getFacilityPoint(M02_CITIZEN_ASSIGNMENTS.homeId).presentationSpot;
    const snapshot = createM02WorldSnapshot('test', 'm02.1');
    snapshot.citizens = [
      {
        ...citizen,
        position: { x: interior.x, z: interior.z },
        currentFacilityId: M02_CITIZEN_ASSIGNMENTS.homeId,
      },
    ];
    const render = toRenderSnapshot(snapshot);
    expect(render.citizens[0].x).toBe(presentation.x);
    expect(render.citizens[0].z).toBe(presentation.z);
    expect(snapshot.citizens![0].position.x).toBe(interior.x);
  });
});
