import { nonZero } from '../rng'
import { numericChoices, trimNumber } from './genUtils'
import type { Generator, Subject } from './types'

const speedCalc: Generator = {
  id: 'phys.speed',
  difficulty: 1,
  make: (rng, level) => {
    const speed = rng.int(3, level >= 2 ? 40 : 20)
    const time = rng.int(4, 30)
    const distance = speed * time
    const solveForSpeed = rng.bool(0.6)
    if (solveForSpeed) {
      const { choices, answerIndex } = numericChoices(
        rng,
        speed,
        [distance / (time * 2), distance * time, time / speed],
        (value) => `${trimNumber(value)} m/s`,
      )
      return {
        prompt: `A runner covers ${distance} m in ${time} s. What is their average speed?`,
        choices,
        answerIndex,
        explanation: `speed = distance ÷ time = ${distance} ÷ ${time} = ${speed} m/s.`,
        skill: 'speed, distance and time',
      }
    }
    const { choices, answerIndex } = numericChoices(
      rng,
      distance,
      [speed / time, distance / 2, speed + time],
      (value) => `${trimNumber(value)} m`,
    )
    return {
      prompt: `A cyclist travels at ${speed} m/s for ${time} s. How far do they go?`,
      choices,
      answerIndex,
      explanation: `distance = speed × time = ${speed} × ${time} = ${distance} m. Rearranging the triangle the wrong way is the usual error.`,
      skill: 'speed, distance and time',
    }
  },
}

const acceleration: Generator = {
  id: 'phys.acceleration',
  difficulty: 2,
  make: (rng) => {
    const initial = rng.int(0, 12)
    const a = rng.pick([1.5, 2, 2.5, 3, 4])
    const time = rng.int(3, 12)
    const final = initial + a * time
    const { choices, answerIndex } = numericChoices(
      rng,
      a,
      [final / time, (final - initial) * time, final - initial],
      (value) => `${trimNumber(value)} m/s²`,
    )
    return {
      prompt: `A car speeds up from ${initial} m/s to ${trimNumber(final)} m/s in ${time} s. What is its acceleration?`,
      choices,
      answerIndex,
      explanation: `a = change in velocity ÷ time = (${trimNumber(final)} − ${initial}) ÷ ${time} = ${trimNumber(a)} m/s². Use the *change*, not the final velocity.`,
      skill: 'acceleration',
    }
  },
}

const newtonSecond: Generator = {
  id: 'phys.newton2',
  difficulty: 2,
  make: (rng) => {
    const mass = rng.int(2, 60)
    const a = rng.pick([0.5, 1.5, 2, 3, 4, 5])
    const force = Math.round(mass * a * 10) / 10
    const solveForForce = rng.bool(0.5)
    if (solveForForce) {
      const { choices, answerIndex } = numericChoices(
        rng,
        force,
        [mass / a, mass + a, mass * 9.8],
        (value) => `${trimNumber(value)} N`,
      )
      return {
        prompt: `What resultant force gives a ${mass} kg mass an acceleration of ${trimNumber(a)} m/s²?`,
        choices,
        answerIndex,
        explanation: `F = ma = ${mass} × ${trimNumber(a)} = ${trimNumber(force)} N.`,
        skill: 'F = ma',
      }
    }
    const { choices, answerIndex } = numericChoices(
      rng,
      a,
      [force * mass, force / (mass * 2), force - mass],
      (value) => `${trimNumber(value)} m/s²`,
    )
    return {
      prompt: `A resultant force of ${trimNumber(force)} N acts on a ${mass} kg trolley. What is its acceleration?`,
      choices,
      answerIndex,
      explanation: `a = F ÷ m = ${trimNumber(force)} ÷ ${mass} = ${trimNumber(a)} m/s².`,
      skill: 'F = ma',
    }
  },
}

const kineticEnergy: Generator = {
  id: 'phys.kineticEnergy',
  difficulty: 2,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const mass = rng.int(2, 80)
    const velocity = rng.int(2, 20)
    const energy = 0.5 * mass * velocity * velocity
    const { choices, answerIndex } = numericChoices(
      rng,
      energy,
      [mass * velocity * velocity, 0.5 * mass * velocity, mass * velocity],
      (value) => `${trimNumber(value)} J`,
    )
    return {
      prompt: `Calculate the kinetic energy of a ${mass} kg object moving at ${velocity} m/s.`,
      choices,
      answerIndex,
      explanation: `Eₖ = ½mv² = 0.5 × ${mass} × ${velocity}² = ${trimNumber(energy)} J. Square the velocity before multiplying — doubling speed quadruples the energy.`,
      skill: 'kinetic energy',
    }
  },
}

