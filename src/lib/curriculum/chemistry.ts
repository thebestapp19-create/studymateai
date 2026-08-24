import { buildChoices, numericChoices, trimNumber } from './genUtils'
import type { Generator, Subject } from './types'

const COMPOUNDS = [
  { formula: 'H₂O', name: 'water', mass: 18 },
  { formula: 'CO₂', name: 'carbon dioxide', mass: 44 },
  { formula: 'NaCl', name: 'sodium chloride', mass: 58.5 },
  { formula: 'CaCO₃', name: 'calcium carbonate', mass: 100 },
  { formula: 'MgO', name: 'magnesium oxide', mass: 40 },
  { formula: 'H₂SO₄', name: 'sulfuric acid', mass: 98 },
  { formula: 'NH₃', name: 'ammonia', mass: 17 },
  { formula: 'CH₄', name: 'methane', mass: 16 },
  { formula: 'O₂', name: 'oxygen', mass: 32 },
  { formula: 'NaOH', name: 'sodium hydroxide', mass: 40 },
]

const molesFromMass: Generator = {
  id: 'chem.moles',
  difficulty: 2,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const compound = rng.pick(COMPOUNDS)
    const moles = rng.pick([0.25, 0.5, 1.5, 2, 2.5, 4])
    const mass = Math.round(compound.mass * moles * 100) / 100
    const answer = Math.round((mass / compound.mass) * 1000) / 1000
    const { choices, answerIndex } = numericChoices(
      rng,
      answer,
      [Math.round((compound.mass / mass) * 1000) / 1000, answer * 2, mass],
      (value) => `${trimNumber(value)} mol`,
    )
    return {
      prompt: `How many moles are in ${trimNumber(mass)} g of ${compound.name} (${compound.formula}), Mr = ${compound.mass}?`,
      choices,
      answerIndex,
      explanation: `moles = mass ÷ Mr = ${trimNumber(mass)} ÷ ${compound.mass} = ${trimNumber(answer)} mol. Dividing the other way round is the usual slip — check the units land on mol.`,
      skill: 'mole calculations',
    }
  },
}

const massFromMoles: Generator = {
  id: 'chem.massFromMoles',
  difficulty: 2,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const compound = rng.pick(COMPOUNDS)
    const moles = rng.pick([0.2, 0.5, 1.25, 3, 5])
    const answer = Math.round(compound.mass * moles * 100) / 100
    const { choices, answerIndex } = numericChoices(
      rng,
      answer,
      [Math.round((moles / compound.mass) * 1000) / 1000, compound.mass, answer / 2],
      (value) => `${trimNumber(value)} g`,
    )
    return {
      prompt: `What is the mass of ${trimNumber(moles)} mol of ${compound.name} (Mr = ${compound.mass})?`,
      choices,
      answerIndex,
      explanation: `mass = moles × Mr = ${trimNumber(moles)} × ${compound.mass} = ${trimNumber(answer)} g.`,
      skill: 'mole calculations',
    }
  },
}

const concentration: Generator = {
  id: 'chem.concentration',
  difficulty: 3,
  bands: ['upper', 'tertiary'],
  make: (rng) => {
    const moles = rng.pick([0.1, 0.2, 0.4, 0.5, 0.8])
    const volumeCm3 = rng.pick([100, 200, 250, 400, 500])
    const answer = Math.round((moles / (volumeCm3 / 1000)) * 1000) / 1000
    const { choices, answerIndex } = numericChoices(
      rng,
      answer,
      [Math.round((moles / volumeCm3) * 10000) / 10000, answer * 10, answer / 2],
      (value) => `${trimNumber(value)} mol/dm³`,
    )
    return {
      prompt: `${trimNumber(moles)} mol of solute is dissolved in ${volumeCm3} cm³ of solution. What is the concentration?`,
      choices,
      answerIndex,
      explanation: `Convert the volume first: ${volumeCm3} cm³ = ${trimNumber(volumeCm3 / 1000)} dm³. Then c = n ÷ V = ${trimNumber(moles)} ÷ ${trimNumber(volumeCm3 / 1000)} = ${trimNumber(answer)} mol/dm³.`,
      skill: 'concentration calculations',
    }
  },
}

