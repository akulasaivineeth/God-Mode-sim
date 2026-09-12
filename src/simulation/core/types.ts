export type EntityId = string;
export type SimMinute = number;
export type WorldSeed = string;

export interface Weighted<T> {
  value: T;
  weight: number;
}
