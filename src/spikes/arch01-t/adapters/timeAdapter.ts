/** GOD MODE sim-minute as genealogy tick; one sim-minute per tick. */
export const TICKS_PER_YEAR = 525_600;

export type SimMinute = number;

export function simMinuteToTick(simMinute: SimMinute): number {
  return simMinute;
}

export function tickToSimMinute(tick: number): SimMinute {
  return tick;
}
