import { hashStringToSeed, SeededRandom } from '../vendor/townbox/seededRandom.js';

export const POPULATION_STREAM_SALT = 0x5050_0001;
export const DRAW_STREAM_BASE_SALT = 0x5050_0002;

export function populationSeedFromWorld(worldSeed: string): number {
  return new SeededRandom(hashStringToSeed(worldSeed)).fork(POPULATION_STREAM_SALT).getState();
}

export function drawSeedFromPopulationStream(worldSeed: string, drawIndex: number): number {
  const populationStream = new SeededRandom(hashStringToSeed(worldSeed)).fork(POPULATION_STREAM_SALT);
  return populationStream.fork(drawIndex + DRAW_STREAM_BASE_SALT).getState();
}

export function worldSeedNumeric(worldSeed: string): number {
  return hashStringToSeed(worldSeed) >>> 0;
}
