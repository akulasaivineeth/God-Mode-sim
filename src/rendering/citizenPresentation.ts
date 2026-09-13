/**
 * Presentation-only pose mapping for M02 shared humanoid — VIS-001.
 *
 * Plain English: Maps simulation action kinds to renderer pose vocabulary.
 * Simulation outcomes never depend on these labels.
 */
import type { ActionKind } from '@/simulation/core/citizens/types';

export type CitizenPose = 'idle' | 'walk' | 'sit' | 'work';

const SIT_ACTIONS = new Set<ActionKind>(['eat', 'shop', 'drink', 'sleep']);

export function poseForAction(action: ActionKind): CitizenPose {
  if (action === 'travel') return 'walk';
  if (action === 'work') return 'work';
  if (SIT_ACTIONS.has(action)) return 'sit';
  return 'idle';
}