const gpe: Generator = {
  id: 'phys.gpe',
  difficulty: 2,
  make: (rng) => {
    const mass = rng.int(2, 50)
    const height = rng.int(2, 30)
    const g = 9.8
    const energy = Math.round(mass * g * height * 10) / 10
    const { choices, answerIndex } = numericChoices(
      rng,
      energy,
      [mass * height, 0.5 * mass * height * g, mass * g],
      (value) => `${trimNumber(value)} J`,
    )
    return {
      prompt: `How much gravitational potential energy does a ${mass} kg box gain when lifted ${height} m? (g = 9.8 N/kg)`,
      choices,
      answerIndex,
      explanation: `Eₚ = mgh = ${mass} × 9.8 × ${height} = ${trimNumber(energy)} J.`,
      skill: 'gravitational potential energy',
    }
  },
}

const ohmsLaw: Generator = {
  id: 'phys.ohm',
  difficulty: 2,
  make: (rng) => {
    const current = rng.pick([0.2, 0.5, 1.5, 2, 3])
    const resistance = rng.int(4, 60)
    const voltage = Math.round(current * resistance * 100) / 100
    const target = rng.pick(['V', 'I', 'R'])
    if (target === 'V') {
      const { choices, answerIndex } = numericChoices(
        rng,
        voltage,
        [resistance / current, current + resistance, voltage / 2],
        (value) => `${trimNumber(value)} V`,
      )
      return {
        prompt: `A current of ${trimNumber(current)} A flows through a ${resistance} Ω resistor. What is the potential difference across it?`,
        choices,
        answerIndex,
        explanation: `V = IR = ${trimNumber(current)} × ${resistance} = ${trimNumber(voltage)} V.`,
        skill: 'Ohm’s law',
      }
    }
    if (target === 'I') {
      const { choices, answerIndex } = numericChoices(
        rng,
        current,
        [voltage * resistance, resistance / voltage, current * 2],
        (value) => `${trimNumber(value)} A`,
      )
      return {
        prompt: `${trimNumber(voltage)} V is applied across a ${resistance} Ω resistor. What current flows?`,
        choices,
        answerIndex,
        explanation: `I = V ÷ R = ${trimNumber(voltage)} ÷ ${resistance} = ${trimNumber(current)} A.`,
        skill: 'Ohm’s law',
      }
    }
    const { choices, answerIndex } = numericChoices(
      rng,
      resistance,
      [voltage * current, current / voltage, resistance + 10],
      (value) => `${trimNumber(value)} Ω`,
    )
    return {
      prompt: `A component draws ${trimNumber(current)} A when ${trimNumber(voltage)} V is applied. What is its resistance?`,
      choices,
      answerIndex,
      explanation: `R = V ÷ I = ${trimNumber(voltage)} ÷ ${trimNumber(current)} = ${trimNumber(resistance)} Ω.`,
      skill: 'Ohm’s law',
    }
  },
}

const electricalPower: Generator = {
  id: 'phys.power',
  difficulty: 2,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const voltage = rng.pick([12, 24, 230])
    const current = rng.pick([0.5, 1.5, 2, 3, 5])
    const power = Math.round(voltage * current * 10) / 10
    const { choices, answerIndex } = numericChoices(
      rng,
      power,
      [voltage / current, voltage + current, power / 2],
      (value) => `${trimNumber(value)} W`,
    )
    return {
      prompt: `An appliance runs at ${voltage} V and draws ${trimNumber(current)} A. What is its power?`,
      choices,
      answerIndex,
      explanation: `P = VI = ${voltage} × ${trimNumber(current)} = ${trimNumber(power)} W.`,
      skill: 'electrical power',
    }
  },
}

