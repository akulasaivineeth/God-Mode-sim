// SPDX-License-Identifier: MIT
// Spike-local interface replacing TownBox external name-generation dependency.

import type { Gender } from './types/social.js';

export interface NameService {
  firstName(gender: Gender): string;
  familyName(): string;
}
