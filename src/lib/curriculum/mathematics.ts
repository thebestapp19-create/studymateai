import { nonZero } from '../rng'
import {
  buildChoices,
  fraction,
  linearTerm,
  numericChoices,
  trimNumber,
} from './genUtils'
import type { Generator, Subject } from './types'

const percentOf: Generator = {
  id: 'math.percentOf',
  difficulty: 1,
  make: (rng, level) => {
    const percent = rng.pick(level >= 2 ? [12.5, 17.5, 32, 45, 62] : [10, 15, 20, 25, 40, 60])
    const base = rng.int(2, 9) * (level >= 2 ? 40 : 20)
    const answer = (percent / 100) * base
    const whole = Number.isInteger(answer)
    const context = rng.pick([
      `What is ${percent}% of ${base}?`,
      whole
        ? `A test is marked out of ${base}. A student scores ${percent}%. How many marks is that?`
        : `${percent}% of ${base} is…`,
      whole
        ? `${base} students are surveyed and ${percent}% cycle to school. How many students is that?`
        : `Find ${percent}% of ${base}.`,
    ])
    const { choices, answerIndex } = numericChoices(rng, answer, [
      base / percent,
      answer * 10,
      answer / 2,
      base - answer,
    ])
    return {
      prompt: context,
      choices,
      answerIndex,
      explanation: `${percent}% = ${percent}/100 = ${trimNumber(percent / 100)}. Multiply: ${trimNumber(percent / 100)} × ${base} = ${trimNumber(answer)}.`,
      skill: 'percentage of an amount',
    }
  },
}

const percentChange: Generator = {
  id: 'math.percentChange',
  difficulty: 2,
  make: (rng, level) => {
    const start = rng.int(2, 12) * (level >= 2 ? 25 : 10)
    const factor = rng.pick([1.2, 1.25, 1.5, 0.8, 0.75, 0.9])
    const end = Math.round(start * factor)
    const change = ((end - start) / start) * 100
    const direction = change >= 0 ? 'increase' : 'decrease'
    const { choices, answerIndex } = numericChoices(
      rng,
      Math.abs(change),
      [Math.abs(((end - start) / end) * 100), Math.abs(change) / 2, Math.abs(change) + 10],
      (value) => `${trimNumber(Math.round(value * 10) / 10)}% ${direction}`,
    )
    return {
      prompt: `A value changes from ${start} to ${end}. What is the percentage change?`,
      choices,
      answerIndex,
      explanation: `Percentage change = (change ÷ original) × 100 = (${end - start} ÷ ${start}) × 100 = ${trimNumber(Math.round(change * 10) / 10)}%. Always divide by the *original* amount.`,
      skill: 'percentage change',
    }
  },
}

const ratioShare: Generator = {
  id: 'math.ratioShare',
  difficulty: 2,
  make: (rng, level) => {
    const a = rng.int(2, 5)
    const b = rng.int(2, 7)
    const parts = a + b
    const unit = rng.int(3, level >= 2 ? 24 : 12)
    const total = parts * unit
    const larger = Math.max(a, b) * unit
    const { choices, answerIndex } = numericChoices(rng, larger, [
      Math.min(a, b) * unit,
      total / 2,
      total - larger + unit,
    ])
    return {
      prompt: `${total} is shared in the ratio ${a} : ${b}. How big is the larger share?`,
      choices,
      answerIndex,
      explanation: `There are ${a} + ${b} = ${parts} parts, so one part is ${total} ÷ ${parts} = ${unit}. The larger share is ${Math.max(a, b)} × ${unit} = ${larger}.`,
      skill: 'sharing in a ratio',
    }
  },
}

const linearSolve: Generator = {
  id: 'math.linearSolve',
  difficulty: 2,
  make: (rng, level) => {
    const x = nonZero(rng, -8, 9)
    let prompt: string
    let explanation: string

    if (level <= 0) {
      const a = rng.int(2, 9)
      const b = rng.int(1, 20)
      prompt = `Solve for x:  ${linearTerm(a)} + ${b} = ${a * x + b}`
      explanation = `Subtract ${b} from both sides: ${a}x = ${a * x}. Divide by ${a}: x = ${x}.`
    } else if (level === 1) {
      const a = rng.int(2, 9)
      const b = rng.int(2, 15)
      prompt = `Solve for x:  ${linearTerm(a)} − ${b} = ${a * x - b}`
      explanation = `Add ${b} to both sides: ${a}x = ${a * x}. Divide by ${a}: x = ${x}.`
    } else {
      const a = rng.int(3, 9)
      const c = rng.int(1, a - 1)
      const b = rng.int(1, 12)
      const right = (a - c) * x + b
      prompt = `Solve for x:  ${linearTerm(a)} + ${b} = ${linearTerm(c)} + ${right + b}`
      explanation = `Collect x terms: ${a}x − ${c}x = ${a - c}x, and constants give ${(a - c) * x}. So ${a - c}x = ${(a - c) * x} and x = ${x}.`
    }

    const { choices, answerIndex } = numericChoices(rng, x, [-x, x + 1, x - 2, x * 2])
    return { prompt, choices, answerIndex, explanation, skill: 'solving linear equations' }
  },
}