const waveSpeed: Generator = {
  id: 'phys.waveSpeed',
  difficulty: 2,
  make: (rng) => {
    const frequency = rng.int(2, 60)
    const wavelength = rng.pick([0.5, 1.5, 2, 2.5, 4])
    const speed = Math.round(frequency * wavelength * 100) / 100
    const { choices, answerIndex } = numericChoices(
      rng,
      speed,
      [frequency / wavelength, wavelength / frequency, frequency + wavelength],
      (value) => `${trimNumber(value)} m/s`,
    )
    return {
      prompt: `A wave has frequency ${frequency} Hz and wavelength ${trimNumber(wavelength)} m. What is its speed?`,
      choices,
      answerIndex,
      explanation: `v = fλ = ${frequency} × ${trimNumber(wavelength)} = ${trimNumber(speed)} m/s.`,
      skill: 'wave equation',
    }
  },
}

const momentum: Generator = {
  id: 'phys.momentum',
  difficulty: 3,
  bands: ['upper', 'tertiary'],
  make: (rng) => {
    const m1 = rng.int(1, 6)
    const m2 = rng.int(1, 6)
    const u1 = rng.int(2, 12)
    const combined = Math.round(((m1 * u1) / (m1 + m2)) * 100) / 100
    const { choices, answerIndex } = numericChoices(
      rng,
      combined,
      [u1, (m1 * u1) / m2, u1 / 2],
      (value) => `${trimNumber(value)} m/s`,
    )
    return {
      prompt: `A ${m1} kg trolley moving at ${u1} m/s collides with a stationary ${m2} kg trolley and they stick together. What is their common velocity?`,
      choices,
      answerIndex,
      explanation: `Momentum is conserved: ${m1} × ${u1} = (${m1} + ${m2}) × v, so v = ${m1 * u1} ÷ ${m1 + m2} = ${trimNumber(combined)} m/s.`,
      skill: 'conservation of momentum',
    }
  },
}

const density: Generator = {
  id: 'phys.density',
  difficulty: 1,
  make: (rng) => {
    const volume = rng.int(2, 40)
    const densityValue = rng.pick([0.8, 1, 2.7, 7.8, 11.3])
    const mass = Math.round(volume * densityValue * 100) / 100
    const { choices, answerIndex } = numericChoices(
      rng,
      densityValue,
      [volume / mass, mass * volume, densityValue * 2],
      (value) => `${trimNumber(value)} g/cm³`,
    )
    return {
      prompt: `A block has mass ${trimNumber(mass)} g and volume ${volume} cm³. What is its density?`,
      choices,
      answerIndex,
      explanation: `ρ = m ÷ V = ${trimNumber(mass)} ÷ ${volume} = ${trimNumber(densityValue)} g/cm³.`,
      skill: 'density',
    }
  },
}

const workDone: Generator = {
  id: 'phys.work',
  difficulty: 1,
  make: (rng) => {
    const force = rng.int(5, 200)
    const distance = nonZero(rng, 2, 25)
    const work = force * distance
    const { choices, answerIndex } = numericChoices(
      rng,
      work,
      [force / distance, force + distance, work / 2],
      (value) => `${trimNumber(value)} J`,
    )
    return {
      prompt: `A force of ${force} N pushes a crate ${distance} m in the direction of the force. How much work is done?`,
      choices,
      answerIndex,
      explanation: `W = Fd = ${force} × ${distance} = ${work} J. One joule is one newton-metre.`,
      skill: 'work done',
    }
  },
}

