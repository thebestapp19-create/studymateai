import type { Rng } from '../rng'

/** Multiple-choice assembly that guarantees four distinct, shuffled options. */
export function buildChoices(
  rng: Rng,
  correct: string,
  distractors: string[],
  fallback?: (index: number) => string,
): { choices: string[]; answerIndex: number } {
  const seen = new Set([correct])
  const options: string[] = []

  for (const distractor of distractors) {
    if (options.length === 3) break
    if (!distractor || seen.has(distractor)) continue
    seen.add(distractor)
    options.push(distractor)
  }

  let attempt = 0
  while (options.length < 3 && fallback) {
    const candidate = fallback(attempt)
    attempt += 1
    if (attempt > 40) break
    if (!candidate || seen.has(candidate)) continue
    seen.add(candidate)
    options.push(candidate)
  }

  const all = rng.shuffle([correct, ...options])
  return { choices: all, answerIndex: all.indexOf(correct) }
}

/** Numeric multiple choice with near-miss distractors. */
export function numericChoices(
  rng: Rng,
  correct: number,
  distractors: number[],
  format: (value: number) => string = (value) => trimNumber(value),
): { choices: string[]; answerIndex: number } {
  return buildChoices(
    rng,
    format(correct),
    distractors.map(format),
    (index) => {
      const spread = [1, -1, 2, -2, 3, -3, 5, -5, 10, -10][index % 10]
      const scale = Math.abs(correct) > 40 ? Math.round(Math.abs(correct) * 0.1) || 1 : 1
      return format(correct + spread * scale)
    },
  )
}

export function trimNumber(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return String(Number(value.toFixed(2)))
}

export function signed(value: number): string {
  return value < 0 ? `− ${Math.abs(value)}` : `+ ${value}`
}

/** Renders `ax + b` style terms without "1x" or "+ -3". */
export function linearTerm(coefficient: number, variable = 'x'): string {
  if (coefficient === 1) return variable
  if (coefficient === -1) return `−${variable}`
  return `${coefficient}${variable}`
}

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function fraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator) || 1
  const top = numerator / divisor
  const bottom = denominator / divisor
  return bottom === 1 ? String(top) : `${top}/${bottom}`
}
