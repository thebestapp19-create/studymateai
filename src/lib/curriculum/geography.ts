import type { Subject } from './types'

export const GEOGRAPHY: Subject = {
  id: 'geography',
  name: 'Geography',
  tagline: 'Physical processes, people and place',
  topics: [
    {
      id: 'tectonics',
      name: 'Plate Tectonics & Hazards',
      summary: 'Plate boundaries, earthquakes, volcanoes and managing risk.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'convection',
          term: 'Mantle convection',
          definition: 'Slow circulation of hot mantle rock that drives plate movement.',
          detail:
            'Ridge push and slab pull now carry most of the explanation, with convection as the underlying heat engine.',
          example: 'Sea-floor spreading at the Mid-Atlantic Ridge.',
        },
        {
          id: 'destructive',
          term: 'Destructive (convergent) margin',
          definition: 'A boundary where an oceanic plate subducts beneath another plate.',
          detail:
            'Melting of the descending plate feeds explosive andesitic volcanoes, and locked plates release deep, powerful earthquakes.',
          example: 'The Nazca plate diving beneath South America.',
          misconception: 'The lighter continental plate is the one that sinks.',
        },
        {
          id: 'constructive',
          term: 'Constructive (divergent) margin',
          definition: 'A boundary where plates move apart and new crust forms.',
          detail:
            'Magma rises easily, giving gentle basaltic eruptions and shallow, less damaging earthquakes.',
          example: 'Iceland sits astride a constructive margin.',
        },
        {
          id: 'conservative',
          term: 'Conservative (transform) margin',
          definition: 'A boundary where plates slide past one another.',
          detail:
            'No crust is created or destroyed, so there is no volcanic activity — but friction produces large earthquakes.',
          example: 'The San Andreas Fault.',
          misconception: 'Every plate boundary produces volcanoes.',
        },
        {
          id: 'hazardrisk',
          term: 'Hazard risk',
          definition: 'The likelihood that people will be harmed by a natural event.',
          detail:
            'Risk depends on vulnerability and capacity to cope, which is why similar magnitudes cause very different death tolls.',
          example: 'A magnitude 7 quake kills far more in a low-income country.',
        },
        {
          id: 'management',
          term: 'Prediction, protection and planning',
          definition: 'Strategies for reducing the impact of tectonic hazards.',
          detail:
            'Earthquakes cannot yet be predicted reliably, so engineering and preparedness carry most of the load; volcanoes give warning signs.',
          example: 'Japan’s earthquake-resistant buildings and drills.',
        },
      ],
    },
    {
      id: 'rivers',
      name: 'Rivers & Flooding',
      summary: 'River processes, landforms and flood management.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'erosionprocesses',
          term: 'River erosion processes',
          definition: 'Hydraulic action, abrasion, attrition and solution.',
          detail:
            'Abrasion shapes the channel while attrition only rounds the load — a distinction often confused in exams.',
          example: 'Pebbles grinding a pothole into the bed.',
          misconception: 'Attrition wears away the river bank.',
        },
        {
          id: 'longprofile',
          term: 'Long profile',
          definition: 'The gradient of a river from source to mouth.',
          detail:
            'Vertical erosion dominates upstream and lateral erosion downstream, so valleys change from V-shaped to wide floodplains.',
          example: 'A steep upper course flattening to a broad lower course.',
        },
        {
          id: 'meander',
          term: 'Meander',
          definition: 'A bend where erosion on the outside and deposition on the inside shift the channel.',
          detail:
            'Faster flow on the outer bank cuts a river cliff; slower inner flow builds a slip-off slope, and eventual cut-off leaves an oxbow lake.',
          example: 'Oxbow lakes on the lower Mississippi.',
        },
        {
          id: 'waterfall',
          term: 'Waterfall formation',
          definition: 'A step formed where a river crosses hard rock overlying softer rock.',
          detail:
            'The soft rock undercuts, the overhang collapses and the waterfall retreats upstream leaving a gorge.',
          example: 'High Force on the River Tees.',
        },
        {
          id: 'hydrograph',
          term: 'Flood hydrograph',
          definition: 'A graph of river discharge after a rainfall event.',
          detail:
            'Urbanisation shortens lag time and raises the peak because impermeable surfaces speed runoff.',
          example: 'A flashy hydrograph after heavy rain on a paved catchment.',
          misconception: 'Lag time is the gap between the start and end of the rain.',
        },
        {
          id: 'floodmanagement',
          term: 'Hard and soft engineering',
          definition: 'Built defences versus working with natural processes.',
          detail:
            'Hard schemes protect quickly but cost more and can shift the problem downstream; soft schemes are cheaper and more sustainable.',
          example: 'Flood walls versus upstream tree planting.',
        },
      ],
    },
    {
      id: 'coasts',
      name: 'Coasts & Erosion',
      summary: 'Coastal processes, landforms and defence.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'waves',
          term: 'Constructive and destructive waves',
          definition: 'Waves that build beaches, and waves that strip them.',
          detail:
            'Constructive waves have a stronger swash than backwash; destructive waves reverse that balance.',
          example: 'Winter storms flattening a summer beach profile.',
        },
        {
          id: 'longshore',
          term: 'Longshore drift',
          definition: 'The zig-zag transport of sediment along a coast by angled waves.',
          detail:
            'Swash follows the wind-driven wave angle while backwash returns straight down the slope, moving material sideways.',
          example: 'Spits forming at Spurn Head.',
          misconception: 'Longshore drift moves material out to sea.',
        },
        {
          id: 'headland',
          misconception:
            'Bays form where the rock is hardest, because waves are focused there.',
          term: 'Headlands and bays',
          definition: 'Alternating hard and soft rock eroding at different rates.',
          detail:
            'Softer rock retreats into bays where deposition builds beaches, while resistant headlands take the full wave energy.',
          example: 'Swanage Bay between two chalk headlands.',
        },
        {
          id: 'stack',
          term: 'Cave–arch–stack–stump',
          definition: 'The erosion sequence in a resistant headland.',
          detail:
            'Weaknesses widen into caves, caves meet to form an arch, the roof collapses to leave a stack, then a stump.',
          example: 'Old Harry Rocks.',
        },
        {
          id: 'coastaldefence',
          misconception:
            'Groynes protect the whole coastline, not just the beach beside them.',
          term: 'Coastal defences',
          definition: 'Sea walls, groynes, beach nourishment and managed retreat.',
          detail:
            'Groynes trap sediment locally but starve beaches further along, which is why schemes are judged along a whole cell.',
          example: 'Beach nourishment at Bournemouth.',
        },
        {
          id: 'massmovement',
          term: 'Mass movement',
          definition: 'The downslope movement of material under gravity.',
          detail:
            'Saturation adds weight and lubricates slip planes, which is why cliff falls follow heavy rain.',
          example: 'Rotational slumping on clay cliffs at Holderness.',
        },
      ],
    },
    {
      id: 'weather',
      name: 'Weather & Climate',
      summary: 'Atmospheric circulation, weather systems and extreme events.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'circulation',
          misconception:
            'Hot deserts sit near 30° north and south because that is where the sun is strongest.',
          term: 'Global atmospheric circulation',
          definition: 'The system of Hadley, Ferrel and Polar cells that redistributes heat.',
          detail:
            'Rising air at the equator gives rain; sinking air near 30° gives the world’s hot deserts.',
          example: 'The Sahara lies under a descending limb of the Hadley cell.',
        },
        {
          id: 'pressure',
          term: 'High and low pressure',
          definition: 'Sinking air brings settled weather; rising air brings cloud and rain.',
          detail:
            'Air flows from high to low pressure, and the steeper the gradient the stronger the wind.',
          example: 'A summer anticyclone bringing clear skies.',
          misconception: 'Low pressure means cold weather.',
        },
        {
          id: 'tropicalstorm',
          misconception:
            'Tropical storms form most easily directly on the equator.',
          term: 'Tropical storms',
          definition: 'Intense low-pressure systems forming over oceans above about 27 °C.',
          detail:
            'They need warm deep water, convergence and the Coriolis effect, so they never form on the equator itself.',
          example: 'Hurricane paths curving away from the equator.',
        },
        {
          id: 'reliefrain',
          term: 'Types of rainfall',
          definition: 'Relief, convectional and frontal rain.',
          detail:
            'Each has a different lifting mechanism — mountains, surface heating, or warm air riding over cold.',
          example: 'Heavy afternoon convectional storms in summer.',
        },
        {
          id: 'microclimate',
          term: 'Urban microclimate',
          definition: 'Local climate differences created by cities.',
          detail:
            'Dark surfaces, waste heat and reduced evaporation make urban areas warmer than surrounding countryside.',
          example: 'The urban heat island effect at night.',
        },
        {
          id: 'extremeweather',
          term: 'Extreme weather',
          definition: 'Events well outside the normal range for a place.',
          detail:
            'Impacts depend as much on preparedness as on the physical event itself.',
          example: 'Heatwaves, droughts and severe storms.',
        },
      ],
    },
    {
      id: 'climatechange',
      name: 'Climate Change',
      summary: 'Evidence, causes, impacts and responses.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'greenhouse',
          term: 'Enhanced greenhouse effect',
          definition: 'Extra warming from human-released greenhouse gases.',
          detail:
            'The natural greenhouse effect keeps Earth habitable; the enhanced effect is the additional trapping from higher CO₂ and methane.',
          example: 'Atmospheric CO₂ has risen from about 280 to over 420 ppm.',
          misconception: 'The greenhouse effect is entirely man-made and entirely harmful.',
        },
        {
          id: 'evidence',
          term: 'Evidence for change',
          definition: 'Ice cores, temperature records, sea level and glacial retreat.',
          detail:
            'Ice cores give hundreds of thousands of years of CO₂ and temperature together, setting today’s rise in context.',
          example: 'Retreat of Alpine glaciers documented since the 1850s.',
        },
        {
          id: 'naturalcauses',
          term: 'Natural causes',
          definition: 'Orbital cycles, solar output and volcanic activity.',
          detail:
            'These explain past glacials and interglacials but not the speed of recent warming.',
          example: 'Milankovitch cycles operate over tens of thousands of years.',
        },
        {
          id: 'impacts',
          term: 'Impacts',
          definition: 'Effects on sea level, ecosystems, water supply and agriculture.',
          detail:
            'Impacts fall unevenly, with lower-income and low-lying countries most exposed and least resourced.',
          example: 'Sea-level rise threatening Bangladesh’s delta.',
        },
        {
          id: 'mitigation',
          term: 'Mitigation',
          definition: 'Reducing greenhouse gas emissions to limit warming.',
          detail:
            'It tackles the cause rather than the symptom, but requires international agreement to be effective.',
          example: 'Renewable energy, carbon pricing, afforestation.',
        },
        {
          id: 'adaptation',
          term: 'Adaptation',
          definition: 'Adjusting to the effects of climate change that cannot be avoided.',
          detail:
            'Adaptation is local and immediate; mitigation is global and long-term. Most strategies need both.',
          example: 'Flood barriers and drought-resistant crops.',
          misconception: 'Adaptation and mitigation are alternatives rather than complements.',
        },
      ],
    },
    {
      id: 'urbanisation',
      name: 'Urbanisation & Cities',
      summary: 'Urban growth, challenges and sustainable cities.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'urbanisationdef',
          term: 'Urbanisation',
          definition: 'A rising proportion of a population living in towns and cities.',
          detail:
            'It is driven by rural–urban migration and natural increase, and is fastest today in lower-income countries.',
          example: 'Lagos growing by hundreds of thousands each year.',
          misconception: 'Urbanisation simply means a city’s population is growing.',
        },
        {
          id: 'pushpull',
          term: 'Push and pull factors',
          definition: 'Reasons people leave rural areas and are drawn to cities.',
          detail:
            'Perceived opportunity often outstrips reality, which is one driver of informal settlement growth.',
          example: 'Drought pushing farmers towards city jobs.',
        },
        {
          id: 'informalsettlement',
          misconception:
            'Clearing informal settlements is the most effective way to improve them.',
          term: 'Informal settlements',
          definition: 'Unplanned housing without secure tenure or full services.',
          detail:
            'Upgrading schemes that add services in place usually work better than clearance and relocation.',
          example: 'Rocinha in Rio de Janeiro.',
        },
        {
          id: 'urbansprawl',
          term: 'Urban sprawl',
          definition: 'The low-density spread of a city into surrounding countryside.',
          detail:
            'It increases car dependence and infrastructure costs, which is why green belts exist.',
          example: 'Commuter suburbs beyond a city edge.',
        },
        {
          id: 'regeneration',
          misconception:
            'Regeneration automatically benefits the people already living in an area.',
          term: 'Urban regeneration',
          definition: 'Investment to revive run-down urban areas.',
          detail:
            'It can raise property values so far that existing residents are displaced — gentrification.',
          example: 'London’s Docklands redevelopment.',
        },
        {
          id: 'sustainablecity',
          term: 'Sustainable urban living',
          definition: 'Meeting present needs without compromising the future.',
          detail:
            'Water and energy conservation, green space and public transport must work together to make a measurable difference.',
          example: 'Freiburg’s car-reduced neighbourhoods.',
        },
      ],
    },
    {
      id: 'development',
      name: 'Development & Globalisation',
      summary: 'Measuring development, the development gap and global links.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'hdi',
          term: 'Human Development Index',
          definition: 'A composite measure using income, life expectancy and education.',
          detail:
            'Composite measures reveal inequalities that GNI per capita alone hides.',
          example: 'A country can have high income but low HDI.',
          misconception: 'GDP per person is a complete measure of development.',
        },
        {
          id: 'developmentgap',
          term: 'The development gap',
          definition: 'The difference in living standards between richer and poorer countries.',
          detail:
            'Its causes are physical, historical, economic and political together, not any one alone.',
          example: 'Landlocked countries face higher trade costs.',
        },
        {
          id: 'tnc',
          term: 'Transnational corporations',
          definition: 'Companies operating across several countries.',
          detail:
            'They bring jobs and investment, but profits often leave the host country and standards can be lower than at home.',
          example: 'Electronics assembly plants in south-east Asia.',
        },
        {
          id: 'globalisation',
          term: 'Globalisation',
          definition: 'Increasing interconnection of economies, cultures and people.',
          detail:
            'Container shipping and digital communication cut the cost of distance, enabling global supply chains.',
          example: 'A phone designed, assembled and sold on three continents.',
        },
        {
          id: 'aid',
          misconception:
            'Large top-down aid projects are consistently the most effective form of aid.',
          term: 'Aid',
          definition: 'Resources given by one country or organisation to another.',
          detail:
            'Bottom-up, small-scale projects often prove more sustainable than large top-down schemes.',
          example: 'A village well scheme run with local training.',
        },
        {
          id: 'demographic',
          misconception:
            'Population grows fastest in the final stage of the demographic transition.',
          term: 'Demographic transition',
          definition: 'The shift from high birth and death rates to low ones as a country develops.',
          detail:
            'Death rates fall first, so rapid population growth happens in the middle stages.',
          example: 'Stage 2 countries with falling death rates and high birth rates.',
        },
      ],
    },
    {
      id: 'ecosystems',
      name: 'Ecosystems & Biomes',
      summary: 'Global biomes, nutrient cycling and sustainable management.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'biome',
          term: 'Biome',
          definition: 'A large-scale ecosystem defined by climate and vegetation.',
          detail:
            'Latitude and the global circulation set the pattern, which is why deserts cluster near 30° north and south.',
          example: 'Tropical rainforest, savanna, tundra.',
        },
        {
          id: 'rainforest',
          misconception:
            'Every layer of a rainforest receives roughly the same amount of light.',
          term: 'Rainforest structure',
          definition: 'Layered vegetation from emergents down to the forest floor.',
          detail:
            'Competition for light produces the layers, and buttress roots stabilise tall trees in thin soils.',
          example: 'Only about 2% of light reaches the floor.',
        },
        {
          id: 'nutrientcycle',
          term: 'Nutrient cycling',
          definition: 'The movement of nutrients between biomass, litter and soil.',
          detail:
            'In rainforests most nutrients are in the biomass, so clearance quickly exhausts the soil.',
          example: 'Cleared rainforest soil losing fertility within a few years.',
          misconception: 'Rainforests must have rich, deep soils because they grow so much.',
        },
        {
          id: 'deforestation',
          misconception:
            'Deforestation only affects the area where the trees are actually cut down.',
          term: 'Deforestation',
          definition: 'Permanent removal of forest for other land uses.',
          detail:
            'Impacts run from local soil erosion to global carbon release, and drivers are usually economic.',
          example: 'Cattle ranching in the Amazon.',
        },
        {
          id: 'desert',
          term: 'Hot desert adaptations',
          definition: 'Plant and animal features for surviving heat and drought.',
          detail:
            'Water storage, deep or wide root systems and nocturnal behaviour all reduce water loss.',
          example: 'Cacti storing water in fleshy stems.',
        },
        {
          id: 'sustainablemanagement',
          term: 'Sustainable management',
          definition: 'Using an ecosystem without degrading it for the future.',
          detail:
            'Selective logging, ecotourism and community forestry aim to keep economic value while limiting damage.',
          example: 'Costa Rica’s ecotourism and reforestation.',
        },
      ],
    },
  ],
}
