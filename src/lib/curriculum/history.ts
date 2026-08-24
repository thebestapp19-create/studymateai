import type { Subject } from './types'

export const HISTORY: Subject = {
  id: 'history',
  name: 'History',
  tagline: 'Causes, consequences and evidence',
  topics: [
    {
      id: 'ww1',
      name: 'Causes of World War I',
      summary: 'Alliances, imperial rivalry and the road to 1914.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'alliances',
          term: 'The alliance system',
          definition:
            'The two blocs — the Triple Alliance and the Triple Entente — that divided Europe before 1914.',
          detail:
            'The alliances turned a Balkan dispute into a continental war by obliging great powers to join in support of smaller partners.',
          example: 'Russia mobilised for Serbia, which brought Germany in for Austria-Hungary.',
          misconception: 'The alliances were formal promises that every member would automatically declare war.',
        },
        {
          id: 'militarism',
          term: 'Militarism',
          definition: 'The build-up of armed forces and the influence of military thinking on politics.',
          detail:
            'Rigid mobilisation timetables such as the Schlieffen Plan meant diplomacy ran out of time once mobilisation began.',
          example: 'The Anglo-German naval race over dreadnought battleships.',
        },
        {
          id: 'imperialism',
          term: 'Imperial rivalry',
          definition: 'Competition between European powers for colonies and influence.',
          detail:
            'Crises in Morocco in 1905 and 1911 hardened the blocs well before any shot was fired in Europe.',
          example: 'The Agadir Crisis of 1911.',
        },
        {
          id: 'nationalism',
          term: 'Nationalism',
          definition: 'Loyalty to one’s nation, and the demand of ethnic groups for self-rule.',
          detail:
            'Slav nationalism inside Austria-Hungary made Serbia look like an existential threat to the empire.',
          example: 'The Black Hand’s aim of a Greater Serbia.',
        },
        {
          id: 'sarajevo',
          term: 'Assassination at Sarajevo',
          definition: 'The killing of Archduke Franz Ferdinand on 28 June 1914.',
          detail:
            'Historians treat it as the trigger rather than the cause: the underlying tensions made escalation possible.',
          example: 'Gavrilo Princip fired the fatal shots.',
          misconception: 'The assassination alone caused the war.',
        },
        {
          id: 'julycrisis',
          term: 'The July Crisis',
          definition: 'The five weeks of ultimatums and mobilisations between the assassination and war.',
          detail:
            'Austria’s deliberately unacceptable ultimatum and the German "blank cheque" narrowed every remaining diplomatic option.',
          example: 'Britain declared war after Germany invaded neutral Belgium.',
        },
      ],
    },
    {
      id: 'ww2',
      name: 'World War II',
      summary: 'Appeasement, the course of the war and life on the home front.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'versailles',
          misconception:
            'The Treaty of Versailles was negotiated jointly with Germany at the conference table.',
          term: 'Treaty of Versailles',
          definition: 'The 1919 settlement imposing territorial losses and reparations on Germany.',
          detail:
            'Resentment at the "war guilt" clause gave extremist parties a grievance to campaign on through the 1920s and 1930s.',
          example: 'Germany lost the Rhineland to demilitarisation and paid heavy reparations.',
        },
        {
          id: 'appeasement',
          term: 'Appeasement',
          definition: 'The policy of conceding to Hitler’s demands to avoid another war.',
          detail:
            'Its defenders point to British unpreparedness in 1938; critics argue each concession raised the cost of resistance.',
          example: 'The Munich Agreement handing over the Sudetenland in 1938.',
          misconception: 'Appeasement was universally opposed in Britain at the time.',
        },
        {
          id: 'blitzkrieg',
          misconception:
            'Blitzkrieg worked because Germany had far more tanks than its opponents.',
          term: 'Blitzkrieg',
          definition: 'Fast combined attacks by tanks, aircraft and infantry to break through defences.',
          detail:
            'Speed and concentration aimed to collapse command and supply before a defence could form.',
          example: 'The fall of France in six weeks in 1940.',
        },
        {
          id: 'homefront',
          term: 'The Home Front',
          definition: 'Civilian life under wartime conditions: rationing, evacuation and war work.',
          detail:
            'Total war blurred the line between soldier and civilian, and pulled large numbers of women into industry.',
          example: 'Rationing of butter, sugar and bacon began in Britain in 1940.',
        },
        {
          id: 'turningpoints',
          term: 'Turning points',
          definition: 'Battles that shifted the strategic balance of the war.',
          detail:
            'Stalingrad, Midway and El Alamein each ended an Axis advance on a different front within about a year.',
          example: 'The German surrender at Stalingrad in February 1943.',
        },
        {
          id: 'holocaust',
          term: 'The Holocaust',
          definition: 'The Nazi genocide of six million Jewish people and other targeted groups.',
          detail:
            'It escalated from persecution and ghettoisation to industrialised murder, documented by perpetrators, survivors and liberators alike.',
          example: 'The Nuremberg Laws of 1935 stripped Jewish citizens of legal rights.',
        },
      ],
    },
    {
      id: 'coldwar',
      name: 'The Cold War',
      summary: 'Superpower rivalry from 1945 to 1991.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'ironcurtain',
          term: 'Iron Curtain',
          definition: 'The division between Soviet-controlled eastern Europe and the west.',
          detail:
            'Churchill’s 1946 phrase described a political and military divide that later became physical in Berlin.',
          example: 'The Berlin Wall from 1961 to 1989.',
        },
        {
          id: 'containment',
          misconception:
            'Containment aimed to roll communism back where it was already established.',
          term: 'Containment',
          definition: 'The US policy of preventing the spread of communism.',
          detail:
            'The Truman Doctrine and Marshall Plan paired military commitment with economic aid to make communism less attractive.',
          example: 'Marshall Aid to western Europe from 1948.',
        },
        {
          id: 'cubanmissile',
          term: 'Cuban Missile Crisis',
          definition: 'The 1962 standoff over Soviet nuclear missiles in Cuba.',
          detail:
            'It ended with a public Soviet withdrawal and a secret American promise to remove missiles from Turkey.',
          example: 'A naval quarantine of Cuba was imposed for thirteen days.',
          misconception: 'The crisis ended with concessions on only one side.',
        },
        {
          id: 'armsrace',
          misconception:
            'The two superpowers fought each other directly on several occasions.',
          term: 'The arms race',
          definition: 'Competitive nuclear weapons build-up between the superpowers.',
          detail:
            'Mutually assured destruction made all-out war irrational, pushing conflict into proxy wars instead.',
          example: 'The USSR tested its first atomic bomb in 1949.',
        },
        {
          id: 'proxywar',
          term: 'Proxy war',
          definition: 'A conflict where the superpowers backed opposing sides without fighting each other directly.',
          detail:
            'It let both powers pursue advantage while avoiding the nuclear escalation of direct war.',
          example: 'Korea, Vietnam and Afghanistan.',
        },
        {
          id: 'detente',
          term: 'Détente and collapse',
          definition: 'The easing of tension in the 1970s and the Soviet collapse in 1991.',
          detail:
            'Economic strain, Gorbachev’s reforms and the 1989 revolutions in eastern Europe combined to end the bloc.',
          example: 'Glasnost and perestroika from 1985.',
        },
      ],
    },
    {
      id: 'industrial',
      name: 'The Industrial Revolution',
      summary: 'Industrialisation, urban life and social change.',
      bands: ['middle', 'lower'],
      concepts: [
        {
          id: 'factorysystem',
          misconception:
            'Workers moved into factories because the hours were shorter than at home.',
          term: 'Factory system',
          definition: 'Production concentrated in large workplaces with powered machinery.',
          detail:
            'It replaced the domestic system, imposing fixed hours and supervision on workers for the first time.',
          example: 'Cotton mills in Manchester.',
        },
        {
          id: 'steam',
          term: 'Steam power',
          definition: 'Engines converting heat into motion, freeing industry from water sites.',
          detail:
            'Watt’s improvements made steam efficient enough for factories and, later, railways.',
          example: 'Stephenson’s Rocket in 1829.',
        },
        {
          id: 'urbanisation19',
          term: 'Urbanisation',
          definition: 'Rapid population growth in industrial towns.',
          detail:
            'Housing and sanitation lagged far behind, producing overcrowding and cholera outbreaks.',
          example: 'Manchester grew roughly tenfold across the nineteenth century.',
        },
        {
          id: 'childlabour',
          term: 'Child labour and reform',
          definition: 'The employment of children, and the laws that gradually restricted it.',
          detail:
            'Factory Acts limited hours and required schooling, though enforcement depended on the new inspectorate.',
          example: 'The 1833 Factory Act banned under-nines in textile mills.',
          misconception: 'Child labour ended immediately once the first Factory Act passed.',
        },
        {
          id: 'publichealth',
          misconception:
            'Governments accepted responsibility for public health from the start of the industrial period.',
          term: 'Public health',
          definition: 'Government action on water, sewers and disease in industrial cities.',
          detail:
            'Snow’s work on the 1854 cholera outbreak shifted opinion from miasma theory towards contaminated water.',
          example: 'The Public Health Act of 1875.',
        },
        {
          id: 'tradeunions',
          term: 'Trade unions',
          definition: 'Workers organising collectively over pay and conditions.',
          detail:
            'Legalisation in the 1870s turned strikes from a criminal act into a bargaining tool.',
          example: 'The 1888 matchgirls’ strike.',
        },
      ],
    },
    {
      id: 'civilrights',
      name: 'Civil Rights in the USA',
      summary: 'Segregation, protest and legal change from 1945.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'jimcrow',
          misconception:
            'Segregation in the South was informal custom rather than written into state law.',
          term: 'Jim Crow laws',
          definition: 'State laws enforcing racial segregation in the southern USA.',
          detail:
            'The "separate but equal" doctrine of Plessy v. Ferguson (1896) gave them legal cover for nearly sixty years.',
          example: 'Segregated schools, buses and drinking fountains.',
        },
        {
          id: 'brown',
          term: 'Brown v. Board of Education',
          definition: 'The 1954 Supreme Court ruling that school segregation was unconstitutional.',
          detail:
            'It overturned "separate but equal" in education, but enforcement took federal troops in places such as Little Rock.',
          example: 'The Little Rock Nine escorted into school in 1957.',
          misconception: 'The ruling desegregated American schools immediately.',
        },
        {
          id: 'montgomery',
          term: 'Montgomery Bus Boycott',
          definition: 'The 1955–56 boycott of segregated buses in Montgomery, Alabama.',
          detail:
            'Lasting over a year, it proved economic pressure worked and brought Martin Luther King Jr. to prominence.',
          example: 'Rosa Parks’ arrest in December 1955.',
        },
        {
          id: 'nonviolence',
          misconception:
            'Non-violent protest succeeded because it avoided provoking any reaction.',
          term: 'Non-violent protest',
          definition: 'Deliberate peaceful resistance to unjust laws.',
          detail:
            'Televised violence against peaceful marchers shifted northern white opinion and pressured Congress.',
          example: 'The Greensboro sit-ins of 1960.',
        },
        {
          id: 'legislation',
          misconception:
            'The Civil Rights Act of 1964 ended discrimination in practice straight away.',
          term: 'Civil Rights and Voting Rights Acts',
          definition: 'The 1964 and 1965 laws outlawing discrimination and protecting the vote.',
          detail:
            'The Voting Rights Act suspended literacy tests and sent federal examiners into resistant counties.',
          example: 'Black voter registration in Mississippi rose sharply after 1965.',
        },
        {
          id: 'blackpower',
          term: 'Black Power',
          definition: 'A movement emphasising self-reliance, pride and, for some, self-defence.',
          detail:
            'It grew from frustration at the slow pace of change and at conditions in northern cities untouched by southern legal victories.',
          example: 'The 1968 Olympic salute in Mexico City.',
        },
      ],
    },
    {
      id: 'sources',
      name: 'Source Analysis Skills',
      summary: 'Working with evidence: provenance, utility and interpretation.',
      bands: ['middle', 'lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'provenance',
          term: 'Provenance',
          definition: 'Who produced a source, when, why and for whom.',
          detail:
            'Provenance decides how a source should be read; the same claim means different things in a diary and a poster.',
          example: 'A government poster from 1916 is designed to recruit, not to inform.',
        },
        {
          id: 'utility',
          term: 'Utility',
          definition: 'How useful a source is for a specific enquiry.',
          detail:
            'Utility is always relative to the question — a biased source can be highly useful evidence of attitudes.',
          example: 'Propaganda is limited on events but excellent on official messaging.',
          misconception: 'A biased source is automatically a useless source.',
        },
        {
          id: 'reliability',
          term: 'Reliability',
          definition: 'How far a source can be trusted as an accurate account.',
          detail:
            'Judge it against context and other sources rather than by tone alone.',
          example: 'A memoir written decades later may be shaped by hindsight.',
        },
        {
          id: 'interpretation',
          term: 'Interpretation',
          definition: 'A historian’s argument about the past, as opposed to a source from it.',
          detail:
            'Interpretations differ because of new evidence, different questions, or the concerns of the historian’s own time.',
          example: 'Debates over how far Britain was ready for war in 1938.',
          misconception: 'Historians disagree only because some of them are wrong.',
        },
        {
          id: 'causation',
          term: 'Causation',
          definition: 'Explaining why something happened, weighing long and short-term factors.',
          detail:
            'Strong answers rank causes and show how they interacted rather than listing them.',
          example: 'Distinguishing the trigger at Sarajevo from underlying tensions.',
        },
        {
          id: 'significance',
          term: 'Significance',
          definition: 'How important an event was, judged by stated criteria.',
          detail:
            'Significance can change over time — events are remembered or reinterpreted by later generations.',
          example: 'The Montgomery boycott’s reputation grew as the movement succeeded.',
        },
      ],
    },
    {
      id: 'weimar',
      name: 'Weimar & Nazi Germany',
      summary: 'Democracy under strain and the Nazi rise to power.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'weimarconstitution',
          term: 'Weimar Constitution',
          definition: 'The 1919 democratic constitution of the German republic.',
          detail:
            'Proportional representation produced fragile coalitions, and Article 48 let the president rule by decree in emergencies.',
          example: 'Chancellors governed by decree from 1930.',
        },
        {
          id: 'hyperinflation',
          misconception:
            'Hyperinflation damaged every group in German society equally.',
          term: 'Hyperinflation',
          definition: 'The collapse in the value of the mark in 1923.',
          detail:
            'Savers and those on fixed incomes were ruined, while borrowers gained — a split that shaped later politics.',
          example: 'A loaf of bread cost billions of marks by November 1923.',
        },
        {
          id: 'depression',
          term: 'The Great Depression',
          definition: 'The economic slump after 1929 that pushed German unemployment past six million.',
          detail:
            'Nazi and Communist votes rose together as mainstream parties failed to resolve the crisis.',
          example: 'The Nazi vote jumped from 12 to 107 seats in 1930.',
        },
        {
          id: 'nazirise',
          term: 'Rise to power',
          definition: 'The legal appointment of Hitler as Chancellor in January 1933.',
          detail:
            'Conservative politicians expected to control him in a coalition; the Reichstag Fire and Enabling Act removed that constraint within weeks.',
          example: 'The Enabling Act passed in March 1933.',
          misconception: 'Hitler seized power in a violent coup.',
        },
        {
          id: 'policestate',
          misconception:
            'The Gestapo was large enough to watch the population without help from the public.',
          term: 'The police state',
          definition: 'Control through the SS, Gestapo, courts and informers.',
          detail:
            'Much surveillance relied on ordinary citizens denouncing neighbours rather than on Gestapo numbers, which were small.',
          example: 'Concentration camps for political opponents from 1933.',
        },
        {
          id: 'propaganda',
          term: 'Propaganda',
          definition: 'Goebbels’ control of media, rallies and culture.',
          detail:
            'Cheap radios put the regime’s voice in homes, while censorship removed competing accounts.',
          example: 'The Nuremberg rallies.',
        },
      ],
    },
  ],
}
