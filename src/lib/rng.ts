/**
 * Small seeded RNG.
 *
 * Content generation is seeded rather than purely random so a session can be
 * reproduced (and so two sessions started a second apart are not identical),
 * while still giving every user a different sequence of questions.
 */
export type Rng = {
  /** Float in [0, 1). */
  next: () => number
  /** Integer in [min, max]. */
  int: (min: number, max: number) => number
  bool: (probability?: number) => boolean
  pick: <T>(items: readonly T[]) => T
  /** `count` distinct items, or fewer when the pool is small. */
  sample: <T>(items: readonly T[], count: number) => T[]
  shuffle: <T>(items: readonly T[]) => T[]
}

export function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** mulberry32 — tiny, fast, good enough for content shuffling. */
export function createRng(seed: number | string): Rng {
  let state = (typeof seed === 'string' ? hashString(seed) : seed >>> 0) || 1

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1))

  const shuffle = <T,>(items: readonly T[]): T[] => {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = int(0, index)
      ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
    }
    return copy
  }

  return {
    next,
    int,
    bool: (probability = 0.5) => next() < probability,
    pick: <T,>(items: readonly T[]): T => items[int(0, items.length - 1)],
    sample: <T,>(items: readonly T[], count: number): T[] =>
      shuffle(items).slice(0, Math.max(0, count)),
    shuffle,
  }
}

/** Non-zero integer, handy for coefficients that must not vanish. */
export function nonZero(rng: Rng, min: number, max: number): number {
  let value = rng.int(min, max)
  while (value === 0) value = rng.int(min, max)
  return value
}
