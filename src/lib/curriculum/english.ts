import { buildChoices } from './genUtils'
import type { Generator, Subject } from './types'

const APOSTROPHE_ITEMS = [
  {
    correct: 'The girls’ changing room was locked.',
    wrong: ['The girl’s changing rooms was locked.', 'The girls changing room’s was locked.', 'The girls’s changing room was locked.'],
    why: 'A plural noun already ending in -s takes the apostrophe after the s: girls’.',
  },
  {
    correct: 'It’s been raining since the team lost its captain.',
    wrong: ['Its been raining since the team lost it’s captain.', 'It’s been raining since the team lost it’s captain.', 'Its’ been raining since the team lost its captain.'],
    why: '“It’s” is only ever short for it is or it has; the possessive “its” takes no apostrophe.',
  },
  {
    correct: 'The children’s work was displayed in the hall.',
    wrong: ['The childrens’ work was displayed in the hall.', 'The childrens work was displayed in the hall.', 'The children’s’ work was displayed in the hall.'],
    why: '“Children” is an irregular plural that does not end in -s, so it takes ’s.',
  },
  {
    correct: 'Whose coat is this, and who’s taking it home?',
    wrong: ['Who’s coat is this, and whose taking it home?', 'Whose coat is this, and whose taking it home?', 'Who’s coat is this, and who’s taking it home?'],
    why: '“Whose” shows possession; “who’s” is short for who is.',
  },
]

const punctuation: Generator = {
  id: 'eng.punctuation',
  difficulty: 2,
  make: (rng) => {
    const item = rng.pick(APOSTROPHE_ITEMS)
    const { choices, answerIndex } = buildChoices(rng, item.correct, item.wrong)
    return {
      prompt: 'Which sentence is punctuated correctly?',
      choices,
      answerIndex,
      explanation: item.why,
      skill: 'apostrophes and possession',
    }
  },
}

const DEVICE_ITEMS = [
  { quote: '“The wind whispered through the empty corridors.”', device: 'Personification', why: 'A non-human thing is given a human action — whispering.' },
  { quote: '“His hands were blocks of ice.”', device: 'Metaphor', why: 'One thing is said to *be* another, with no “like” or “as”.' },
  { quote: '“She fought like a cornered animal.”', device: 'Simile', why: 'The comparison uses “like”, making it a simile rather than a metaphor.' },
  { quote: '“The silence roared in his ears.”', device: 'Oxymoron', why: 'Two contradictory ideas — silence and roaring — are placed together.' },
  { quote: '“Slowly, softly, secretly the snow settled.”', device: 'Sibilance', why: 'Repeated soft s sounds create a hushed effect.' },
  { quote: '“I have told you a thousand times.”', device: 'Hyperbole', why: 'Deliberate exaggeration for emphasis, not meant literally.' },
  { quote: '“The crown refused to comment.”', device: 'Metonymy', why: 'A closely associated object stands in for the institution itself.' },
  { quote: '“Water, water, everywhere, / Nor any drop to drink.”', device: 'Repetition', why: 'The immediate repeat of a word intensifies the sense of surrounding water.' },
]

const literaryDevice: Generator = {
  id: 'eng.device',
  difficulty: 2,
  make: (rng) => {
    const item = rng.pick(DEVICE_ITEMS)
    const others = DEVICE_ITEMS.filter((entry) => entry.device !== item.device).map(
      (entry) => entry.device,
    )
    const { choices, answerIndex } = buildChoices(rng, item.device, rng.sample(others, 3))
    return {
      prompt: `Which technique is used here?\n\n${item.quote}`,
      choices,
      answerIndex,
      explanation: `${item.device}. ${item.why}`,
      skill: 'identifying literary techniques',
    }
  },
}

