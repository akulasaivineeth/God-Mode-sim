/**
 * WF02 R6 preset-tier visibility — deterministic presentation gating.
 * Same rules for gameplay and evidence capture (?cam= / ?evidence=1).
 */
import type { CameraView } from '../cameraPresets';

export type CompositionTier =
  | 'core'
  | 'baselineVegetation'
  | 'district'
  | 'orchard'
  | 'park'
  | 'periphery';

const TIER_PRESETS: Record<CompositionTier, readonly CameraView[]> = {
  core: [
    'overview',
    'angled',
    'street',
    'home-street',
    'store-street',
    'workshop-street',
    'store-workshop',
    'river',
    'square',
  ],
  /** Quaternius M02/riverbank/park accents — excluded from Overview/Angled. */
  baselineVegetation: [
    'street',
    'home-street',
    'store-street',
    'workshop-street',
    'store-workshop',
    'river',
    'square',
  ],
  district: [
    'overview',
    'angled',
    'street',
    'square',
    'river',
    'store-workshop',
    'home-street',
    'store-street',
    'workshop-street',
  ],
  orchard: ['overview', 'angled', 'street', 'home-street'],
  park: ['overview', 'angled', 'river', 'street'],
  periphery: ['overview', 'angled'],
};

export function isCompositionTierVisible(tier: CompositionTier, cameraView: CameraView): boolean {
  return TIER_PRESETS[tier].includes(cameraView);
}

/** R6: Overview/Angled mount zero Quaternius vegetation. */
export function isBaselineVegetationVisible(cameraView: CameraView): boolean {
  return isCompositionTierVisible('baselineVegetation', cameraView);
}
