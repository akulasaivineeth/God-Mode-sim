import { describe, expect, it } from 'vitest';
import { poseForAction } from '@/rendering/citizenPresentation';
import { facingAlongPath } from '@/world/navigation';
import { M02_CITIZEN_ASSIGNMENTS } from '@/world/facilityPoints';

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
});
