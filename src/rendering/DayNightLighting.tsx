/**
 * Day/night lighting — SIM-TIME-004.
 *
 * Plain English: Sky colour and sun position are computed from simulated time of day.
 * WF01 R3: dawn/dusk retain a readability floor so 06:00 world-start is clearly
 * daytime without faking evidence-only exposure (clock-driven lighting preserved).
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

/** Readable daylight floor during the sun-up arc (~06:00–18:00). WF02 R3: warmer dawn. */
const DAWN_DAYLIGHT_FLOOR = 0.62;

export function DayNightLighting({ timeOfDay }: DayNightLightingProps) {
  const { sunPosition, dirIntensity, ambientIntensity, hemiIntensity, skyColor } = useMemo(() => {
    const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
    const elevation = Math.sin(sunAngle);
    const sunUp = elevation > -0.12;
    const rawDay = Math.max(0, elevation);
    const dayFactor = sunUp ? Math.max(DAWN_DAYLIGHT_FLOOR, rawDay) : 0;

    const sunPos: [number, number, number] = [
      Math.cos(sunAngle) * SUN_DISTANCE,
      Math.max(elevation, -0.2) * SUN_DISTANCE,
      SUN_DISTANCE * 0.35,
    ];

    const sky = NIGHT_SKY.clone();
    const horizonGlow = Math.max(0, 1 - Math.abs(elevation) * 4) * (elevation > -0.25 ? 1 : 0);
    sky.lerp(HORIZON_SKY, horizonGlow);
    sky.lerp(DAY_SKY, dayFactor);

    return {
      sunPosition: sunPos,
      dirIntensity: 0.48 + dayFactor * 1.15,
      ambientIntensity: 0.56 + dayFactor * 0.42,
      hemiIntensity: 0.46 + dayFactor * 0.46,
      skyColor: `#${sky.getHexString()}`,
    };
  }, [timeOfDay]);

  return (
    <group>
      <color attach="background" args={[skyColor]} />
      <hemisphereLight args={['#e8f0ff', '#8a7848', hemiIntensity]} />
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