const percentYield: Generator = {
  id: 'chem.percentYield',
  difficulty: 2,
  bands: ['lower', 'upper', 'tertiary'],
  make: (rng) => {
    const theoretical = rng.int(4, 30) * 2
    const percent = rng.pick([45, 60, 72, 80, 85, 92])
    const actual = Math.round(theoretical * percent) / 100
    const answer = Math.round((actual / theoretical) * 1000) / 10
    const { choices, answerIndex } = numericChoices(
      rng,
      answer,
      [Math.round((theoretical / actual) * 1000) / 10, 100 - answer, answer + 10],
      (value) => `${trimNumber(value)}%`,
    )
    return {
      prompt: `A reaction should give ${theoretical} g of product but only ${trimNumber(actual)} g is collected. What is the percentage yield?`,
      choices,
      answerIndex,
      explanation: `% yield = (actual ÷ theoretical) × 100 = (${trimNumber(actual)} ÷ ${theoretical}) × 100 = ${trimNumber(answer)}%. Losses come from incomplete reaction, side reactions and transfer losses.`,
      skill: 'percentage yield',
    }
  },
}

const balancing: Generator = {
  id: 'chem.balancing',
  difficulty: 2,
  make: (rng) => {
    const equations = [
      { skeleton: '__ H₂ + O₂ → __ H₂O', answer: '2, 1, 2', why: 'Two H₂ supply four hydrogens, matching two H₂O, which then needs one O₂.' },
      { skeleton: '__ CH₄ + __ O₂ → CO₂ + __ H₂O', answer: '1, 2, 2', why: 'One carbon gives one CO₂; four hydrogens give two H₂O, needing four oxygens — that is 2 O₂.' },
      { skeleton: '__ Na + __ Cl₂ → __ NaCl', answer: '2, 1, 2', why: 'Chlorine comes as a diatomic molecule, so two NaCl are needed to use both chlorine atoms.' },
      { skeleton: '__ Mg + __ O₂ → __ MgO', answer: '2, 1, 2', why: 'One O₂ provides two oxygen atoms, so two MgO form and two Mg are consumed.' },
      { skeleton: '__ Fe + __ O₂ → __ Fe₂O₃', answer: '4, 3, 2', why: 'Two Fe₂O₃ need four iron atoms and six oxygen atoms, and six oxygen atoms come from three O₂.' },
      { skeleton: '__ CaCO₃ → __ CaO + __ CO₂', answer: '1, 1, 1', why: 'Every atom already balances one-to-one in this decomposition.' },
    ]
    const chosen = rng.pick(equations)
    const distractors = [
      ...new Set(
        equations.filter((item) => item.answer !== chosen.answer).map((item) => item.answer),
      ),
    ]
    const { choices, answerIndex } = buildChoices(
      rng,
      chosen.answer,
      rng.shuffle(distractors),
      (index) => ['3, 2, 3', '1, 3, 2', '2, 3, 1', '4, 1, 2'][index % 4],
    )
    return {
      prompt: `Balance the equation:  ${chosen.skeleton}`,
      choices,
      answerIndex,
      explanation: `${chosen.answer}. ${chosen.why} Balancing changes the big numbers in front, never the small subscripts inside a formula.`,
      skill: 'balancing equations',
    }
  },
}