const quadraticRoots: Generator = {
  id: 'math.quadraticRoots',
  difficulty: 2,
  make: (rng) => {
    const r1 = nonZero(rng, -7, 7)
    const r2 = nonZero(rng, -7, 7)
    const b = -(r1 + r2)
    const c = r1 * r2
    const body = `x² ${b === 0 ? '' : b > 0 ? `+ ${b}x ` : `− ${Math.abs(b)}x `}${c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`} = 0`
    const format = (pair: number[]) =>
      `x = ${[...pair].sort((p, q) => p - q).map(trimNumber).join(' or x = ')}`
    const { choices, answerIndex } = buildChoices(
      rng,
      format([r1, r2]),
      [format([-r1, -r2]), format([r1, -r2]), format([r1 + 1, r2 - 1])],
      (index) => format([r1 + index + 1, r2]),
    )
    return {
      prompt: `Solve by factorising:  ${body}`,
      choices,
      answerIndex,
      explanation: `Find two numbers multiplying to ${c} and adding to ${b}: ${-r1} and ${-r2}. So (x ${-r1 >= 0 ? '+' : '−'} ${Math.abs(r1)})(x ${-r2 >= 0 ? '+' : '−'} ${Math.abs(r2)}) = 0, giving x = ${r1} or x = ${r2}.`,
      skill: 'factorising quadratics',
    }
  },
}

const discriminant: Generator = {
  id: 'math.discriminant',
  difficulty: 3,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const a = rng.int(1, 4)
    const b = nonZero(rng, -8, 8)
    const c = nonZero(rng, -6, 6)
    const value = b * b - 4 * a * c
    const answer =
      value > 0 ? 'Two distinct real roots' : value === 0 ? 'One repeated real root' : 'No real roots'
    const { choices, answerIndex } = buildChoices(rng, answer, [
      'Two distinct real roots',
      'One repeated real root',
      'No real roots',
    ])
    return {
      prompt: `How many real roots does ${a === 1 ? '' : a}x² ${b > 0 ? `+ ${b}` : `− ${Math.abs(b)}`}x ${c > 0 ? `+ ${c}` : `− ${Math.abs(c)}`} = 0 have?`,
      choices,
      answerIndex,
      explanation: `b² − 4ac = (${b})² − 4(${a})(${c}) = ${value}. A ${value > 0 ? 'positive' : value === 0 ? 'zero' : 'negative'} discriminant means ${answer.toLowerCase()}.`,
      skill: 'using the discriminant',
    }
  },
}

const functionEval: Generator = {
  id: 'math.functionEval',
  difficulty: 2,
  make: (rng, level) => {
    const a = nonZero(rng, -4, 5)
    const b = nonZero(rng, -6, 6)
    const c = rng.int(-8, 8)
    const x = nonZero(rng, -4, 5)
    const quadratic = level >= 1
    const value = quadratic ? a * x * x + b * x + c : a * x + c
    const definition = quadratic
      ? `f(x) = ${linearTerm(a, 'x²')} ${b > 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`} ${c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`}`
      : `f(x) = ${linearTerm(a)} ${c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`}`
    const { choices, answerIndex } = numericChoices(rng, value, [
      quadratic ? a * x * x - b * x + c : -value,
      value + 2 * c,
      quadratic ? a * (x * x) + b * x - c : a * x - c,
    ])
    return {
      prompt: `${definition}.  Find f(${x}).`,
      choices,
      answerIndex,
      explanation: quadratic
        ? `Substitute x = ${x}: ${a}(${x})² ${b > 0 ? '+' : '−'} ${Math.abs(b)}(${x}) ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${a * x * x} ${b * x >= 0 ? '+' : '−'} ${Math.abs(b * x)} ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${value}. Watch the sign when squaring a negative.`
        : `Substitute x = ${x}: ${a}(${x}) ${c >= 0 ? '+' : '−'} ${Math.abs(c)} = ${value}.`,
      skill: 'evaluating functions',
    }
  },
}

const gradient: Generator = {
  id: 'math.gradient',
  difficulty: 2,
  make: (rng) => {
    const x1 = rng.int(-6, 4)
    const x2 = x1 + rng.int(1, 6)
    const m = nonZero(rng, -4, 4)
    const c = rng.int(-6, 6)
    const y1 = m * x1 + c
    const y2 = m * x2 + c
    const { choices, answerIndex } = numericChoices(rng, m, [
      -m,
      (x2 - x1) / (y2 - y1),
      m + 1,
      c,
    ])
    return {
      prompt: `What is the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`,
      choices,
      answerIndex,
      explanation: `Gradient = change in y ÷ change in x = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${x2 - x1} = ${m}.`,
      skill: 'gradient of a line',
    }
  },
}

const pythagoras: Generator = {
  id: 'math.pythagoras',
  difficulty: 2,
  make: (rng) => {
    const triple = rng.pick([
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [9, 40, 41],
    ])
    const scale = rng.int(1, 3)
    const [a, b, c] = triple.map((side) => side * scale)
    const findHypotenuse = rng.bool(0.6)
    const answer = findHypotenuse ? c : b
    const { choices, answerIndex } = numericChoices(rng, answer, [
      findHypotenuse ? a + b : c - a,
      Math.round(Math.sqrt(c * c + a * a)),
      answer + scale,
    ])
    return {
      prompt: findHypotenuse
        ? `A right-angled triangle has legs of ${a} cm and ${b} cm. How long is the hypotenuse?`
        : `A right-angled triangle has a hypotenuse of ${c} cm and one leg of ${a} cm. How long is the other leg?`,
      choices,
      answerIndex,
      explanation: findHypotenuse
        ? `a² + b² = c² → ${a}² + ${b}² = ${a * a + b * b}, and √${a * a + b * b} = ${c} cm.`
        : `Rearrange to b² = c² − a² = ${c * c} − ${a * a} = ${b * b}, so b = ${b} cm. Subtract, don't add, when finding a shorter side.`,
      skill: 'Pythagoras’ theorem',
    }
  },
}

const trigSide: Generator = {
  id: 'math.trigSide',
  difficulty: 3,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const angle = rng.pick([25, 30, 35, 40, 45, 50, 55, 60, 65])
    const hypotenuse = rng.int(6, 20)
    const opposite = Math.round(hypotenuse * Math.sin((angle * Math.PI) / 180) * 10) / 10
    const adjacent = Math.round(hypotenuse * Math.cos((angle * Math.PI) / 180) * 10) / 10
    const { choices, answerIndex } = numericChoices(
      rng,
      opposite,
      [adjacent, Math.round(hypotenuse * Math.tan((angle * Math.PI) / 180) * 10) / 10],
      (value) => `${trimNumber(value)} cm`,
    )
    return {
      prompt: `In a right-angled triangle the hypotenuse is ${hypotenuse} cm and one angle is ${angle}°. How long is the side opposite that angle (1 d.p.)?`,
      choices,
      answerIndex,
      explanation: `Opposite and hypotenuse means sine: sin(${angle}°) = opp ÷ ${hypotenuse}, so opp = ${hypotenuse} × sin(${angle}°) = ${trimNumber(opposite)} cm. (Cosine would give the adjacent side, ${trimNumber(adjacent)} cm.)`,
      skill: 'SOH-CAH-TOA',
    }
  },
}