export const ENGLISH: Subject = {
  id: 'english',
  name: 'English',
  tagline: 'Language, literature and writing craft',
  topics: [
    {
      id: 'essay',
      name: 'Essay Structure & Argument',
      summary: 'Building a controlled argument with evidence and analysis.',
      bands: ['lower', 'upper', 'tertiary'],
      concepts: [
        {
          id: 'thesis',
          term: 'Thesis statement',
          definition: 'A single sentence stating the argument the whole essay will prove.',
          detail:
            'It must be arguable — a statement no one could disagree with is a summary, not a thesis.',
          example: '“Macbeth is destroyed less by the witches than by his own reading of them.”',
          misconception: 'A thesis is a description of what the essay will talk about.',
        },
        {
          id: 'topicsentence',
          term: 'Topic sentence',
          definition: 'The opening sentence of a paragraph, naming the idea it will develop.',
          detail:
            'It should link back to the thesis, so a reader could follow the whole argument by reading only the topic sentences.',
          example: '“Shakespeare first presents ambition as external temptation.”',
        },
        {
          id: 'peel',
          term: 'Point–Evidence–Analysis',
          definition: 'A paragraph shape: make a claim, quote support, explain how it works.',
          detail:
            'Analysis is where marks are won — quoting without explaining the effect of the writer’s choices adds nothing.',
          example: 'Point on isolation, a short embedded quotation, then analysis of the verb choice.',
          misconception: 'Longer quotations earn more credit than short embedded ones.',
        },
        {
          id: 'embedding',
          term: 'Embedded quotation',
          definition: 'A short quotation woven into your own sentence.',
          detail:
            'Embedding keeps the sentence readable and lets you zoom in on one word rather than a whole line.',
          example: 'Lady Macbeth’s call to be “unsex[ed]” frames power as a loss of self.',
        },
        {
          id: 'counterargument',
          term: 'Counter-argument',
          definition: 'A fair statement of the opposing view, then a response to it.',
          detail:
            'Addressing the strongest opposing reading makes an argument more convincing, not weaker.',
          example: '“Although the witches appear to control events, their prophecies are ambiguous.”',
        },
        {
          id: 'conclusion',
          term: 'Conclusion',
          definition: 'A final paragraph that resolves the argument rather than restating it.',
          detail:
            'The strongest conclusions widen slightly — what the text says about its world — without introducing new evidence.',
          example: 'Ending on how the play frames ambition for a Jacobean audience.',
          misconception: 'A conclusion should introduce a final new piece of evidence.',
        },
      ],
    },
    {
      id: 'devices',
      name: 'Literary Devices',
      summary: 'Naming techniques and, more importantly, analysing their effect.',
      bands: ['middle', 'lower', 'upper'],
      generators: [literaryDevice],
      concepts: [
        {
          id: 'metaphor',
          term: 'Metaphor',
          definition: 'A direct comparison stating one thing is another.',
          detail:
            'Metaphor transfers a quality wholesale, which is why it feels more absolute than a simile.',
          example: '“Her voice was a blade.”',
          misconception: 'Any comparison counts as a metaphor.',
        },
        {
          id: 'simile',
          term: 'Simile',
          definition: 'A comparison using “like” or “as”.',
          detail:
            'The explicit comparison keeps a distance between the two things, softening the effect.',
          example: '“He moved like a man underwater.”',
        },
        {
          id: 'personification',
          term: 'Personification',
          definition: 'Giving human qualities to something non-human.',
          detail:
            'It makes settings feel active, which writers use to project a character’s emotional state.',
          example: '“The house watched them leave.”',
        },
        {
          id: 'pathetic',
          term: 'Pathetic fallacy',
          definition: 'Using weather or landscape to mirror mood.',
          detail:
            'It is a specific kind of personification limited to nature reflecting emotion.',
          example: 'A storm breaking as the argument peaks.',
          misconception: 'Pathetic fallacy and personification are interchangeable terms.',
        },
        {
          id: 'juxtaposition',
          term: 'Juxtaposition',
          definition: 'Placing two contrasting ideas or images side by side.',
          detail:
            'Contrast sharpens both halves, which is why writers use it at turning points.',
          example: 'A wedding described alongside a funeral procession.',
        },
        {
          id: 'symbolism',
          term: 'Symbolism',
          definition: 'An object standing for a larger idea.',
          detail:
            'A symbol usually recurs and shifts meaning across a text — a single mention is more often imagery.',
          example: 'The green light in The Great Gatsby.',
        },
      ],
    },
    {
      id: 'poetry',
      name: 'Poetry Analysis',
      summary: 'Form, structure, sound and meaning in poems.',
      bands: ['lower', 'upper', 'tertiary'],
      generators: [literaryDevice],
      concepts: [
        {
          id: 'enjambment',
          term: 'Enjambment',
          definition: 'A sentence running past the end of a line without punctuation.',
          detail:
            'It creates momentum and can make meaning shift as the eye turns the line — often used to mimic thought or breathlessness.',
          example: 'A line ending mid-phrase, pulling the reader on.',
          misconception: 'Every line break in free verse is enjambment.',
        },
        {
          id: 'caesura',
          term: 'Caesura',
          definition: 'A pause inside a line, usually marked by punctuation.',
          detail:
            'It breaks rhythm mid-line and often signals hesitation or a change of direction in thought.',
          example: '“Out, out — brief candle!”',
        },
        {
          id: 'metre',
          term: 'Iambic pentameter',
          definition: 'A line of five unstressed–stressed beats.',
          detail:
            'Its closeness to natural speech is why breaking the pattern is so noticeable and so meaningful.',
          example: '“Shall I compare thee to a summer’s day?”',
        },
        {
          id: 'sonnet',
          term: 'Sonnet form',
          definition: 'A fourteen-line poem with a set rhyme scheme and a turn.',
          detail:
            'The volta shifts argument or tone — after line 8 in a Petrarchan sonnet, often at the couplet in a Shakespearean one.',
          example: 'Shakespeare’s sonnets close with a rhyming couplet.',
        },
        {
          id: 'imagery',
          term: 'Imagery',
          definition: 'Language appealing to the senses to build a picture.',
          detail:
            'Strong analysis names which sense is engaged and why that choice suits the poem’s mood.',
          example: '“The yellow fog that rubs its back upon the window-panes.”',
        },
        {
          id: 'tone',
          term: 'Tone and voice',
          definition: 'The attitude of the speaker towards the subject.',
          detail:
            'The speaker is a construct, not the poet, so tone can be ironic or unreliable by design.',
          example: 'A wry, self-mocking voice in a war poem.',
          misconception: 'The speaker of a poem is always the poet.',
        },
      ],
    },
    {
      id: 'shakespeare',
      name: 'Shakespeare & Drama',
      summary: 'Dramatic technique, character and context on stage.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'soliloquy',
          term: 'Soliloquy',
          definition: 'A speech delivered alone on stage, revealing private thought.',
          detail:
            'Because no other character hears it, the audience is granted honesty they cannot get from dialogue.',
          example: '“Is this a dagger which I see before me…”',
          misconception: 'A soliloquy is any long speech by one character.',
        },
        {
          id: 'aside',
          term: 'Aside',
          definition: 'A brief remark heard by the audience but not by other characters.',
          detail:
            'It creates complicity with the audience and is a favourite device for villains.',
          example: 'Iago commenting on Othello mid-scene.',
        },
        {
          id: 'dramaticirony',
          term: 'Dramatic irony',
          definition: 'When the audience knows something a character does not.',
          detail:
            'Tension comes from anticipation rather than surprise, which is why tragedies often announce their endings early.',
          example: 'The audience knows Juliet is not dead.',
        },
        {
          id: 'tragichero',
          term: 'Tragic hero',
          definition: 'A high-status figure whose flaw drives their downfall.',
          detail:
            'The fall must feel self-caused for catharsis to work, which is why the flaw is established early.',
          example: 'Macbeth’s ambition.',
        },
        {
          id: 'context',
          term: 'Context',
          definition: 'The historical and social ideas shaping how a play was written and received.',
          detail:
            'Context earns marks when it explains an interpretation, not when it is bolted on as a fact.',
          example: 'Jacobean beliefs about kingship deepen Macbeth’s regicide.',
          misconception: 'Context marks are awarded for listing historical facts.',
        },
        {
          id: 'staging',
          term: 'Stagecraft',
          definition: 'Choices about performance: entrances, props, lighting and space.',
          detail:
            'A play is a script for performance, so noting how a moment would look on stage strengthens analysis.',
          example: 'Banquo’s ghost appearing in Macbeth’s seat.',
        },
      ],
    },
    {
      id: 'grammar',
      name: 'Grammar & Punctuation',
      summary: 'Sentence control, punctuation accuracy and clarity.',
      bands: ['middle', 'lower', 'upper'],
      generators: [punctuation],
      concepts: [
        {
          id: 'clause',
          term: 'Main and subordinate clauses',
          definition: 'A main clause stands alone; a subordinate clause depends on one.',
          detail:
            'Varying which comes first is the simplest way to control emphasis and rhythm in writing.',
          example: '“Although it was late, she kept writing.”',
        },
        {
          id: 'commasplice',
          term: 'Comma splice',
          definition: 'Two complete sentences joined incorrectly by a comma.',
          detail:
            'Fix it with a full stop, a semicolon, or a conjunction — a comma alone cannot hold two independent clauses.',
          example: '✗ “It was raining, we went home.”',
          misconception: 'A comma is enough to join two complete sentences.',
        },
        {
          id: 'semicolon',
          misconception:
            'A semicolon can be used to join a complete sentence to a fragment.',
          term: 'Semicolon',
          definition: 'A mark joining two closely related complete sentences.',
          detail:
            'Both sides must work alone as sentences, which is the quickest test of whether it is right.',
          example: '“The lights failed; nobody moved.”',
        },
        {
          id: 'apostrophe',
          misconception:
            'Plural nouns take an apostrophe before the s, as in “three apple’s”.',
          term: 'Apostrophes',
          definition: 'Marks showing omission or possession.',
          detail:
            'Singular takes ’s, plurals already ending in s take s’, and “its” never takes one when possessive.',
          example: '“The dogs’ owners” means more than one dog.',
        },
        {
          id: 'colon',
          term: 'Colon',
          definition: 'A mark introducing a list, explanation or quotation.',
          detail:
            'What comes before a colon should be a complete sentence; what follows explains or delivers it.',
          example: '“She had one rule: never explain.”',
        },
        {
          id: 'agreement',
          term: 'Subject–verb agreement',
          definition: 'The verb form must match the number of the subject.',
          detail:
            'Errors creep in when a phrase separates the two, so find the true subject before choosing the verb.',
          example: '“The box of files *is* missing.”',
        },
      ],
    },
    {
      id: 'rhetoric',
      name: 'Rhetoric & Persuasive Writing',
      summary: 'Persuasive technique, audience and tone.',
      bands: ['lower', 'upper'],
      concepts: [
        {
          id: 'ethos',
          term: 'Ethos',
          definition: 'Persuasion through the credibility of the speaker.',
          detail:
            'Establishing expertise or shared values early buys permission for the argument that follows.',
          example: '“As a nurse of twenty years, I have seen…”',
        },
        {
          id: 'pathos',
          term: 'Pathos',
          definition: 'Persuasion through emotion.',
          detail:
            'A single specific story usually moves an audience more than large statistics.',
          example: 'Describing one family affected by a policy.',
        },
        {
          id: 'logos',
          misconception:
            'Presenting statistics is persuasive on its own, with no need to explain what they show.',
          term: 'Logos',
          definition: 'Persuasion through logic and evidence.',
          detail:
            'Evidence persuades only when its relevance is spelled out — data alone rarely convinces.',
          example: 'Citing a study, then explaining what it implies.',
        },
        {
          id: 'tricolon',
          term: 'Rule of three',
          definition: 'Grouping ideas in threes for rhythm and memorability.',
          detail:
            'Three feels complete while two feels like a pair and four loses the beat.',
          example: '“Education, education, education.”',
        },
        {
          id: 'rhetoricalquestion',
          term: 'Rhetorical question',
          definition: 'A question asked for effect rather than an answer.',
          detail:
            'Used sparingly it draws the reader in; overused it reads as filler.',
          example: '“How much longer can we wait?”',
          misconception: 'The more rhetorical questions a speech has, the more persuasive it is.',
        },
        {
          id: 'audience',
          misconception:
            'A formal register is the strongest choice for every audience.',
          term: 'Audience and register',
          definition: 'Adapting vocabulary, tone and form to the intended reader.',
          detail:
            'Register choices — formality, pronouns, sentence length — are what examiners reward as “controlled”.',
          example: 'A letter to a council reads differently from a blog post.',
        },
      ],
    },
    {
      id: 'comprehension',
      name: 'Unseen Prose & Comprehension',
      summary: 'Reading unfamiliar texts quickly and answering precisely.',
      bands: ['middle', 'lower', 'upper'],
      concepts: [
        {
          id: 'inference',
          term: 'Inference',
          definition: 'A conclusion drawn from evidence rather than stated outright.',
          detail:
            'Strong inference is anchored to a specific word, not to a general impression of the passage.',
          example: 'Trembling hands implying fear without the word being used.',
          misconception: 'Inference means guessing what might happen next.',
        },
        {
          id: 'connotation',
          misconception:
            'Two words with the same dictionary meaning always have the same effect on a reader.',
          term: 'Connotation',
          definition: 'The associations a word carries beyond its literal meaning.',
          detail:
            'Choosing “thin” rather than “slender” shifts judgement while keeping the denotation.',
          example: '“Cheap” versus “affordable”.',
        },
        {
          id: 'structurereading',
          term: 'Structural analysis',
          definition: 'How a text is ordered: openings, shifts in focus, endings.',
          detail:
            'Structure questions ask where the reader’s attention is directed and why it moves.',
          example: 'A passage zooming from a landscape to one figure.',
        },
        {
          id: 'comparison',
          misconception:
            'A comparison answer should analyse one text fully before turning to the other.',
          term: 'Comparative reading',
          definition: 'Analysing two texts against each other on a shared idea.',
          detail:
            'Comparison must be integrated — alternating within paragraphs beats two separate essays.',
          example: 'Both writers present the sea, but one as threat and one as escape.',
        },
        {
          id: 'summarising',
          term: 'Summary skills',
          definition: 'Compressing a passage to its essential points in your own words.',
          detail:
            'A good summary keeps the writer’s emphasis, not just their facts.',
          example: 'Reducing three paragraphs to two accurate sentences.',
        },
        {
          id: 'evaluation',
          term: 'Evaluation',
          definition: 'Judging how successfully a writer achieves an effect.',
          detail:
            'Evaluation needs a stated criterion — successful *for whom*, and by what measure.',
          example: 'Arguing that a short final sentence lands the shock effectively.',
        },
      ],
    },
  ],
}