export const CHEMISTRY: Subject = {
  id: 'chemistry',
  name: 'Chemistry',
  tagline: 'Atoms, bonding, reactions and calculations',
  topics: [
    {
      id: 'atomic',
      name: 'Atomic Structure',
      summary: 'Subatomic particles, isotopes and electron arrangement.',
      bands: ['middle', 'lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'subatomic',
          term: 'Subatomic particles',
          definition: 'Protons (+1), neutrons (0) and electrons (−1) make up every atom.',
          detail:
            'Protons and neutrons carry essentially all the mass in a nucleus a hundred-thousandth the width of the atom; electrons occupy the rest.',
          example: 'A carbon-12 atom has 6 protons, 6 neutrons and 6 electrons.',
          misconception: 'Electrons contribute meaningfully to an atom’s mass.',
        },
        {
          id: 'atomicnumber',
          term: 'Atomic and mass number',
          definition:
            'Atomic number is the proton count; mass number is protons plus neutrons.',
          detail:
            'The atomic number defines the element, so changing it changes what the substance is.',
          example: 'Sodium-23 has 11 protons and 12 neutrons.',
        },
        {
          id: 'isotope',
          term: 'Isotope',
          definition: 'Atoms of the same element with different numbers of neutrons.',
          detail:
            'Isotopes share chemical properties because chemistry depends on electrons, but differ in mass and stability.',
          example: 'Chlorine-35 and chlorine-37 give the average relative atomic mass of 35.5.',
          misconception: 'Isotopes of an element react differently from each other.',
        },
        {
          id: 'electronshell',
          term: 'Electron shells',
          definition: 'Energy levels around the nucleus that electrons occupy from the inside out.',
          detail:
            'The first shell holds 2 and the next two hold 8 each, which is why period 2 and 3 have eight elements.',
          example: 'Magnesium is 2, 8, 2.',
        },
        {
          id: 'ion',
          term: 'Ion',
          definition: 'A charged particle formed when an atom gains or loses electrons.',
          detail:
            'Metals lose electrons to form positive cations; non-metals gain them to form negative anions, both reaching a full outer shell.',
          example: 'O²⁻ has gained two electrons; Al³⁺ has lost three.',
          misconception: 'Ions form by gaining or losing protons.',
        },
        {
          id: 'modeldevelopment',
          term: 'Development of the atomic model',
          definition:
            'From the plum pudding model to Rutherford’s nucleus, Bohr’s shells and the modern model.',
          detail:
            'The alpha scattering experiment overturned plum pudding: most particles passed through, so the atom was mostly empty space with a dense positive core.',
          example: 'A small fraction of alpha particles bounced almost straight back.',
        },
      ],
    },
    {
      id: 'periodictable',
      name: 'The Periodic Table',
      summary: 'Groups, periods, trends and the behaviour of key families.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'groupsperiods',
          term: 'Groups and periods',
          definition:
            'Columns share outer-shell electron count; rows share the number of occupied shells.',
          detail:
            'Because chemistry is driven by outer electrons, group number predicts reactivity patterns far better than position in a period.',
          example: 'All group 1 metals have one outer electron.',
        },
        {
          id: 'group1',
          term: 'Group 1 alkali metals',
          definition: 'Soft, very reactive metals that react vigorously with water.',
          detail:
            'Reactivity increases down the group as the outer electron is further from the nucleus and more easily lost.',
          example: 'Potassium ignites lilac on water; lithium fizzes gently.',
          misconception: 'Reactivity decreases down group 1 as atoms get heavier.',
        },
        {
          id: 'group7',
          term: 'Group 7 halogens',
          definition: 'Reactive non-metals existing as diatomic molecules.',
          detail:
            'Reactivity decreases down the group, so a more reactive halogen displaces a less reactive one from its salt.',
          example: 'Chlorine displaces bromine from potassium bromide solution.',
        },
        {
          id: 'group0',
          term: 'Group 0 noble gases',
          definition: 'Unreactive gases with full outer electron shells.',
          detail:
            'Their stability is the reference point for why other atoms bond at all — everything is chasing a full outer shell.',
          example: 'Argon fills light bulbs because it will not react with the filament.',
        },
        {
          id: 'transition',
          term: 'Transition metals',
          definition: 'The central block of metals with several common properties.',
          detail:
            'They form coloured compounds, show variable oxidation states and often act as catalysts — unlike group 1 metals.',
          example: 'Iron is the catalyst in the Haber process.',
        },
        {
          id: 'mendeleev',
          term: 'Mendeleev’s table',
          definition: 'An early periodic table ordered by atomic mass with gaps left for unknown elements.',
          detail:
            'Leaving gaps and swapping a few pairs let him predict the properties of undiscovered elements, which is what made the table convincing.',
          example: 'He predicted germanium before it was found.',
          misconception: 'Mendeleev ordered his table by atomic number.',
        },
      ],
    },
    {
      id: 'bonding',
      name: 'Bonding & Structure',
      summary: 'Ionic, covalent and metallic bonding, and how structure explains properties.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'ionicbond',
          term: 'Ionic bonding',
          definition: 'Electrostatic attraction between oppositely charged ions formed by electron transfer.',
          detail:
            'The giant lattice gives high melting points, and conduction only when molten or dissolved because the ions must be free to move.',
          example: 'Sodium chloride melts at 801 °C.',
          misconception: 'Ionic compounds conduct electricity when solid.',
        },
        {
          id: 'covalentbond',
          term: 'Covalent bonding',
          definition: 'A shared pair of electrons between two non-metal atoms.',
          detail:
            'The bond itself is strong, but simple molecular substances melt easily because only weak intermolecular forces are broken.',
          example: 'Chlorine gas is Cl₂ with one shared pair.',
          misconception: 'Melting a simple covalent substance breaks its covalent bonds.',
        },
        {
          id: 'metallicbond',
          term: 'Metallic bonding',
          definition: 'Positive metal ions in a sea of delocalised electrons.',
          detail:
            'Delocalised electrons explain conductivity, and layers of ions sliding over one another explain malleability.',
          example: 'Copper is drawn into wire without shattering.',
        },
        {
          id: 'giantcovalent',
          term: 'Giant covalent structures',
          definition: 'Networks of atoms bonded covalently throughout, such as diamond and graphite.',
          detail:
            'Graphite conducts because each carbon bonds to only three others, leaving one delocalised electron per atom; diamond bonds all four and does not.',
          example: 'Diamond is used in drill tips; graphite is used in pencils and electrodes.',
        },
        {
          id: 'intermolecular',
          term: 'Intermolecular forces',
          definition: 'Weak attractions between separate molecules.',
          detail:
            'They strengthen with molecular size, which is why boiling point rises down a homologous series.',
          example: 'Butane boils higher than methane.',
        },
        {
          id: 'polymers',
          term: 'Polymers',
          definition: 'Long chains built from many small repeating monomer units.',
          detail:
            'Chains are held to each other by intermolecular forces, so polymers soften rather than melting sharply.',
          example: 'Poly(ethene) is made from ethene monomers.',
        },
      ],
    },
    {
      id: 'reactions',
      name: 'Chemical Reactions',
      summary: 'Equations, reaction types, conservation of mass and reactivity.',
      bands: ['middle', 'lower', 'upper'],
      generators: [balancing],
      concepts: [
        {
          id: 'conservation',
          term: 'Conservation of mass',
          definition: 'The total mass of products equals the total mass of reactants.',
          detail:
            'Apparent mass changes in open containers come from gas entering or escaping, not from atoms disappearing.',
          example: 'Burning magnesium gains mass because oxygen joins it.',
          misconception: 'Mass is lost when a substance burns away.',
        },
        {
          id: 'balancedeq',
          misconception:
            'You can balance an equation by changing the small subscript numbers inside a formula.',
          term: 'Balanced equation',
          definition: 'An equation with equal numbers of each atom on both sides.',
          detail:
            'Only the large numbers in front may change; altering subscripts would change the substances themselves.',
          example: '2H₂ + O₂ → 2H₂O.',
        },
        {
          id: 'oxidation',
          misconception:
            'Oxidation can only happen when oxygen is added to a substance.',
          term: 'Oxidation and reduction',
          definition: 'Oxidation is loss of electrons; reduction is gain (OIL RIG).',
          detail:
            'The two always happen together in a redox reaction, since electrons lost by one species are gained by another.',
          example: 'Mg → Mg²⁺ + 2e⁻ is oxidation.',
        },
        {
          id: 'reactivityseries',
          term: 'Reactivity series',
          definition: 'Metals ordered by how readily they lose electrons and react.',
          detail:
            'A more reactive metal displaces a less reactive one from its compound, and the series predicts extraction methods.',
          example: 'Zinc displaces copper from copper sulfate solution.',
        },
        {
          id: 'neutralisation',
          term: 'Neutralisation',
          definition: 'Acid + base → salt + water.',
          detail:
            'At the ionic level it is always H⁺ + OH⁻ → H₂O, whichever acid and base are used.',
          example: 'HCl + NaOH → NaCl + H₂O.',
        },
        {
          id: 'thermal',
          term: 'Thermal decomposition',
          definition: 'A single compound broken down into simpler substances by heat.',
          detail:
            'It is endothermic, since energy must be supplied to break bonds, and metal carbonates are the classic example.',
          example: 'CaCO₃ → CaO + CO₂ in a lime kiln.',
        },
      ],
    },
    {
      id: 'moles',
      name: 'Moles & Stoichiometry',
      summary: 'Quantitative chemistry: moles, masses, yields and concentration.',
      bands: ['lower', 'upper', 'tertiary'],
      generators: [molesFromMass, massFromMoles, percentYield, concentration],
      concepts: [
        {
          id: 'mole',
          term: 'The mole',
          definition: 'An amount of substance containing 6.02 × 10²³ particles.',
          detail:
            'One mole of any substance has a mass in grams equal to its relative formula mass, which is what links the lab balance to particle counts.',
          example: '1 mol of CO₂ weighs 44 g.',
        },
        {
          id: 'mr',
          term: 'Relative formula mass',
          definition: 'The sum of the relative atomic masses in a formula.',
          detail:
            'Subscripts multiply only the atom they follow, and a number in front multiplies the whole formula.',
          example: 'Mr of H₂SO₄ = 2 + 32 + 64 = 98.',
          misconception: 'A subscript multiplies everything that comes before it.',
        },
        {
          id: 'molemass',
          term: 'Mole–mass relationship',
          definition: 'moles = mass ÷ Mr, rearranged as needed.',
          detail:
            'Checking that the units cancel to leave mol is the fastest way to catch an upside-down calculation.',
          example: '36 g of water is 36 ÷ 18 = 2 mol.',
        },
        {
          id: 'limiting',
          term: 'Limiting reactant',
          definition: 'The reactant that runs out first and caps how much product forms.',
          detail:
            'Compare moles divided by coefficients, not raw masses — the heavier reactant is often in excess.',
          example: 'With 1 mol H₂ and 1 mol O₂, hydrogen limits water production.',
          misconception: 'The reactant with the smaller mass is always limiting.',
        },
        {
          id: 'yield',
          term: 'Percentage yield',
          definition: '(actual mass ÷ theoretical mass) × 100.',
          detail:
            'Yield is below 100% because of incomplete reactions, side reactions and losses on transfer or filtration.',
          example: '18 g collected out of a possible 24 g is a 75% yield.',
        },
        {
          id: 'atomeconomy',
          term: 'Atom economy',
          definition: 'The proportion of reactant mass ending up as the desired product.',
          detail:
            'A reaction can have high yield but poor atom economy if it produces large unwanted by-products — it measures waste, not efficiency of conversion.',
          example: 'Addition reactions have 100% atom economy.',
        },
      ],
    },
    {
      id: 'acids',
      name: 'Acids, Bases & Salts',
      summary: 'pH, neutralisation, titration and making salts.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'ph',
          term: 'pH scale',
          definition: 'A 0–14 measure of hydrogen ion concentration in solution.',
          detail:
            'It is logarithmic, so each unit is a tenfold change: pH 3 has a hundred times the H⁺ of pH 5.',
          example: 'Lemon juice sits near pH 2.',
          misconception: 'pH 2 is twice as acidic as pH 4.',
        },
        {
          id: 'strongweak',
          term: 'Strong vs weak acids',
          definition: 'Strong acids ionise completely in water; weak acids only partially.',
          detail:
            'Strength is about degree of ionisation, while concentration is about how much acid is dissolved — they are independent.',
          example: 'Ethanoic acid is weak but can still be concentrated.',
          misconception: 'A concentrated acid is the same thing as a strong acid.',
        },
        {
          id: 'saltmaking',
          term: 'Making a soluble salt',
          definition: 'React excess insoluble base with acid, filter, then crystallise.',
          detail:
            'The excess guarantees all the acid reacts, and filtering removes what is left over before evaporation.',
          example: 'Copper oxide with sulfuric acid gives copper sulfate crystals.',
        },
        {
          id: 'titration',
          term: 'Titration',
          definition: 'Adding a solution of known concentration to find an unknown concentration.',
          detail:
            'Concordant titres within 0.10 cm³ are averaged, and a single-colour-change indicator is used rather than universal indicator.',
          example: 'Phenolphthalein turns colourless at the end point of an acid–alkali titration.',
        },
        {
          id: 'indicators',
          term: 'Indicators',
          definition: 'Substances that change colour depending on pH.',
          detail:
            'Universal indicator gives an approximate pH from a colour range; single indicators give a sharp end point instead.',
          example: 'Litmus is red in acid and blue in alkali.',
        },
        {
          id: 'reactionsofacids',
          term: 'Reactions of acids',
          definition: 'Standard products when acids meet metals, bases and carbonates.',
          detail:
            'Acid + metal → salt + hydrogen; acid + base → salt + water; acid + carbonate → salt + water + carbon dioxide.',
          example: 'Marble chips in hydrochloric acid fizz off CO₂.',
        },
      ],
    },
    {
      id: 'rates',
      name: 'Rates of Reaction',
      summary: 'Collision theory, catalysts and following a reaction over time.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'collision',
          term: 'Collision theory',
          definition:
            'Reactions occur when particles collide with enough energy and the right orientation.',
          detail:
            'Anything that raises collision frequency or the fraction of successful collisions raises the rate.',
          example: 'Powdered marble reacts faster than a single chip.',
        },
        {
          id: 'activationenergy',
          term: 'Activation energy',
          definition: 'The minimum energy a collision needs for a reaction to happen.',
          detail:
            'Heating does not lower it — it increases the proportion of particles that already exceed it.',
          example: 'A spark supplies the activation energy for a methane flame.',
          misconception: 'Raising the temperature lowers the activation energy.',
        },
        {
          id: 'surfacearea',
          term: 'Surface area effect',
          definition: 'Smaller pieces of a solid react faster than larger ones.',
          detail:
            'More of the solid is exposed, so collisions per second rise while the total amount stays the same.',
          example: 'Flour dust can explode though a bag of flour will not.',
        },
        {
          id: 'catalyst',
          term: 'Catalyst',
          definition: 'A substance that speeds a reaction without being used up.',
          detail:
            'It provides an alternative pathway with lower activation energy, and does not change the final yield.',
          example: 'Manganese dioxide with hydrogen peroxide.',
          misconception: 'A catalyst increases the amount of product formed.',
        },
        {
          id: 'measuringrate',
          term: 'Measuring rate',
          definition: 'Following the loss of a reactant or the formation of a product over time.',
          detail:
            'The gradient of the graph gives the rate, and it is steepest at the start when concentration is highest.',
          example: 'Collecting gas in a syringe every 10 seconds.',
        },
        {
          id: 'equilibrium',
          term: 'Dynamic equilibrium',
          definition:
            'A reversible reaction in a closed system where forward and backward rates are equal.',
          detail:
            'Concentrations stay constant but both reactions continue; Le Chatelier’s principle predicts the shift when conditions change.',
          example: 'The Haber process runs at a compromise 450 °C and 200 atm.',
          misconception: 'At equilibrium both reactions have stopped.',
        },
      ],
    },
    {
      id: 'organic',
      name: 'Organic Chemistry',
      summary: 'Hydrocarbons, functional groups and reactions of carbon compounds.',
      bands: ['upper', 'tertiary'],
      concepts: [
        {
          id: 'alkane',
          term: 'Alkanes',
          definition: 'Saturated hydrocarbons with the general formula CₙH₂ₙ₊₂.',
          detail:
            'Single bonds only makes them relatively unreactive apart from combustion, and boiling point rises with chain length.',
          example: 'Propane is C₃H₈.',
        },
        {
          id: 'alkene',
          term: 'Alkenes',
          definition: 'Unsaturated hydrocarbons containing a C=C double bond, CₙH₂ₙ.',
          detail:
            'The double bond makes them reactive in addition reactions, and it decolourises bromine water — the standard test.',
          example: 'Ethene turns orange bromine water colourless.',
          misconception: 'Alkanes also decolourise bromine water.',
        },
        {
          id: 'homologous',
          term: 'Homologous series',
          definition: 'A family of compounds sharing a general formula and functional group.',
          detail:
            'Consecutive members differ by CH₂, so properties change gradually and predictably down the series.',
          example: 'Methanol, ethanol, propanol are consecutive alcohols.',
        },
        {
          id: 'cracking',
          misconception:
            'Cracking is needed because short-chain hydrocarbons are the ones in surplus.',
          term: 'Cracking',
          definition: 'Breaking long-chain hydrocarbons into shorter, more useful molecules.',
          detail:
            'Supply of long chains exceeds demand, so cracking converts them into petrol-range alkanes and the alkenes needed for polymers.',
          example: 'Decane cracks into octane and ethene.',
        },
        {
          id: 'alcohol',
          term: 'Alcohols',
          definition: 'Compounds containing the −OH functional group.',
          detail:
            'They burn, react with sodium, and oxidise to carboxylic acids — the −OH group drives all of it.',
          example: 'Ethanol from fermentation of glucose.',
        },
        {
          id: 'fractional',
          misconception:
            'Crude oil fractions are separated by density rather than by boiling point.',
          term: 'Fractional distillation',
          definition: 'Separating crude oil into fractions by boiling point.',
          detail:
            'The column is hot at the bottom and cool at the top, so longer chains with stronger intermolecular forces condense lower down.',
          example: 'Bitumen leaves at the base; refinery gases at the top.',
        },
      ],
    },
    {
      id: 'energetics',
      name: 'Energetics',
      summary: 'Exothermic and endothermic change, bond energies and profiles.',
      bands: ['upper', 'tertiary'],
      concepts: [
        {
          id: 'exothermic',
          misconception:
            'In an exothermic reaction the products hold more energy than the reactants.',
          term: 'Exothermic reaction',
          definition: 'A reaction that transfers energy to the surroundings, raising their temperature.',
          detail:
            'The products sit lower in energy than the reactants, so the overall energy change is negative.',
          example: 'Combustion and neutralisation.',
        },
        {
          id: 'endothermic',
          term: 'Endothermic reaction',
          definition: 'A reaction that takes in energy, cooling the surroundings.',
          detail:
            'Products lie higher in energy than reactants; thermal decomposition and photosynthesis are typical.',
          example: 'Citric acid with sodium hydrogencarbonate feels cold.',
        },
        {
          id: 'bondenergy',
          term: 'Bond energy calculation',
          definition: 'Energy change = bonds broken − bonds made.',
          detail:
            'Breaking bonds always takes energy in and making them always gives energy out, so a negative result means exothermic.',
          example: 'A −890 kJ/mol result for methane combustion confirms it is exothermic.',
          misconception: 'Making bonds requires energy and breaking them releases it.',
        },
        {
          id: 'profile',
          misconception:
            'A catalyst lowers the overall energy change of a reaction as well as the activation energy.',
          term: 'Reaction profile',
          definition: 'A diagram of energy against reaction progress.',
          detail:
            'The hump height is the activation energy and the difference between the two levels is the overall energy change.',
          example: 'A catalysed reaction shows a lower hump but the same start and end.',
        },
        {
          id: 'activationenergychem',
          term: 'Activation energy (energetics)',
          definition: 'The energy barrier that must be overcome for a reaction to proceed.',
          detail:
            'Even strongly exothermic reactions can be slow at room temperature if this barrier is high.',
          example: 'Petrol is stable in air until a spark is supplied.',
        },
        {
          id: 'cells',
          term: 'Chemical cells',
          definition: 'Devices converting chemical energy into electrical energy.',
          detail:
            'Voltage depends on the difference in reactivity between the two electrode metals and the electrolyte used.',
          example: 'A zinc–copper cell produces about 1.1 V.',
        },
      ],
    },
  ],
}
