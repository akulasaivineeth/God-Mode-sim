import type { SimMinute } from './types';

/** Simulation clock — M00 uses simMinute only; calendar fields reserved for M01. */
export interface SimulationClock {
  simMinute: SimMinute;
}

export function createClock(simMinute: SimMinute = 0): SimulationClock {
  return { simMinute };
}

export function advanceClock(clock: SimulationClock, minutes = 1): SimulationClock {
  return { simMinute: clock.simMinute + minutes };
}
