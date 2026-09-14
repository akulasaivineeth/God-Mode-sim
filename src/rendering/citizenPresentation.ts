/**
 * Presentation-only pose mapping for the M02 shared character — VIS-001.
 *
 * Plain English: Maps the simulation's action + phase to a renderer pose
 * vocabulary used to select the character's animation clip. Simulation outcomes
 * never depend on these labels (ARCH-002).
 */
import type { ActionType } from '@/simulation/model/types';

export type CitizenPose = 'idle' | 'walk' | 'sit' | 'work';

const SIT_ACTIONS = new Set<ActionType>(['eat', 'drink', 'sleep']);

export function poseForAction(action: ActionType, phase: 'travel' | 'perform' | 'idle'): CitizenPose {
  if (phase === 'travel') return 'walk';
  if (action === 'work') return 'work';
  if (SIT_ACTIONS.has(action)) return 'sit';
  return 'idle';
}
