/**
 * Render snapshot boundary — ADR-003 / ARCH-002.
 *
 * Plain English: The 3D layer may only read these fields. It must never write
 * back into simulation state. visualPhase is 0..1 and drives placeholder motion only.
 */
import type { SimMinute } from '@/simulation/core/types';

/** Read-only render DTO — no simulation authority. */
export interface RenderSnapshot {
  simMinute: SimMinute;
  visualPhase: number;
  tickCount: number;
  lastChoice: string;
  accumulator: number;
}

export function toRenderSnapshot(input: {
  clock: { simMinute: SimMinute };
  toy: {
    visualPhase: number;
    tickCount: number;
    lastChoice: string;
    accumulator: number;
  };
}): RenderSnapshot {
  return {
    simMinute: input.clock.simMinute,
    visualPhase: input.toy.visualPhase,
    tickCount: input.toy.tickCount,
    lastChoice: input.toy.lastChoice,
    accumulator: input.toy.accumulator,
  };
}