export const PHYSICS: Subject = {
  id: 'physics',
  name: 'Physics',
  tagline: 'Forces, energy, waves and electricity',
  topics: [
    {
      id: 'motion',
      name: 'Motion & Kinematics',
      summary: 'Speed, velocity, acceleration and motion graphs.',
      bands: ['middle', 'lower', 'upper', 'tertiary'],
      generators: [speedCalc, acceleration],
      concepts: [
        {
          id: 'speedvelocity',
          term: 'Speed vs velocity',
          definition: 'Speed is how fast; velocity is how fast in a stated direction.',
          detail:
            'Velocity is a vector, so an object moving in a circle at constant speed still has changing velocity — and is therefore accelerating.',
          example: 'A car going round a roundabout at 30 km/h.',
          misconception: 'Constant speed always means zero acceleration.',
        },
        {
          id: 'accelerationdef',
          term: 'Acceleration',
          definition: 'The rate of change of velocity, measured in m/s².',
          detail:
            'Negative acceleration means slowing down or accelerating in the negative direction, depending on the chosen positive direction.',
          example: '0 to 27 m/s in 9 s gives 3 m/s².',
        },
        {
          id: 'distancetime',
          term: 'Distance–time graph',
          definition: 'A graph whose gradient gives speed.',
          detail:
            'A horizontal line means stationary and a curve means changing speed; the area underneath has no useful meaning.',
          example: 'A steeper line means a faster journey.',
        },
        {
          id: 'velocitytime',
          term: 'Velocity–time graph',
          definition: 'A graph whose gradient gives acceleration and whose area gives distance.',
          detail:
            'This double reading is why velocity–time graphs are the more powerful of the two.',
          example: 'A triangle of area 90 under the line means 90 m travelled.',
          misconception: 'The area under a distance–time graph gives the distance travelled.',
        },
        {
          id: 'terminalvelocity',
          term: 'Terminal velocity',
          definition: 'The constant speed reached when drag equals the driving force.',
          detail:
            'Resultant force becomes zero, so acceleration stops even though the object keeps moving fast.',
          example: 'A skydiver before opening the parachute.',
        },
        {
          id: 'scalarvector',
          term: 'Scalars and vectors',
          definition: 'Scalars have size only; vectors have size and direction.',
          detail:
            'Distance and speed are scalars, while displacement, velocity, force and acceleration are vectors.',
          example: 'A 400 m lap gives 400 m distance but zero displacement.',
        },
      ],
    },
    {
      id: 'forces',
      name: 'Forces & Newton’s Laws',
      summary: 'Resultant forces, the three laws and everyday force problems.',
      bands: ['middle', 'lower', 'upper'],
      generators: [newtonSecond, workDone],
      concepts: [
        {
          id: 'resultant',
          term: 'Resultant force',
          definition: 'The single force equivalent to all forces acting on an object.',
          detail:
            'A zero resultant means constant velocity — which includes staying still, not just being at rest.',
          example: 'A 30 N push against 30 N of friction gives no acceleration.',
        },
        {
          id: 'newton1',
          term: 'Newton’s first law',
          definition: 'An object stays at rest or at constant velocity unless a resultant force acts.',
          detail:
            'Motion needs no force to continue, only to change — the insight that overturned Aristotelian physics.',
          example: 'A puck slides on ice almost indefinitely.',
          misconception: 'A moving object needs a continuous force to keep moving.',
        },
        {
          id: 'newton2',
          term: 'Newton’s second law',
          definition: 'F = ma: resultant force equals mass times acceleration.',
          detail:
            'For the same force, acceleration is inversely proportional to mass, which is why heavier vehicles need longer to stop.',
          example: '200 N on a 50 kg cart gives 4 m/s².',
        },
        {
          id: 'newton3',
          term: 'Newton’s third law',
          definition: 'Every action has an equal and opposite reaction on a different object.',
          detail:
            'The pair acts on two *different* bodies, which is why they never cancel each other out.',
          example: 'A rocket pushes gas down; the gas pushes the rocket up.',
          misconception: 'Action and reaction forces cancel, so nothing should ever accelerate.',
        },
        {
          id: 'weightmass',
          term: 'Weight and mass',
          definition: 'Mass is the amount of matter; weight is the force of gravity on it (W = mg).',
          detail:
            'Mass is constant everywhere while weight changes with gravitational field strength.',
          example: 'A 60 kg astronaut weighs about 588 N on Earth, ~100 N on the Moon.',
        },
        {
          id: 'friction',
          term: 'Friction and drag',
          definition: 'Forces opposing relative motion between surfaces or through a fluid.',
          detail:
            'Drag rises with speed, which is what makes terminal velocity possible.',
          example: 'A parachute dramatically increases drag.',
        },
      ],
    },
    {
      id: 'energy',
      name: 'Energy, Work & Power',
      summary: 'Energy stores, transfers, efficiency and power.',
      bands: ['middle', 'lower', 'upper'],
      generators: [kineticEnergy, gpe, workDone, density],
      concepts: [
        {
          id: 'conservationenergy',
          term: 'Conservation of energy',
          definition: 'Energy cannot be created or destroyed, only transferred between stores.',
          detail:
            '"Wasted" energy is dissipated to the surroundings, usually as heat, rather than destroyed.',
          example: 'A bouncing ball loses height as energy dissipates through sound and heating.',
          misconception: 'Energy is used up when a device runs.',
        },
        {
          id: 'kineticenergy',
          term: 'Kinetic energy',
          definition: 'Energy of a moving object, Eₖ = ½mv².',
          detail:
            'Because velocity is squared, doubling speed quadruples the energy — the reason braking distance grows so quickly with speed.',
          example: 'A 1000 kg car at 20 m/s carries 200 kJ.',
        },
        {
          id: 'gpe',
          term: 'Gravitational potential energy',
          definition: 'Energy stored by height, Eₚ = mgh.',
          detail:
            'Only the vertical height matters, so the path taken to reach it makes no difference.',
          example: 'Lifting a 2 kg book 1.5 m stores about 29 J.',
        },
        {
          id: 'power',
          term: 'Power',
          definition: 'The rate of energy transfer, measured in watts.',
          detail:
            'Two motors can do the same work with different powers — the faster one is more powerful, not more efficient.',
          example: '600 J in 3 s is 200 W.',
          misconception: 'A more powerful device is automatically more efficient.',
        },
        {
          id: 'efficiency',
          term: 'Efficiency',
          definition: 'Useful energy output divided by total energy input.',
          detail:
            'It is always below 100% in real devices because some energy is dissipated to the surroundings.',
          example: 'An LED bulb converting 45 J of 50 J to light is 90% efficient.',
        },
        {
          id: 'specificheat',
          term: 'Specific heat capacity',
          definition: 'The energy needed to raise 1 kg of a substance by 1 °C.',
          detail:
            'Water’s unusually high value is why it is used in heating systems and moderates coastal climates.',
          example: 'ΔE = mcΔθ gives 8400 J to heat 2 kg of water by 1 °C.',
        },
      ],
    },
    {
      id: 'waves',
      name: 'Waves & Sound',
      summary: 'Wave properties, the wave equation and the electromagnetic spectrum.',
      bands: ['lower', 'upper'],
      generators: [waveSpeed],
      concepts: [
        {
          id: 'transverse',
          term: 'Transverse vs longitudinal',
          definition:
            'Transverse waves oscillate perpendicular to travel; longitudinal waves oscillate along it.',
          detail:
            'Sound is longitudinal and needs a medium; electromagnetic waves are transverse and travel through vacuum.',
          example: 'Ripples on water are transverse; sound in air is longitudinal.',
          misconception: 'Sound can travel through the vacuum of space.',
        },
        {
          id: 'waveproperties',
          term: 'Amplitude, wavelength, frequency',
          definition:
            'Amplitude is maximum displacement, wavelength the distance per cycle, frequency the cycles per second.',
          detail:
            'Amplitude carries the energy of the wave, while frequency sets pitch or colour.',
          example: 'Louder sound means larger amplitude, not higher frequency.',
        },
        {
          id: 'waveequation',
          term: 'Wave equation',
          definition: 'v = fλ, linking speed, frequency and wavelength.',
          detail:
            'When a wave enters a new medium its frequency stays fixed while speed and wavelength change together.',
          example: '5 Hz at 2 m gives 10 m/s.',
        },
        {
          id: 'emspectrum',
          term: 'Electromagnetic spectrum',
          definition: 'The family of transverse waves from radio to gamma, all travelling at 3 × 10⁸ m/s in vacuum.',
          detail:
            'Frequency rises and wavelength falls from radio to gamma, and the higher-frequency end carries enough energy to ionise.',
          example: 'X-rays image bone; radio waves carry broadcasts.',
        },
        {
          id: 'reflectionrefraction',
          term: 'Reflection and refraction',
          definition: 'Bouncing off a boundary, and bending when speed changes across one.',
          detail:
            'Refraction bends light towards the normal when it slows down entering a denser medium.',
          example: 'A straw looks bent at the water surface.',
        },
        {
          id: 'echo',
          term: 'Echoes and ultrasound',
          definition: 'Reflected sound used to measure distance.',
          detail:
            'The pulse travels there and back, so the measured time must be halved before using s = vt.',
          example: 'Sonar mapping of the sea floor.',
          misconception: 'The full echo time can be used directly as the travel time to the object.',
        },
      ],
    },
    {
      id: 'electricity',
      name: 'Electricity & Circuits',
      summary: 'Current, voltage, resistance and circuit behaviour.',
      bands: ['middle', 'lower', 'upper'],
      generators: [ohmsLaw, electricalPower],
      concepts: [
        {
          id: 'current',
          term: 'Current',
          definition: 'The rate of flow of charge, measured in amperes.',
          detail:
            'Current is the same at every point in a series circuit — it is not used up by components.',
          example: 'I = Q/t, so 30 C in 10 s is 3 A.',
          misconception: 'Current is used up as it passes through a bulb.',
        },
        {
          id: 'voltage',
          term: 'Potential difference',
          definition: 'The energy transferred per unit charge between two points.',
          detail:
            'In a series circuit the supply p.d. is shared between components; in parallel each branch gets the full p.d.',
          example: '12 V across a lamp transfers 12 J per coulomb.',
        },
        {
          id: 'resistance',
          term: 'Resistance',
          definition: 'Opposition to current flow, R = V/I, measured in ohms.',
          detail:
            'Resistance rises with length and falls with cross-sectional area, and usually rises with temperature in metals.',
          example: 'A thin long wire resists more than a short thick one.',
        },
        {
          id: 'series',
          term: 'Series circuits',
          definition: 'A single loop where the same current passes through every component.',
          detail:
            'Total resistance is the sum of the parts, so adding a component reduces the current everywhere.',
          example: 'Two 10 Ω resistors in series give 20 Ω.',
        },
        {
          id: 'parallel',
          term: 'Parallel circuits',
          definition: 'Branching paths that each receive the full supply voltage.',
          detail:
            'Total resistance is *less* than the smallest branch, because current has more routes available.',
          example: 'Two 10 Ω resistors in parallel give 5 Ω.',
          misconception: 'Adding a resistor in parallel always increases total resistance.',
        },
        {
          id: 'powerenergy',
          term: 'Electrical power',
          definition: 'P = VI, also P = I²R.',
          detail:
            'The I²R form explains why transmission lines run at high voltage and low current to reduce heating losses.',
          example: 'A 230 V, 2 A kettle element draws 460 W.',
        },
      ],
    },
    {
      id: 'magnetism',
      name: 'Magnetism & Electromagnetism',
      summary: 'Fields, motors, generators and transformers.',
      bands: ['upper', 'tertiary'],
      concepts: [
        {
          id: 'magneticfield',
          term: 'Magnetic field',
          definition: 'The region where a magnetic material or moving charge experiences a force.',
          detail:
            'Field lines run north to south outside a magnet, and are closer together where the field is stronger.',
          example: 'Iron filings tracing a bar magnet’s field.',
        },
        {
          id: 'solenoid',
          term: 'Electromagnet',
          definition: 'A magnetic field produced by current in a coil of wire.',
          detail:
            'Strength rises with current, number of turns and an iron core, and it can be switched off — unlike a permanent magnet.',
          example: 'Scrapyard cranes lifting and dropping cars.',
        },
        {
          id: 'motoreffect',
          term: 'Motor effect',
          definition: 'A current-carrying wire in a magnetic field experiences a force.',
          detail:
            'Fleming’s left-hand rule gives the direction; the force is zero when the wire is parallel to the field.',
          example: 'The turning coil of a DC motor.',
          misconception: 'The force acts along the direction of the current.',
        },
        {
          id: 'induction',
          term: 'Electromagnetic induction',
          definition: 'A voltage induced when a conductor and a magnetic field move relative to each other.',
          detail:
            'The induced current opposes the change producing it (Lenz’s law), which is why generators resist being turned.',
          example: 'A bike dynamo lighting a lamp.',
        },
        {
          id: 'transformer',
          term: 'Transformer',
          definition: 'A device that changes the size of an alternating voltage.',
          detail:
            'Vs/Vp = Ns/Np, and it only works with alternating current because a changing field is required.',
          example: 'Step-up transformers raise voltage for the grid.',
          misconception: 'Transformers work with direct current too.',
        },
        {
          id: 'grid',
          term: 'The National Grid',
          definition: 'The network that transmits electricity at high voltage and low current.',
          detail:
            'Low current cuts I²R heating losses in the cables, which is the entire reason for stepping voltage up and back down.',
          example: 'Transmission at 400 kV, stepped down to 230 V for homes.',
        },
      ],
    },
    {
      id: 'radioactivity',
      name: 'Radioactivity',
      summary: 'Nuclear decay, half-life and radiation safety.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'alphabetagamma',
          term: 'Alpha, beta and gamma',
          definition: 'Three types of nuclear radiation with different penetrating power.',
          detail:
            'Alpha is stopped by paper but strongly ionising; gamma penetrates lead but ionises weakly.',
          example: 'Smoke alarms use an alpha source.',
          misconception: 'The most penetrating radiation is always the most dangerous inside the body.',
        },
        {
          id: 'halflife',
          term: 'Half-life',
          definition: 'The time for half the undecayed nuclei in a sample to decay.',
          detail:
            'Decay is random per nucleus, so half-life is a statistical property, reliable only for large numbers.',
          example: 'After three half-lives, one eighth of the original remains.',
        },
        {
          id: 'randomdecay',
          term: 'Random decay',
          definition: 'Radioactive decay cannot be predicted for an individual nucleus.',
          detail:
            'Nothing external triggers it — decay rate depends only on how many undecayed nuclei remain.',
          example: 'A Geiger counter clicks irregularly.',
        },
        {
          id: 'irradiation',
          term: 'Irradiation vs contamination',
          definition: 'Being exposed to radiation, versus having radioactive material on or in you.',
          detail:
            'Irradiation stops when the source is removed; contamination continues to expose you until it is cleaned away.',
          example: 'A dental X-ray irradiates but does not contaminate.',
          misconception: 'An irradiated object becomes radioactive itself.',
        },
        {
          id: 'nuclearequation',
          term: 'Nuclear equations',
          definition: 'Equations balancing mass and atomic numbers through a decay.',
          detail:
            'Alpha decay drops mass number by 4 and atomic number by 2; beta decay raises atomic number by 1.',
          example: 'Carbon-14 beta decays to nitrogen-14.',
        },
        {
          id: 'fission',
          term: 'Nuclear fission',
          definition: 'Splitting a large unstable nucleus, releasing energy and neutrons.',
          detail:
            'Released neutrons can trigger further fissions, so control rods absorb them to keep the chain reaction steady.',
          example: 'Uranium-235 in a reactor core.',
        },
      ],
    },
    {
      id: 'momentum',
      name: 'Momentum & Collisions',
      summary: 'Momentum conservation, impulse and safety features.',
      bands: ['upper', 'tertiary'],
      generators: [momentum, newtonSecond],
      concepts: [
        {
          id: 'momentumdef',
          misconception:
            'Momentum is a scalar, so momenta in opposite directions simply add together.',
          term: 'Momentum',
          definition: 'p = mv, a vector quantity measured in kg m/s.',
          detail:
            'Direction matters: opposite momenta subtract, which is what makes head-on collisions calculable.',
          example: 'A 2 kg ball at 5 m/s has 10 kg m/s of momentum.',
        },
        {
          id: 'conservationmomentum',
          term: 'Conservation of momentum',
          definition: 'Total momentum before a collision equals total momentum after, with no external force.',
          detail:
            'It holds in explosions too, where momenta start at zero and end equal and opposite.',
          example: 'A recoiling rifle and its bullet.',
          misconception: 'Momentum is only conserved when objects bounce apart elastically.',
        },
        {
          id: 'impulse',
          misconception:
            'Crumple zones work by making the force larger over a shorter contact time.',
          term: 'Impulse',
          definition: 'Force × time, equal to the change in momentum.',
          detail:
            'Extending the contact time reduces the force for the same momentum change — the principle behind every safety feature.',
          example: 'Crumple zones lengthen a crash from 0.05 s to 0.2 s.',
        },
        {
          id: 'elastic',
          misconception:
            'Kinetic energy is conserved in every collision.',
          term: 'Elastic and inelastic collisions',
          definition: 'Elastic collisions conserve kinetic energy; inelastic ones do not.',
          detail:
            'Momentum is conserved in both — only kinetic energy distinguishes them.',
          example: 'Two trolleys sticking together is perfectly inelastic.',
        },
        {
          id: 'safety',
          term: 'Vehicle safety features',
          definition: 'Devices that reduce force by increasing collision time.',
          detail:
            'Airbags, seatbelts and crumple zones all extend stopping time to cut the peak force on the body.',
          example: 'A seatbelt stretching slightly during a crash.',
        },
        {
          id: 'forcerate',
          term: 'Force as rate of change of momentum',
          definition: 'F = Δp/Δt, the more general form of Newton’s second law.',
          detail:
            'It reduces to F = ma when mass is constant, but also handles changing mass such as a rocket burning fuel.',
          example: 'A jet of water exerting steady force on a wall.',
        },
      ],
    },
  ],
}
