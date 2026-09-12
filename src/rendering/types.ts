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