const probabilityBasic: Generator = {
  id: 'math.probabilityBasic',
  difficulty: 1,
  make: (rng, level) => {
    const red = rng.int(2, 8)
    const blue = rng.int(2, 8)
    const green = rng.int(1, 5)
    const total = red + blue + green
    const twoEvents = level >= 2
    const colour = rng.pick(['red', 'blue'])
    const count = colour === 'red' ? red : blue

    if (!twoEvents) {
      const { choices, answerIndex } = buildChoices(
        rng,
        fraction(count, total),
        [fraction(total - count, total), fraction(count, total - count), fraction(1, total)],
        (index) => fraction(count + index + 1, total),
      )
      return {
        prompt: `A bag holds ${red} red, ${blue} blue and ${green} green counters. One is taken at random. P(${colour})?`,
        choices,
        answerIndex,
        explanation: `P = favourable ÷ total = ${count} ÷ ${total} = ${fraction(count, total)}.`,
        skill: 'single-event probability',
      }
    }

    const answer = (count / total) * ((count - 1) / (total - 1))
    const withReplacement = (count / total) ** 2
    const { choices, answerIndex } = numericChoices(
      rng,
      answer,
      [withReplacement, count / total, (count / total) * 2],
      (value) => trimNumber(Math.round(value * 1000) / 1000),
    )
    return {
      prompt: `A bag holds ${red} red, ${blue} blue and ${green} green counters. Two are taken *without replacement*. P(both ${colour}) to 3 d.p.?`,
      choices,
      answerIndex,
      explanation: `First pick: ${count}/${total}. The bag now has one fewer of each: ${count - 1}/${total - 1}. Multiply: ${trimNumber(Math.round(answer * 1000) / 1000)}. With replacement it would be ${trimNumber(Math.round(withReplacement * 1000) / 1000)}.`,
      skill: 'dependent probability',
    }
  },
}

const averages: Generator = {
  id: 'math.averages',
  difficulty: 1,
  make: (rng, level) => {
    const size = level >= 1 ? 6 : 5
    const values = Array.from({ length: size }, () => rng.int(2, 30))
    const sorted = [...values].sort((a, b) => a - b)
    const mean = values.reduce((sum, value) => sum + value, 0) / size
    const median =
      size % 2 === 0 ? (sorted[size / 2 - 1] + sorted[size / 2]) / 2 : sorted[(size - 1) / 2]
    const wantMedian = rng.bool(0.5)
    const answer = wantMedian ? median : Math.round(mean * 100) / 100
    const { choices, answerIndex } = numericChoices(rng, answer, [
      wantMedian ? Math.round(mean * 100) / 100 : median,
      sorted[size - 1] - sorted[0],
      sorted[Math.floor(size / 2)],
    ])
    return {
      prompt: `Find the ${wantMedian ? 'median' : 'mean'} of:  ${values.join(', ')}`,
      choices,
      answerIndex,
      explanation: wantMedian
        ? `Order them first: ${sorted.join(', ')}. The middle value is ${trimNumber(median)}.`
        : `Add them: ${values.join(' + ')} = ${values.reduce((sum, value) => sum + value, 0)}. Divide by ${size}: ${trimNumber(Math.round(mean * 100) / 100)}.`,
      skill: wantMedian ? 'median' : 'mean',
    }
  },
}

const arithmeticSequence: Generator = {
  id: 'math.arithmeticSequence',
  difficulty: 2,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const first = rng.int(-6, 12)
    const difference = nonZero(rng, -6, 8)
    const n = rng.int(8, 30)
    const answer = first + (n - 1) * difference
    const terms = [0, 1, 2, 3].map((index) => first + index * difference)
    const { choices, answerIndex } = numericChoices(rng, answer, [
      first + n * difference,
      first * n,
      answer - difference,
    ])
    return {
      prompt: `A sequence starts ${terms.join(', ')}, …  What is the ${n}th term?`,
      choices,
      answerIndex,
      explanation: `The common difference is ${difference}, so aₙ = a₁ + (n − 1)d = ${first} + ${n - 1} × ${difference} = ${answer}. The (n − 1) matters — using n is the classic slip.`,
      skill: 'nth term of a sequence',
    }
  },
}

