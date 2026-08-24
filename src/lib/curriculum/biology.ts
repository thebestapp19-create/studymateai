import type { Subject } from './types'

export const BIOLOGY: Subject = {
  id: 'biology',
  name: 'Biology',
  tagline: 'Cells, systems, genetics and ecosystems',
  topics: [
    {
      id: 'cells',
      name: 'Cells & Organelles',
      summary: 'Cell structure, the differences between cell types and transport across membranes.',
      bands: ['middle', 'lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'mitochondria',
          term: 'Mitochondrion',
          definition: 'The organelle where aerobic respiration releases energy as ATP.',
          detail:
            'Its folded inner membrane (cristae) provides a large surface area for the electron transport chain, so cells with high energy demands carry far more of them.',
          example: 'Heart muscle and sperm cells are packed with mitochondria.',
          misconception: 'Mitochondria make energy from nothing rather than transferring it from glucose.',
        },
        {
          id: 'ribosome',
          term: 'Ribosome',
          definition: 'The site of protein synthesis, where mRNA is translated into a chain of amino acids.',
          detail:
            'Ribosomes are found free in the cytoplasm or bound to the rough endoplasmic reticulum, and they are the one organelle present in both prokaryotes and eukaryotes.',
          example: 'Cells secreting digestive enzymes have extensive ribosome-studded rough ER.',
        },
        {
          id: 'nucleus',
          term: 'Nucleus',
          definition: 'The organelle containing the cell’s DNA and controlling its activities.',
          detail:
            'Its double membrane has pores that let mRNA out while keeping the chromosomes protected inside.',
          example: 'Mature red blood cells lose their nucleus to make room for haemoglobin.',
          misconception: 'All human cells contain a nucleus.',
        },
        {
          id: 'chloroplast',
          term: 'Chloroplast',
          definition: 'The plant organelle that captures light energy for photosynthesis.',
          detail:
            'Stacked thylakoid membranes hold chlorophyll, while the surrounding stroma is where carbon fixation happens.',
          example: 'Palisade mesophyll cells near the leaf surface are crowded with chloroplasts.',
        },
        {
          id: 'prokaryote',
          term: 'Prokaryotic cell',
          definition: 'A cell with no nucleus or membrane-bound organelles, such as a bacterium.',
          detail:
            'Its DNA sits free in the cytoplasm as a single loop, often with extra small rings called plasmids.',
          example: 'E. coli is a prokaryote roughly a hundredth the volume of a typical human cell.',
          misconception: 'Prokaryotes have no DNA because they have no nucleus.',
        },
        {
          id: 'diffusion',
          term: 'Diffusion',
          definition: 'The net movement of particles from high to low concentration, requiring no energy.',
          detail:
            'Rate rises with a steeper concentration gradient, higher temperature and larger surface area — the reasoning behind alveoli and villi.',
          example: 'Oxygen diffusing from an alveolus into a red blood cell.',
        },
        {
          id: 'osmosis',
          term: 'Osmosis',
          definition:
            'The movement of water across a partially permeable membrane from a dilute to a more concentrated solution.',
          detail:
            'It is diffusion of water down its own potential gradient; plant cells become turgid in dilute solutions and plasmolysed in concentrated ones.',
          example: 'Potato cylinders gain mass in distilled water and lose mass in strong sugar solution.',
          misconception: 'Osmosis moves water towards the solution with more water in it.',
        },
        {
          id: 'activetransport',
          term: 'Active transport',
          definition: 'Movement of substances against a concentration gradient using ATP and carrier proteins.',
          detail:
            'Because it needs energy, it stops when respiration is inhibited — the classic experimental test that distinguishes it from diffusion.',
          example: 'Root hair cells absorbing mineral ions from dilute soil water.',
        },
      ],
    },
    {
      id: 'photosynthesis',
      name: 'Photosynthesis',
      summary: 'How plants convert light energy into chemical energy, and what limits the rate.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'equation',
          term: 'Photosynthesis equation',
          definition:
            'Carbon dioxide + water → glucose + oxygen, using light energy trapped by chlorophyll.',
          detail:
            'Balanced it is 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, an endothermic reaction that stores light energy in chemical bonds.',
          example: 'Pondweed produces visible oxygen bubbles under a bright lamp.',
          misconception: 'Plants take in oxygen only at night and never respire during the day.',
        },
        {
          id: 'chlorophyll',
          term: 'Chlorophyll',
          definition: 'The green pigment that absorbs light energy, mainly red and blue wavelengths.',
          detail:
            'Green light is reflected rather than absorbed, which is why leaves look green and why green light gives the lowest photosynthetic rate.',
          example: 'Variegated leaves only make starch in their green regions.',
        },
        {
          id: 'limitingfactor',
          term: 'Limiting factor',
          definition: 'The factor in shortest supply that caps the rate of photosynthesis.',
          detail:
            'On a rate graph the curve rises then plateaus; the plateau shows a different factor has taken over as the limit.',
          example: 'On a bright cold morning, temperature limits the rate rather than light.',
          misconception: 'Increasing light always increases photosynthesis without limit.',
        },
        {
          id: 'stomata',
          term: 'Stomata',
          definition: 'Pores on the leaf underside that let carbon dioxide in and water vapour out.',
          detail:
            'Guard cells open them by becoming turgid, trading gas exchange against water loss — they close in drought.',
          example: 'Cacti open stomata at night to reduce water loss.',
        },
        {
          id: 'leafadaptation',
          term: 'Leaf adaptations',
          definition: 'Structural features that maximise light capture and gas exchange.',
          detail:
            'A broad thin blade, palisade cells at the top, air spaces in the spongy layer and a network of veins each solve one part of the problem.',
          example: 'Palisade cells are column-shaped so more chloroplasts sit near the surface.',
        },
        {
          id: 'glucoseuse',
          term: 'Uses of glucose',
          definition: 'The products a plant makes from the sugar it photosynthesises.',
          detail:
            'Glucose is respired for energy, stored as insoluble starch, converted to cellulose for cell walls, or combined with nitrates to make amino acids.',
          example: 'Iodine turns blue-black on a destarched leaf that has photosynthesised.',
          misconception: 'Plants store glucose directly because it is easier to use.',
        },
      ],
    },
    {
      id: 'respiration',
      name: 'Cellular Respiration',
      summary: 'Aerobic and anaerobic energy release, and the role of ATP.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'aerobic',
          term: 'Aerobic respiration',
          definition: 'Glucose + oxygen → carbon dioxide + water, releasing energy for ATP synthesis.',
          detail:
            'It happens mainly in the mitochondria and yields far more ATP per glucose molecule than anaerobic routes.',
          example: 'Steady jogging is fuelled almost entirely aerobically.',
          misconception: 'Respiration and breathing are the same process.',
        },
        {
          id: 'anaerobic',
          term: 'Anaerobic respiration',
          definition: 'Energy release without oxygen, producing lactic acid in animals.',
          detail:
            'It is fast but yields little ATP, and the lactic acid produced creates an oxygen debt repaid after exercise.',
          example: 'A 100 m sprint relies heavily on anaerobic respiration.',
        },
        {
          id: 'fermentation',
          term: 'Fermentation in yeast',
          definition: 'Anaerobic respiration in yeast, producing ethanol and carbon dioxide.',
          detail:
            'The same pathway underpins brewing and baking, and unlike lactic acid it cannot be reconverted by the organism.',
          example: 'Bread rises because trapped CO₂ from yeast expands the dough.',
        },
        {
          id: 'atp',
          term: 'ATP',
          definition: 'The molecule cells use to transfer energy to where it is needed.',
          detail:
            'Breaking the terminal phosphate bond releases usable energy immediately, so ATP is made continuously rather than stored in bulk.',
          example: 'Muscle contraction is powered by ATP hydrolysis.',
          misconception: 'ATP is a long-term store of energy like fat.',
        },
        {
          id: 'oxygendebt',
          term: 'Oxygen debt',
          definition: 'The extra oxygen needed after exercise to break down accumulated lactic acid.',
          detail:
            'It explains why breathing rate and heart rate stay high for minutes after the effort has stopped.',
          example: 'Panting at the end of a sprint.',
        },
        {
          id: 'metabolicrate',
          term: 'Metabolic rate',
          definition: 'The rate at which chemical reactions occur in the body.',
          detail:
            'It rises with activity, body temperature and muscle mass, and can be estimated from oxygen consumption.',
          example: 'Shivering raises metabolic rate to generate heat.',
        },
      ],
    },
    {
      id: 'genetics',
      name: 'Genetics & Inheritance',
      summary: 'DNA, alleles, Punnett squares and inherited variation.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'dna',
          term: 'DNA',
          definition: 'A double helix of nucleotides carrying the genetic code in its base sequence.',
          detail:
            'Complementary base pairing (A–T, C–G) lets each strand act as a template, which is what makes accurate replication possible.',
          example: 'A gene is a section of DNA coding for one protein.',
        },
        {
          id: 'allele',
          term: 'Allele',
          definition: 'One of the alternative versions of a gene at the same locus.',
          detail:
            'Diploid organisms carry two alleles per gene, one from each parent; identical alleles make an individual homozygous.',
          example: 'The eye-colour gene has brown and blue alleles.',
          misconception: 'Genes and alleles are two words for the same thing.',
        },
        {
          id: 'dominant',
          term: 'Dominant and recessive',
          definition:
            'A dominant allele shows in the phenotype with one copy; a recessive needs two.',
          detail:
            'This is why a recessive condition can skip generations, carried silently by heterozygous parents.',
          example: 'Cystic fibrosis appears only in individuals with two recessive alleles.',
          misconception: 'Dominant alleles are always the most common in a population.',
        },
        {
          id: 'genotype',
          term: 'Genotype and phenotype',
          definition:
            'The genotype is the combination of alleles; the phenotype is the observable characteristic.',
          detail:
            'Phenotype results from genotype interacting with the environment, so identical genotypes need not look identical.',
          example: 'Two hydrangeas with the same genotype flower pink or blue depending on soil pH.',
        },
        {
          id: 'punnett',
          term: 'Punnett square',
          definition: 'A grid predicting the offspring ratios from a genetic cross.',
          detail:
            'It gives probabilities, not guarantees: a 3 : 1 ratio is the expected long-run outcome, not four fixed offspring.',
          example: 'Crossing two heterozygotes (Bb × Bb) predicts 3 brown : 1 blue.',
          misconception: 'A 3 : 1 ratio means exactly three of every four offspring are affected.',
        },
        {
          id: 'mutation',
          term: 'Mutation',
          definition: 'A random change to the DNA base sequence.',
          detail:
            'Most mutations are neutral, some harmful, and a few beneficial — the source of the variation natural selection acts on.',
          example: 'A single base change causes the sickle cell allele.',
        },
        {
          id: 'meiosis',
          term: 'Meiosis',
          definition: 'Cell division producing four genetically different haploid gametes.',
          detail:
            'Crossing over and independent assortment shuffle alleles, which is why siblings differ despite the same parents.',
          example: 'Sperm and egg production in humans.',
          misconception: 'Meiosis produces two identical cells like mitosis.',
        },
      ],
    },
    {
      id: 'bodysystems',
      name: 'Human Body Systems',
      summary: 'Circulation, breathing, digestion and how organs work together.',
      bands: ['middle', 'lower'],
      concepts: [
        {
          id: 'doublecirculation',
          term: 'Double circulation',
          definition:
            'Blood passes through the heart twice per circuit: once to the lungs, once to the body.',
          detail:
            'The separation keeps pressure high for the systemic circuit while the pulmonary circuit stays gentle enough for delicate capillaries.',
          example: 'The left ventricle has a thicker wall than the right for this reason.',
          misconception: 'Arteries always carry oxygenated blood.',
        },
        {
          id: 'alveoli',
          term: 'Alveoli',
          definition: 'Tiny air sacs in the lungs where gas exchange takes place.',
          detail:
            'They combine an enormous surface area, a one-cell-thick wall, moisture and a dense capillary network to maximise diffusion.',
          example: 'Human lungs hold around 300 million alveoli.',
        },
        {
          id: 'enzymesdigestion',
          term: 'Digestive enzymes',
          definition: 'Proteins that break large food molecules into small soluble ones.',
          detail:
            'Amylase acts on starch, proteases on protein and lipase on fats, each working best at its own pH.',
          example: 'Stomach protease works at about pH 2 while intestinal enzymes prefer pH 8.',
        },
        {
          id: 'villi',
          term: 'Villi',
          definition: 'Finger-like folds of the small intestine that absorb digested food.',
          detail:
            'They increase surface area, have thin walls and a rich blood supply that maintains a steep concentration gradient.',
          example: 'Microvilli on each villus multiply the surface area again.',
        },
        {
          id: 'bloodcomponents',
          term: 'Components of blood',
          definition: 'Plasma, red blood cells, white blood cells and platelets.',
          detail:
            'Red cells carry oxygen using haemoglobin, white cells defend against pathogens, platelets clot, and plasma transports everything dissolved.',
          example: 'Red blood cells are biconcave to increase surface area for oxygen.',
          misconception: 'White blood cells carry oxygen alongside red ones.',
        },
        {
          id: 'nervoussystem',
          term: 'Reflex arc',
          definition: 'A rapid automatic response following the path receptor → sensory neurone → relay → motor neurone → effector.',
          detail:
            'Bypassing conscious brain processing makes the response fast, which protects the body from damage.',
          example: 'Pulling your hand off a hot surface before you feel the pain.',
        },
      ],
    },
    {
      id: 'ecology',
      name: 'Ecology & Ecosystems',
      summary: 'Food chains, energy transfer, cycles and interdependence.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'trophic',
          term: 'Trophic level',
          definition: 'A feeding position in a food chain, from producer to top consumer.',
          detail:
            'Only about 10% of energy passes to the next level, which limits food chains to roughly four or five links.',
          example: 'Grass → rabbit → fox has three trophic levels.',
          misconception: 'Energy is recycled through an ecosystem like nutrients are.',
        },
        {
          id: 'producer',
          term: 'Producer',
          definition: 'An organism that makes its own food, usually by photosynthesis.',
          detail:
            'Producers convert light into the chemical energy that supports every other organism in the ecosystem.',
          example: 'Phytoplankton are the producers of most marine food webs.',
        },
        {
          id: 'decomposer',
          term: 'Decomposer',
          definition: 'An organism that breaks down dead material, returning nutrients to the soil.',
          detail:
            'Without decomposers, carbon and nitrogen would stay locked in dead tissue and the cycles would stall.',
          example: 'Fungi and bacteria rotting fallen leaves.',
        },
        {
          id: 'carboncycle',
          term: 'Carbon cycle',
          definition: 'The continuous movement of carbon between the atmosphere, living things and the ground.',
          detail:
            'Photosynthesis removes CO₂; respiration, decay and combustion return it — human fossil fuel use has tipped the balance.',
          example: 'Burning coal releases carbon stored for millions of years.',
        },
        {
          id: 'competition',
          term: 'Competition',
          definition: 'The struggle between organisms for a resource in limited supply.',
          detail:
            'Interspecific competition acts between species and intraspecific within one, and the latter is often fiercer because needs overlap exactly.',
          example: 'Trees competing for light in a dense woodland.',
        },
        {
          id: 'biodiversity',
          term: 'Biodiversity',
          definition: 'The variety of species and genetic variation within an ecosystem.',
          detail:
            'Higher biodiversity generally makes an ecosystem more stable, since no single species failure collapses the food web.',
          example: 'Coral reefs support around a quarter of marine species.',
          misconception: 'Biodiversity just means the total number of organisms.',
        },
      ],
    },
    {
      id: 'evolution',
      name: 'Evolution & Natural Selection',
      summary: 'Variation, selection pressure, speciation and the fossil record.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'variation',
          term: 'Variation',
          definition: 'Differences between individuals of the same species.',
          detail:
            'Genetic variation from mutation and sexual reproduction is heritable; environmental variation is not, so only the former drives evolution.',
          example: 'Beak size differences among finches on one island.',
        },
        {
          id: 'selection',
          term: 'Natural selection',
          definition:
            'The process by which individuals better suited to their environment survive and reproduce more.',
          detail:
            'It needs variation, a selection pressure, differential survival and inheritance — remove any one and the process stops.',
          example: 'Antibiotic-resistant bacteria surviving a course of treatment.',
          misconception: 'Organisms deliberately adapt during their lifetime and pass that on.',
        },
        {
          id: 'adaptation',
          term: 'Adaptation',
          definition: 'A feature that increases an organism’s chance of survival in its habitat.',
          detail:
            'Adaptations may be structural, behavioural or functional, and each carries a cost as well as a benefit.',
          example: 'A camel’s hump stores fat, not water.',
        },
        {
          id: 'speciation',
          term: 'Speciation',
          definition: 'The formation of a new species when populations can no longer interbreed.',
          detail:
            'Isolation plus different selection pressures over many generations makes gene pools diverge past the point of fertile interbreeding.',
          example: 'Darwin’s finches diverging across the Galápagos islands.',
        },
        {
          id: 'evidence',
          term: 'Evidence for evolution',
          definition: 'Fossils, DNA comparisons and observed selection in the wild.',
          detail:
            'The fossil record is incomplete because soft tissue rarely fossilises, so molecular evidence now carries much of the weight.',
          example: 'Whale ancestors show shrinking hind limbs across successive fossils.',
        },
        {
          id: 'selectivebreeding',
          term: 'Selective breeding',
          definition: 'Humans choosing which organisms reproduce to develop desired characteristics.',
          detail:
            'It works like natural selection with a human selection pressure, but narrows the gene pool and can concentrate inherited defects.',
          example: 'Dairy cattle bred for high milk yield.',
          misconception: 'Selective breeding introduces brand-new genes into a species.',
        },
      ],
    },
    {
      id: 'enzymes',
      name: 'Enzymes & Biological Molecules',
      summary: 'Carbohydrates, proteins, lipids and how enzymes control reactions.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'enzyme',
          term: 'Enzyme',
          definition: 'A protein catalyst that speeds up a reaction without being used up.',
          detail:
            'It lowers activation energy by holding substrates in the right orientation in its active site.',
          example: 'Catalase breaks hydrogen peroxide into water and oxygen almost instantly.',
          misconception: 'Enzymes are used up in the reactions they catalyse.',
        },
        {
          id: 'activesite',
          term: 'Active site',
          definition: 'The region of an enzyme with a shape complementary to its substrate.',
          detail:
            'The induced fit model describes the site moulding slightly around the substrate, refining the older lock-and-key picture.',
          example: 'Only maltose fits maltase’s active site.',
        },
        {
          id: 'denature',
          term: 'Denaturation',
          definition: 'Loss of an enzyme’s shape, and so its function, from heat or extreme pH.',
          detail:
            'Bonds holding the tertiary structure break, so the active site no longer fits the substrate — and this is irreversible.',
          example: 'Egg white turning solid when heated.',
          misconception: 'A denatured enzyme has been killed.',
        },
        {
          id: 'optimum',
          term: 'Optimum conditions',
          definition: 'The temperature and pH at which an enzyme works fastest.',
          detail:
            'Rate rises with temperature until denaturation sets in, giving the characteristic asymmetric peak on a rate graph.',
          example: 'Human enzymes typically peak near 37 °C.',
        },
        {
          id: 'macromolecules',
          term: 'Biological molecules',
          definition: 'Carbohydrates, proteins and lipids, built from sugars, amino acids and fatty acids.',
          detail:
            'Each is a polymer or assembly formed by condensation reactions releasing water, and broken by hydrolysis.',
          example: 'Starch is a polymer of glucose; proteins are polymers of amino acids.',
        },
        {
          id: 'foodtests',
          term: 'Food tests',
          definition: 'Standard chemical tests identifying the main food groups.',
          detail:
            'Benedict’s for reducing sugars (blue → brick red), iodine for starch (orange → blue-black), Biuret for protein (blue → purple), ethanol emulsion for lipids.',
          example: 'A potato sample turns iodine blue-black.',
        },
      ],
    },
    {
      id: 'homeostasis',
      name: 'Homeostasis & Hormones',
      summary: 'Keeping internal conditions stable through feedback and hormones.',
      bands: ['upper', 'tertiary'],
      concepts: [
        {
          id: 'homeostasis',
          term: 'Homeostasis',
          definition: 'Maintaining a stable internal environment despite external change.',
          detail:
            'Every mechanism needs a receptor, a coordination centre and an effector, wired as negative feedback.',
          example: 'Blood glucose held near 90 mg/dL whether you have eaten or fasted.',
        },
        {
          id: 'negativefeedback',
          term: 'Negative feedback',
          definition: 'A control loop where a change triggers a response that reverses it.',
          detail:
            'It produces oscillation around a set point rather than perfect constancy, which is why body temperature fluctuates slightly.',
          example: 'Sweating cools the body, which then reduces sweating.',
          misconception: 'Negative feedback keeps a value perfectly constant.',
        },
        {
          id: 'insulin',
          term: 'Insulin and glucagon',
          definition: 'Pancreatic hormones that lower and raise blood glucose respectively.',
          detail:
            'Insulin drives glucose into cells and storage as glycogen; glucagon reverses it. Type 1 diabetes is failure to produce insulin.',
          example: 'Blood glucose falls within an hour of an insulin injection.',
        },
        {
          id: 'thermoregulation',
          term: 'Thermoregulation',
          definition: 'Control of body temperature by the hypothalamus.',
          detail:
            'Vasodilation, sweating and shivering adjust heat loss and production; vasodilation moves blood nearer the skin rather than moving vessels.',
          example: 'Flushed skin during exercise.',
          misconception: 'Blood vessels move closer to the skin surface when you are hot.',
        },
        {
          id: 'kidney',
          term: 'Osmoregulation',
          definition: 'Control of the water and salt balance of the blood by the kidneys.',
          detail:
            'ADH makes the collecting duct more permeable, so more water is reabsorbed and urine becomes concentrated.',
          example: 'Dark, small-volume urine after a long run.',
        },
        {
          id: 'hormonevsnerve',
          term: 'Hormonal vs nervous control',
          definition: 'Two coordination systems that differ in speed, duration and specificity.',
          detail:
            'Nervous responses are fast, short-lived and precisely targeted; hormonal responses are slower, longer-lasting and widespread.',
          example: 'Adrenaline prepares the whole body, while a reflex moves one muscle.',
        },
      ],
    },
  ],
}
