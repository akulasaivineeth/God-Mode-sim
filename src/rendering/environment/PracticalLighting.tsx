/**
 * Presentation-only practical lights — warm entrances + square/park lamps at night.
 */
import { useMemo } from 'react';
import { CANONICAL_TOWN, terrainHeightAt } from '@/world/townLayout';

interface PracticalLightingProps {
  timeOfDay: number;
}

const FACILITY_GLOWS = [
  { x: 11, z: -10, label: 'home' },
  { x: -11, z: 11, label: 'store' },
  { x: -11, z: 23, label: 'workshop' },
] as const;

export function PracticalLighting({ timeOfDay }: PracticalLightingProps) {
  const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
  const elevation = Math.sin(sunAngle);
  const nightFactor = elevation < 0.15 ? 1 - Math.max(0, elevation) / 0.15 : 0;

  const lampPositions = useMemo(() => {
    const sq = CANONICAL_TOWN.square;
    const park = CANONICAL_TOWN.park;
    const lamps: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      lamps.push({
        x: sq.center.x + Math.cos(a) * 5.8,
        z: sq.center.z + Math.sin(a) * 5.8,
        y: terrainHeightAt(sq.center.x + Math.cos(a) * 5.8, sq.center.z + Math.sin(a) * 5.8) + 1.8,
      });
    }
    lamps.push({
      x: park.center.x,
      z: park.center.z + 5,
      y: terrainHeightAt(park.center.x, park.center.z + 5) + 1.6,
    });
    return lamps;
  }, []);

  if (nightFactor <= 0.01) return null;

  return (
    <group>
      {FACILITY_GLOWS.map((f) => {
        const y = terrainHeightAt(f.x, f.z);
        return (
          <group key={f.label} position={[f.x, y + 2.2, f.z]}>
            <pointLight
              color="#ffd8a0"
              intensity={nightFactor * 0.4}
              distance={12}
              decay={2}
            />
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color="#ffe8b8"
                emissive="#c89040"
                emissiveIntensity={nightFactor * 0.8}
              />
            </mesh>
          </group>
        );
      })}
      {lampPositions.map((lamp, i) => (
        <pointLight
          key={i}
          position={[lamp.x, lamp.y, lamp.z]}
          color="#ffe0a8"
          intensity={nightFactor * 0.29}
          distance={10}
          decay={2}
        />
      ))}
    </group>
  );
}
