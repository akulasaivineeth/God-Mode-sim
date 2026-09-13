/**
 * Day/night lighting — SIM-TIME-004.
 *
 * Plain English: The sky colour and sun position are computed purely from the
 * simulated time of day (0 = midnight, 0.5 = noon). Because the lighting is a
 * direct function of authoritative simulated time, it stays exactly correct at
 * every speed — at 1000× the sun simply jumps instead of gliding, but it always
 * shows the true simulated hour (ARCH-005 / M01-GATE).
 */
import { useMemo } from 'react';
import { Color } from 'three';

interface DayNightLightingProps {
  /** Fraction of the day in [0,1): 0 = 00:00, 0.5 = 12:00. */
  timeOfDay: number;
}

const NIGHT_SKY = new Color('#0a1020');
const HORIZON_SKY = new Color('#e08a4c');
const DAY_SKY = new Color('#8fc0f0');

const SUN_DISTANCE = 60;

export function DayNightLighting({ timeOfDay }: DayNightLightingProps) {
  const { sunPosition, dirIntensity, ambientIntensity, hemiIntensity, skyColor } = useMemo(() => {
    // Sun angle: 0 at 06:00 (east horizon), π/2 at noon (overhead),
    // π at 18:00 (west horizon), -π/2 at midnight (below).
    const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
    const elevation = Math.sin(sunAngle);
    const dayFactor = Math.max(0, elevation); // 0 at/under horizon, 1 at noon

    const sunPos: [number, number, number] = [
      Math.cos(sunAngle) * SUN_DISTANCE,
      Math.max(elevation, -0.2) * SUN_DISTANCE,
      SUN_DISTANCE * 0.35,
    ];

    // Sky: night → horizon (dawn/dusk glow) → day.
    const sky = NIGHT_SKY.clone();
    // Horizon glow peaks when the sun is near the horizon (low |elevation|)
    // but only while it is up-ish (sunrise/sunset), fading into day/night.
    const horizonGlow = Math.max(0, 1 - Math.abs(elevation) * 4) * (elevation > -0.25 ? 1 : 0);
    sky.lerp(HORIZON_SKY, horizonGlow);
    sky.lerp(DAY_SKY, dayFactor);

    return {
      sunPosition: sunPos,
      dirIntensity: 0.35 + dayFactor * 1.15,
      ambientIntensity: 0.46 + dayFactor * 0.42,
      hemiIntensity: 0.4 + dayFactor * 0.48,
      skyColor: `#${sky.getHexString()}`,
    };
  }, [timeOfDay]);

  return (
    <group>
      <color attach="background" args={[skyColor]} />
      <hemisphereLight args={['#cfe0f2', '#4a4a33', hemiIntensity]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={sunPosition}
        intensity={dirIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
    </group>
  );
}