const differentiate: Generator = {
  id: 'math.differentiate',
  difficulty: 2,
  bands: ['upper', 'tertiary'],
  make: (rng) => {
    const a = nonZero(rng, -5, 6)
    const b = nonZero(rng, -6, 6)
    const c = rng.int(-9, 9)
    const power = rng.pick([3, 3, 4])
    const derivative = `${linearTerm(a * power, `x${power === 3 ? '²' : '³'}`)} ${2 * b >= 0 ? '+' : '−'} ${Math.abs(2 * b)}x`
    const wrong1 = `${linearTerm(a * power, `x${power === 3 ? '²' : '³'}`)} ${2 * b >= 0 ? '+' : '−'} ${Math.abs(2 * b)}x ${c >= 0 ? '+' : '−'} ${Math.abs(c)}`
    const wrong2 = `${linearTerm(a, `x${power === 3 ? '²' : '³'}`)} ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x`
    const { choices, answerIndex } = buildChoices(rng, derivative, [
      wrong1,
      wrong2,
      `${linearTerm(a * power, `x${power}`)} ${2 * b >= 0 ? '+' : '−'} ${Math.abs(2 * b)}`,
    ])
    return {
      prompt: `Differentiate  y = ${linearTerm(a, `x${power === 3 ? '³' : '⁴'}`)} ${b > 0 ? `+ ${b}` : `− ${Math.abs(b)}`}x² ${c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`}`,
      choices,
      answerIndex,
      explanation: `Bring the power down and reduce it by one: ${a}x${power === 3 ? '³' : '⁴'} → ${a * power}x${power === 3 ? '²' : '³'}, ${b}x² → ${2 * b}x, and the constant ${c} differentiates to 0.`,
      skill: 'differentiating polynomials',
    }
  },
}

const integrate: Generator = {
  id: 'math.integrate',
  difficulty: 3,
  bands: ['upper', 'tertiary'],
  make: (rng) => {
    const a = rng.int(1, 4)
    const b = rng.int(1, 6)
    const upper = rng.int(2, 4)
    const value = (a * upper ** 3) / 3 + (b * upper ** 2) / 2
    const rounded = Math.round(value * 100) / 100
    const { choices, answerIndex } = numericChoices(rng, rounded, [
      a * upper ** 3 + b * upper ** 2,
      Math.round((a * upper ** 2 + b * upper) * 100) / 100,
      Math.round((value / 2) * 100) / 100,
    ])
    return {
      prompt: `Evaluate  ∫₀^${upper} (${linearTerm(a, 'x²')} + ${b}x) dx`,
      choices,
      answerIndex,
      explanation: `Integrate term by term: ${a}x²  → ${fraction(a, 3)}x³ and ${b}x → ${fraction(b, 2)}x². At x = ${upper} that gives ${trimNumber(Math.round(((a * upper ** 3) / 3) * 100) / 100)} + ${trimNumber(Math.round(((b * upper ** 2) / 2) * 100) / 100)} = ${trimNumber(rounded)}; at x = 0 it is 0.`,
      skill: 'definite integration',
    }
  },
}

export const MATHEMATICS: Subject = {
  id: 'mathematics',
  name: 'Mathematics',
  tagline: 'Number, algebra, geometry and data',
  topics: [
    {
      id: 'fractions',
      name: 'Fractions, Decimals & Percentages',
      summary: 'Moving between the three forms and using them on real amounts.',
      bands: ['middle', 'lower'],
      generators: [percentOf, percentChange],
      concepts: [
        {
          id: 'equivalent',
          term: 'Equivalent fractions',
          definition:
            'Fractions that represent the same value even though the numerator and denominator differ.',
          detail:
            'Multiplying or dividing top and bottom by the same non-zero number leaves the value unchanged, which is why 3/4 and 9/12 are the same amount.',
          example: '2/5 and 8/20 both fill the same part of a bar.',
          misconception: 'Adding the same number to the top and bottom keeps a fraction equivalent.',
        },
        {
          id: 'commondenominator',
          term: 'Common denominator',
          definition:
            'A shared bottom number that lets two fractions be added or compared directly.',
          detail:
            'Fractions only add when the pieces are the same size, so 1/3 + 1/4 becomes 4/12 + 3/12 = 7/12.',
          example: 'To compare 5/8 and 2/3, rewrite both over 24: 15/24 and 16/24.',
          misconception: 'To add fractions you add the numerators and add the denominators.',
        },
        {
          id: 'percentmultiplier',
          term: 'Percentage multiplier',
          definition:
            'The decimal you multiply by to apply a percentage change in one step.',
          detail:
            'A 15% increase is × 1.15 and a 15% decrease is × 0.85, which makes repeated changes easy to chain.',
          example: 'Three years of 5% growth is × 1.05³ = × 1.158.',
          misconception: 'A 20% rise followed by a 20% fall returns you to the original amount.',
        },
        {
          id: 'reversepercentage',
          term: 'Reverse percentage',
          definition:
            'Working back to the original amount after a percentage change has been applied.',
          detail:
            'Divide by the multiplier instead of subtracting the percentage: if £72 is after a 20% discount, the original was 72 ÷ 0.8 = £90.',
          example: 'A price of 138 after 15% VAT means the pre-VAT price was 138 ÷ 1.15 = 120.',
          misconception: 'To undo a 20% discount you add 20% back on.',
        },
        {
          id: 'recurring',
          term: 'Recurring decimal',
          definition: 'A decimal whose digits repeat forever in a fixed block.',
          detail:
            'Every fraction is either a terminating or a recurring decimal, because long division must eventually repeat a remainder.',
          example: '1/3 = 0.333… and 2/11 = 0.1818…',
          misconception: 'Recurring decimals cannot be written exactly as fractions.',
        },
        {
          id: 'orderofsize',
          term: 'Ordering mixed forms',
          definition:
            'Comparing fractions, decimals and percentages by first converting them all to one form.',
          detail:
            'Decimals are usually the fastest common form because place value makes the comparison visual.',
          example: '0.6, 5/8 and 62% become 0.600, 0.625 and 0.620.',
        },
      ],
    },
    {
      id: 'ratio',
      name: 'Ratio & Proportion',
      summary: 'Sharing amounts, scaling recipes and direct or inverse proportion.',
      bands: ['middle', 'lower'],
      generators: [ratioShare, percentOf],
      concepts: [
        {
          id: 'ratiobasics',
          term: 'Ratio',
          definition: 'A comparison of two or more quantities measured in the same units.',
          detail:
            'A ratio has no units of its own and can always be simplified by dividing every part by a common factor.',
          example: '12 : 18 simplifies to 2 : 3.',
          misconception: 'In the ratio 2 : 3 the first quantity is two-halves of the total.',
        },
        {
          id: 'unitary',
          term: 'Unitary method',
          definition: 'Finding the value of one part or one unit before scaling to the amount you need.',
          detail:
            'It turns awkward multi-step proportion problems into a single multiplication, which is why it works for recipes, currency and best-buy questions.',
          example: 'If 5 pens cost 3.75, one costs 0.75, so 8 cost 6.00.',
        },
        {
          id: 'direct',
          term: 'Direct proportion',
          definition: 'A relationship where doubling one quantity doubles the other.',
          detail:
            'It always has the form y = kx and its graph is a straight line through the origin.',
          example: 'Cost of petrol against litres bought.',
          misconception: 'Any straight-line graph shows direct proportion.',
        },
        {
          id: 'inverse',
          term: 'Inverse proportion',
          definition: 'A relationship where doubling one quantity halves the other.',
          detail: 'It has the form y = k/x, so the product xy stays constant and the graph is a curve.',
          example: '6 workers take 4 days, so 12 workers take 2 days.',
        },
        {
          id: 'scalefactor',
          term: 'Scale factor',
          definition: 'The number every length is multiplied by when a shape is enlarged.',
          detail:
            'Areas scale by the square of the scale factor and volumes by its cube, which is why doubling a model multiplies its volume by eight.',
          example: 'A scale factor of 3 turns a 4 cm side into 12 cm and multiplies area by 9.',
          misconception: 'Doubling every length also doubles the area.',
        },
        {
          id: 'bestbuy',
          term: 'Best buy comparison',
          definition: 'Deciding which option is better value by comparing a common unit price.',
          detail:
            'Convert each option to cost per unit (or units per currency) so the comparison is like for like.',
          example: '750 ml for 2.10 is 0.28/100 ml, better than 500 ml for 1.60 at 0.32/100 ml.',
        },
      ],
    },
    {
      id: 'linear',
      name: 'Linear Equations',
      summary: 'Solving, rearranging and forming equations with one unknown.',
      bands: ['middle', 'lower', 'upper'],
      generators: [linearSolve, gradient],
      concepts: [
        {
          id: 'balance',
          term: 'Balance method',
          definition: 'Doing the same operation to both sides of an equation so it stays true.',
          detail:
            'An equation is a statement of equality, so any operation applied to one side must be applied to the whole of the other side.',
          example: '3x + 4 = 19 → subtract 4 → 3x = 15 → divide by 3 → x = 5.',
          misconception: 'You can move a term across the equals sign without changing its sign.',
        },
        {
          id: 'inverseops',
          term: 'Inverse operations',
          definition: 'The operation that undoes another, used to isolate the unknown.',
          detail:
            'Unwrap the expression in reverse order of operations: undo addition before multiplication.',
          example: 'For (x + 3) ÷ 5 = 4, multiply by 5 first, then subtract 3.',
        },
        {
          id: 'rearrange',
          term: 'Changing the subject',
          definition: 'Rearranging a formula so a different variable stands alone.',
          detail:
            'Treat every other letter as a number and apply the same balance steps you would use with digits.',
          example: 'v = u + at becomes a = (v − u)/t.',
        },
        {
          id: 'formingequations',
          term: 'Forming an equation',
          definition: 'Turning a worded situation into algebra by naming the unknown.',
          detail:
            'Define the letter explicitly ("let x be the number of tickets") so the answer can be interpreted at the end.',
          example: 'Three consecutive numbers summing to 72 gives x + (x+1) + (x+2) = 72.',
        },
        {
          id: 'simultaneous',
          term: 'Simultaneous equations',
          definition: 'Two equations solved together to find a pair of values that satisfies both.',
          detail:
            'Elimination adds or subtracts the equations to remove one variable; substitution replaces one variable using the other equation.',
          example: 'x + y = 10 and x − y = 4 give x = 7, y = 3.',
          misconception: 'A pair of simultaneous equations always has exactly one solution.',
        },
        {
          id: 'inequality',
          term: 'Inequality',
          definition: 'A statement that one expression is greater or less than another.',
          detail:
            'The same balance rules apply, except that multiplying or dividing by a negative number reverses the inequality sign.',
          example: '−2x > 6 gives x < −3.',
          misconception: 'Inequalities behave exactly like equations in every step.',
        },
      ],
    },
    {
      id: 'quadratic',
      name: 'Quadratic Equations',
      summary: 'Factorising, the formula, completing the square and parabolas.',
      bands: ['lower', 'upper'],
      generators: [quadraticRoots, discriminant, functionEval],
      concepts: [
        {
          id: 'standardform',
          term: 'Standard form',
          definition: 'A quadratic written as ax² + bx + c = 0 with a ≠ 0.',
          detail:
            'Every method — factorising, the formula, completing the square — assumes the equation has first been collected into this form.',
          example: '2x² = 5x − 3 becomes 2x² − 5x + 3 = 0.',
          misconception: 'You can apply the quadratic formula before moving everything to one side.',
        },
        {
          id: 'factorising',
          term: 'Factorising',
          definition: 'Writing a quadratic as a product of two brackets whose roots can be read off.',
          detail:
            'For x² + bx + c you need two numbers that multiply to c and add to b; the null factor law then gives the solutions.',
          example: 'x² − 7x + 12 = (x − 3)(x − 4), so x = 3 or 4.',
        },
        {
          id: 'formula',
          term: 'Quadratic formula',
          definition: 'x = (−b ± √(b² − 4ac)) / 2a, which solves any quadratic.',
          detail:
            'It is completing the square done once in general, which is why it works even when no neat factors exist.',
          example: 'For 3x² + 2x − 4 = 0 it gives x ≈ 0.869 or x ≈ −1.535.',
          misconception: 'The formula only works when the quadratic cannot be factorised.',
        },
        {
          id: 'discriminant',
          term: 'Discriminant',
          definition: 'The value b² − 4ac, which tells you how many real roots a quadratic has.',
          detail:
            'Positive gives two roots, zero gives one repeated root, negative means the parabola never crosses the x-axis.',
          example: 'x² + 4x + 4 has b² − 4ac = 0, so it touches the axis once at x = −2.',
        },
        {
          id: 'completingsquare',
          term: 'Completing the square',
          definition: 'Rewriting a quadratic as a(x + p)² + q.',
          detail:
            'The form exposes the turning point at (−p, q) instantly, which is why it is preferred for finding maxima and minima.',
          example: 'x² + 6x + 5 = (x + 3)² − 4, so the minimum is −4 at x = −3.',
        },
        {
          id: 'parabola',
          term: 'Parabola',
          definition: 'The symmetric U-shaped curve of a quadratic function.',
          detail:
            'It opens upwards when a > 0 and downwards when a < 0, and is symmetric about the line x = −b/2a.',
          example: 'y = −x² + 4 peaks at (0, 4) and opens downwards.',
          misconception: 'The roots of a quadratic are always the same as its turning point.',
        },
      ],
    },
    {
      id: 'functions',
      name: 'Functions & Graphs',
      summary: 'Reading, sketching and transforming graphs of functions.',
      bands: ['lower', 'upper', 'tertiary'],
      generators: [functionEval, gradient],
      concepts: [
        {
          id: 'function',
          term: 'Function',
          definition: 'A rule assigning exactly one output to every valid input.',
          detail:
            'The "one output" requirement is what the vertical line test checks on a graph.',
          example: 'f(x) = x² is a function; x = y² is not, since y could be ±2 when x = 4.',
          misconception: 'Any curve drawn on axes represents a function.',
        },
        {
          id: 'domainrange',
          term: 'Domain and range',
          definition: 'The set of allowed inputs and the set of outputs a function produces.',
          detail:
            'Domains are usually restricted by division by zero or square roots of negatives; the range then follows from the shape of the graph.',
          example: 'f(x) = 1/(x − 2) has domain x ≠ 2.',
        },
        {
          id: 'intercepts',
          term: 'Intercepts',
          definition: 'The points where a graph crosses the axes.',
          detail:
            'Set x = 0 for the y-intercept and y = 0 for the x-intercepts, which are also the roots of the function.',
          example: 'y = 2x − 6 crosses at (0, −6) and (3, 0).',
        },
        {
          id: 'transformations',
          term: 'Graph transformations',
          definition: 'Shifts, stretches and reflections applied to a base graph.',
          detail:
            'f(x) + a moves the graph up, f(x + a) moves it left, −f(x) reflects in the x-axis: changes inside the bracket act on x and feel "backwards".',
          example: 'y = (x − 3)² is y = x² translated 3 to the right.',
          misconception: 'f(x + 3) shifts the graph three units to the right.',
        },
        {
          id: 'gradientmeaning',
          term: 'Gradient as a rate',
          definition: 'The steepness of a line, equal to the change in y per unit change in x.',
          detail:
            'On a real-world graph the gradient carries units and meaning — speed on a distance–time graph, cost per item on a cost graph.',
          example: 'A distance–time line rising 120 m in 8 s has gradient 15 m/s.',
        },
        {
          id: 'inversefunction',
          term: 'Inverse function',
          definition: 'The function that reverses the effect of another, written f⁻¹(x).',
          detail:
            'Its graph is the reflection of f in the line y = x, and it exists only when f is one-to-one.',
          example: 'If f(x) = 3x + 1 then f⁻¹(x) = (x − 1)/3.',
          misconception: 'f⁻¹(x) means 1 ÷ f(x).',
        },
      ],
    },
    {
      id: 'geometry',
      name: 'Geometry & Pythagoras',
      summary: 'Angles, shapes, area and right-angled triangles.',
      bands: ['middle', 'lower', 'upper'],
      generators: [pythagoras],
      concepts: [
        {
          id: 'anglesum',
          term: 'Angle sums',
          definition: 'Angles in a triangle total 180° and in a quadrilateral 360°.',
          detail:
            'Any polygon splits into triangles, so an n-sided polygon has interior angles totalling (n − 2) × 180°.',
          example: 'A hexagon has (6 − 2) × 180° = 720°.',
        },
        {
          id: 'parallellines',
          term: 'Angles in parallel lines',
          definition: 'Equal and supplementary angle pairs formed when a line crosses two parallel lines.',
          detail:
            'Corresponding and alternate angles are equal; co-interior angles add to 180°. Naming the reason is usually worth a mark.',
          example: 'Alternate angles form a Z-shape and are equal.',
        },
        {
          id: 'pythagoras',
          term: 'Pythagoras’ theorem',
          definition: 'In a right-angled triangle, a² + b² = c² where c is the hypotenuse.',
          detail:
            'To find a shorter side you subtract rather than add, and the theorem only ever applies to right-angled triangles.',
          example: 'Legs of 6 and 8 give a hypotenuse of 10.',
          misconception: 'Pythagoras works in any triangle as long as you know two sides.',
        },
        {
          id: 'area',
          term: 'Area formulae',
          definition: 'Rules for the space inside common shapes.',
          detail:
            'Triangle ½bh, parallelogram bh, trapezium ½(a + b)h, circle πr² — the perpendicular height, not a slanted side, is what each uses.',
          example: 'A triangle with base 10 cm and height 6 cm has area 30 cm².',
          misconception: 'The slanted side of a triangle can be used as its height.',
        },
        {
          id: 'circle',
          term: 'Circle measures',
          definition: 'Circumference 2πr and area πr², with arcs and sectors as fractions of these.',
          detail:
            'A sector of angle θ takes θ/360 of the whole circle for both arc length and area.',
          example: 'A 90° sector of a radius-8 circle has area ¼ × π × 64 ≈ 50.3.',
          misconception: 'Doubling a circle’s radius doubles its area.',
        },
        {
          id: 'congruence',
          term: 'Congruence and similarity',
          definition:
            'Congruent shapes are identical in size and shape; similar shapes have equal angles and proportional sides.',
          detail:
            'Congruence proofs quote SSS, SAS, ASA or RHS; similarity lets you set up a scale factor between corresponding sides.',
          example: 'Two triangles with all angles equal are similar, and their sides share one ratio.',
        },
      ],
    },
    {
      id: 'trigonometry',
      name: 'Trigonometry',
      summary: 'Sine, cosine, tangent and solving triangles.',
      bands: ['lower', 'upper', 'tertiary'],
      generators: [trigSide, pythagoras],
      concepts: [
        {
          id: 'sohcahtoa',
          term: 'SOH-CAH-TOA',
          definition:
            'The three ratios in a right-angled triangle: sin = opp/hyp, cos = adj/hyp, tan = opp/adj.',
          detail:
            'Label the sides relative to the angle you are using — the "opposite" changes when you switch angles.',
          example: 'With hypotenuse 10 and angle 30°, the opposite side is 10 sin 30° = 5.',
          misconception: 'The hypotenuse is whichever side looks longest in the drawing.',
        },
        {
          id: 'inversetrig',
          term: 'Inverse trigonometric functions',
          definition: 'sin⁻¹, cos⁻¹ and tan⁻¹, used to find an angle from a ratio.',
          detail:
            'They return one principal value, so problems in other quadrants need the symmetry of the graph to find the second solution.',
          example: 'tan⁻¹(3/4) ≈ 36.9°.',
        },
        {
          id: 'sinerule',
          term: 'Sine rule',
          definition: 'a/sin A = b/sin B = c/sin C, for any triangle.',
          detail:
            'Use it when you have a matched side–angle pair; the ambiguous case can give two valid triangles.',
          example: 'Given A = 40°, a = 8 and B = 65°, side b = 8 sin 65° / sin 40°.',
        },
        {
          id: 'cosinerule',
          term: 'Cosine rule',
          definition: 'a² = b² + c² − 2bc cos A, a generalisation of Pythagoras.',
          detail:
            'Use it with three sides, or two sides and the included angle; when A = 90° the cosine term vanishes and Pythagoras returns.',
          example: 'Sides 7 and 9 with a 40° angle between give a² = 49 + 81 − 126 cos 40°.',
        },
        {
          id: 'exactvalues',
          term: 'Exact values',
          definition: 'Surd values of sin, cos and tan at 0°, 30°, 45°, 60° and 90°.',
          detail:
            'They come from the half-equilateral and half-square triangles, so they can be rebuilt rather than memorised.',
          example: 'sin 60° = √3/2 and tan 45° = 1.',
        },
        {
          id: 'trigarea',
          term: 'Area of a triangle',
          definition: 'Area = ½ab sin C, using two sides and the angle between them.',
          detail:
            'It replaces ½ base × height when no perpendicular height is known; the angle must be the included one.',
          example: 'Sides 6 and 10 with a 30° angle between them give area 15.',
          misconception: 'Any two sides and any angle can be used in ½ab sin C.',
        },
      ],
    },
    {
      id: 'probability',
      name: 'Probability',
      summary: 'Single and combined events, trees and expected outcomes.',
      bands: ['middle', 'lower', 'upper'],
      generators: [probabilityBasic],
      concepts: [
        {
          id: 'scale',
          term: 'Probability scale',
          definition: 'Every probability lies between 0 (impossible) and 1 (certain).',
          detail:
            'The probabilities of all mutually exclusive outcomes of one trial must sum to exactly 1.',
          example: 'If P(rain) = 0.3 then P(no rain) = 0.7.',
          misconception: 'A probability can be written as 1.5 if an event is very likely.',
        },
        {
          id: 'theoretical',
          term: 'Theoretical vs experimental',
          definition:
            'Theoretical probability comes from counting equally likely outcomes; experimental comes from observed trials.',
          detail:
            'Relative frequency converges on the theoretical value as the number of trials grows — this is why small samples mislead.',
          example: '8 heads in 10 flips gives 0.8 experimentally, but 0.5 theoretically.',
        },
        {
          id: 'independent',
          term: 'Independent events',
          definition: 'Events where one outcome does not change the probability of the other.',
          detail: 'For independent events P(A and B) = P(A) × P(B).',
          example: 'Two dice rolls: P(both sixes) = 1/6 × 1/6 = 1/36.',
          misconception: 'After four heads in a row, tails is more likely on the next flip.',
        },
        {
          id: 'dependent',
          term: 'Dependent events',
          definition: 'Events where the first outcome changes the probabilities for the second.',
          detail:
            'Picking without replacement shrinks both the favourable count and the total on the second pick.',
          example: 'Two counters from 5 red of 12: 5/12 × 4/11.',
        },
        {
          id: 'tree',
          term: 'Tree diagram',
          definition: 'A branching diagram showing the outcomes and probabilities of successive events.',
          detail:
            'Multiply along branches for "and", add between complete branches for "or"; every set of branches sums to 1.',
          example: 'P(exactly one head in two flips) = 0.5×0.5 + 0.5×0.5 = 0.5.',
        },
        {
          id: 'expected',
          term: 'Expected frequency',
          definition: 'The number of times an outcome should occur, found by probability × trials.',
          detail:
            'It is a long-run average and need not be a whole number or exactly what happens.',
          example: '300 rolls of a fair die should give about 50 sixes.',
        },
      ],
    },
    {
      id: 'statistics',
      name: 'Statistics & Data',
      summary: 'Averages, spread, charts and interpreting real data.',
      bands: ['middle', 'lower', 'upper'],
      generators: [averages, percentOf],
      concepts: [
        {
          id: 'averages',
          term: 'Mean, median and mode',
          definition: 'Three measures of a typical value in a data set.',
          detail:
            'The mean uses every value so outliers pull it; the median resists outliers; the mode is the only average usable for categories.',
          example: 'For 2, 3, 3, 4, 88 the median 3 describes the data far better than the mean 20.',
          misconception: 'The mean is always the best average to quote.',
        },
        {
          id: 'range',
          term: 'Range and interquartile range',
          definition: 'Measures of spread: total spread, and the spread of the middle 50%.',
          detail:
            'The IQR ignores the extremes, so it is the fair comparison when a data set contains outliers.',
          example: 'Quartiles of 12 and 27 give an IQR of 15.',
        },
        {
          id: 'groupeddata',
          term: 'Grouped data',
          definition: 'Data collected in class intervals rather than as individual values.',
          detail:
            'Means from grouped data are estimates, because midpoints stand in for the original values.',
          example: 'Using midpoints 5, 15, 25 with frequencies 4, 9, 7 estimates the mean.',
          misconception: 'A mean calculated from grouped data is exact.',
        },
        {
          id: 'scatter',
          term: 'Scatter graphs and correlation',
          definition: 'A plot of paired data used to judge whether two variables move together.',
          detail:
            'Correlation describes the strength and direction of a relationship, but never proves that one variable causes the other.',
          example: 'Revision hours against test score often shows positive correlation.',
          misconception: 'Strong correlation proves causation.',
        },
        {
          id: 'sampling',
          term: 'Sampling',
          definition: 'Studying a subset of a population to draw conclusions about the whole.',
          detail:
            'A sample must be random and large enough to be representative; convenience samples introduce bias.',
          example: 'Surveying only the school football team about sport is a biased sample.',
        },
        {
          id: 'cumulative',
          term: 'Cumulative frequency',
          definition: 'A running total of frequencies, used to estimate medians and quartiles.',
          detail:
            'Its S-shaped graph is read at n/2, n/4 and 3n/4 to find the median and quartiles of grouped data.',
          example: 'With 80 values, read across at 40 to estimate the median.',
        },
      ],
    },
    {
      id: 'sequences',
      name: 'Sequences & Series',
      summary: 'Term rules, arithmetic and geometric progressions.',
      bands: ['lower', 'upper', 'tertiary'],
      generators: [arithmeticSequence],
      concepts: [
        {
          id: 'nthterm',
          term: 'nth term rule',
          definition: 'A formula giving any term of a sequence directly from its position.',
          detail:
            'For a linear sequence the coefficient of n is the common difference, and the constant adjusts the zeroth term.',
          example: '5, 8, 11, 14 has nth term 3n + 2.',
          misconception: 'The nth term of a linear sequence starts from the first term, so a₁ = a + nd.',
        },
        {
          id: 'arithmetic',
          term: 'Arithmetic sequence',
          definition: 'A sequence with a constant difference between consecutive terms.',
          detail: 'aₙ = a₁ + (n − 1)d, and the sum of n terms is (n/2)(2a₁ + (n − 1)d).',
          example: '7, 11, 15, 19 with d = 4.',
        },
        {
          id: 'geometric',
          term: 'Geometric sequence',
          definition: 'A sequence with a constant ratio between consecutive terms.',
          detail:
            'aₙ = a₁rⁿ⁻¹; when |r| < 1 the infinite sum converges to a₁/(1 − r).',
          example: '3, 6, 12, 24 with r = 2.',
        },
        {
          id: 'quadraticsequence',
          term: 'Quadratic sequence',
          definition: 'A sequence whose second differences are constant.',
          detail:
            'The coefficient of n² is half the constant second difference, which anchors the whole rule.',
          example: '2, 6, 12, 20 has second difference 2, so the rule contains n².',
        },
        {
          id: 'recurrence',
          term: 'Recurrence relation',
          definition: 'A rule defining each term using the previous one or ones.',
          detail:
            'It needs a starting value to be well defined, and can describe sequences no simple formula captures.',
          example: 'The Fibonacci rule uₙ₊₂ = uₙ₊₁ + uₙ with u₁ = u₂ = 1.',
        },
        {
          id: 'convergence',
          term: 'Convergence',
          definition: 'A sequence converges when its terms approach a fixed limit.',
          detail:
            'A geometric series converges only when the common ratio satisfies |r| < 1.',
          example: '1 + ½ + ¼ + … converges to 2.',
          misconception: 'Every infinite series adds up to infinity.',
        },
      ],
    },
    {
      id: 'calculus-diff',
      name: 'Differentiation',
      summary: 'Rates of change, gradients of curves and stationary points.',
      bands: ['upper', 'tertiary'],
      generators: [differentiate, functionEval],
      concepts: [
        {
          id: 'derivativemeaning',
          term: 'Derivative',
          definition: 'The instantaneous rate of change of a function, and the gradient of its tangent.',
          detail:
            'It is the limit of the gradient of a chord as the two points move together, which is what dy/dx records.',
          example: 'For s(t) in metres, ds/dt is velocity in m/s.',
          misconception: 'The derivative gives the value of the function at that point.',
        },
        {
          id: 'powerrule',
          term: 'Power rule',
          definition: 'd/dx (xⁿ) = n xⁿ⁻¹.',
          detail:
            'Constants differentiate to zero, and constant multiples come straight through the differentiation.',
          example: 'y = 4x³ gives dy/dx = 12x².',
        },
        {
          id: 'chainrule',
          term: 'Chain rule',
          definition: 'Differentiating a composite function: dy/dx = dy/du × du/dx.',
          detail:
            'Differentiate the outer function and multiply by the derivative of the inside — the step most often forgotten.',
          example: 'y = (3x + 1)⁵ gives dy/dx = 15(3x + 1)⁴.',
          misconception: 'You can differentiate a bracket raised to a power without touching the inside.',
        },
        {
          id: 'productquotient',
          term: 'Product and quotient rules',
          definition: 'Rules for differentiating a product or a ratio of two functions.',
          detail:
            '(uv)′ = u′v + uv′ and (u/v)′ = (u′v − uv′)/v² — the order of terms matters in the quotient rule.',
          example: 'y = x² sin x gives 2x sin x + x² cos x.',
        },
        {
          id: 'stationary',
          term: 'Stationary points',
          definition: 'Points where the derivative is zero.',
          detail:
            'The second derivative classifies them: positive means a minimum, negative a maximum, zero needs further testing.',
          example: 'y = x² − 6x has dy/dx = 0 at x = 3, a minimum.',
        },
        {
          id: 'tangentnormal',
          term: 'Tangents and normals',
          definition: 'Lines touching a curve at a point, and the perpendicular to it there.',
          detail:
            'The normal gradient is −1 divided by the tangent gradient at that same point.',
          example: 'If the tangent gradient is 4, the normal gradient is −¼.',
        },
      ],
    },
    {
      id: 'calculus-int',
      name: 'Integration',
      summary: 'Antiderivatives, definite integrals and area under curves.',
      bands: ['upper', 'tertiary'],
      generators: [integrate],
      concepts: [
        {
          id: 'antiderivative',
          term: 'Indefinite integral',
          definition: 'The family of functions whose derivative is the given function.',
          detail:
            'Because constants vanish on differentiating, every indefinite integral carries "+ C".',
          example: '∫ 6x dx = 3x² + C.',
          misconception: 'The "+ C" is optional decoration.',
        },
        {
          id: 'powerruleint',
          term: 'Reverse power rule',
          definition: '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C for n ≠ −1.',
          detail:
            'The exception n = −1 integrates to ln|x|, because dividing by n + 1 would divide by zero.',
          example: '∫ x⁴ dx = x⁵/5 + C.',
        },
        {
          id: 'definite',
          term: 'Definite integral',
          definition: 'The value F(b) − F(a) of an antiderivative between two limits.',
          detail:
            'No constant is needed because it cancels in the subtraction; the result is a number, not a function.',
          example: '∫₀² 3x² dx = [x³]₀² = 8.',
        },
        {
          id: 'areaunder',
          term: 'Area under a curve',
          definition: 'The definite integral interpreted as signed area between the curve and the x-axis.',
          detail:
            'Regions below the axis contribute negatively, so areas must be split at the roots and made positive.',
          example: '∫ of sin x from 0 to 2π is 0, though the enclosed area is 4.',
          misconception: 'A definite integral always equals the physical area.',
        },
        {
          id: 'substitution',
          term: 'Integration by substitution',
          definition: 'Reversing the chain rule by replacing part of the integrand with u.',
          detail:
            'Change dx to du using du/dx, and convert the limits too when the integral is definite.',
          example: '∫ 2x(x² + 1)³ dx becomes ∫ u³ du with u = x² + 1.',
        },
        {
          id: 'byparts',
          term: 'Integration by parts',
          definition: '∫u dv = uv − ∫v du, the reverse of the product rule.',
          detail:
            'Choose u to be the part that simplifies when differentiated, such as a polynomial factor.',
          example: '∫ x eˣ dx = x eˣ − eˣ + C.',
        },
      ],
    },
  ],
}
