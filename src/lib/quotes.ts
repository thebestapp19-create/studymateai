export type Quote = {
  text: string
  author: string
}

/** Real quotations from real people, one surfaced per day. */
export const QUOTES: Quote[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  {
    text: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
  },
  {
    text: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
  },
  {
    text: 'I have not failed. I have just found 10,000 ways that will not work.',
    author: 'Thomas Edison',
  },
  {
    text: 'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King',
  },
  {
    text: 'Perseverance is not a long race; it is many short races one after the other.',
    author: 'Walter Elliot',
  },
  {
    text: 'Nothing in life is to be feared, it is only to be understood.',
    author: 'Marie Curie',
  },
  {
    text: 'Develop a passion for learning. If you do, you will never cease to grow.',
    author: 'Anthony J. D’Angelo',
  },
  {
    text: 'You do not have to be great to start, but you have to start to be great.',
    author: 'Zig Ziglar',
  },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  {
    text: 'Continuous effort — not strength or intelligence — is the key to unlocking our potential.',
    author: 'Winston Churchill',
  },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  {
    text: 'Education is the passport to the future, for tomorrow belongs to those who prepare for it today.',
    author: 'Malcolm X',
  },
  {
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
  },
  { text: 'What I cannot create, I do not understand.', author: 'Richard Feynman' },
  {
    text: 'The only way to learn mathematics is to do mathematics.',
    author: 'Paul Halmos',
  },
  { text: 'Enthusiasm is common. Endurance is rare.', author: 'Angela Duckworth' },
  { text: 'Becoming is better than being.', author: 'Carol Dweck' },
  {
    text: 'Discipline is the bridge between goals and accomplishment.',
    author: 'Jim Rohn',
  },
  {
    text: 'The more that you read, the more things you will know. The more that you learn, the more places you’ll go.',
    author: 'Dr. Seuss',
  },
  {
    text: 'Do the hard jobs first. The easy jobs will take care of themselves.',
    author: 'Dale Carnegie',
  },
  { text: 'The best way out is always through.', author: 'Robert Frost' },
  {
    text: 'Concentrate all your thoughts upon the work in hand.',
    author: 'Alexander Graham Bell',
  },
  {
    text: 'Knowing is not enough; we must apply. Willing is not enough; we must do.',
    author: 'Johann Wolfgang von Goethe',
  },
  {
    text: 'Practice isn’t the thing you do once you’re good. It’s the thing you do that makes you good.',
    author: 'Malcolm Gladwell',
  },
  {
    text: 'You can’t cross the sea merely by standing and staring at the water.',
    author: 'Rabindranath Tagore',
  },
  {
    text: 'Genius is one percent inspiration and ninety-nine percent perspiration.',
    author: 'Thomas Edison',
  },
  {
    text: 'The roots of education are bitter, but the fruit is sweet.',
    author: 'Aristotle',
  },
  {
    text: 'Start where you are. Use what you have. Do what you can.',
    author: 'Arthur Ashe',
  },
  {
    text: 'The mind is not a vessel to be filled, but a fire to be kindled.',
    author: 'Plutarch',
  },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  {
    text: 'I have failed over and over and over again in my life, and that is why I succeed.',
    author: 'Michael Jordan',
  },
  {
    text: 'Study hard what interests you the most, in the most undisciplined, irreverent and original manner possible.',
    author: 'Richard Feynman',
  },
  {
    text: 'Change is the end result of all true learning.',
    author: 'Leo Buscaglia',
  },
]

/** Days elapsed since the Unix epoch in the viewer's own timezone. */
function dayIndex(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(local.getTime() / 86_400_000)
}

/** The same quote all day, a different one tomorrow. */
export function getDailyQuote(date: Date = new Date()): Quote {
  const index = ((dayIndex(date) % QUOTES.length) + QUOTES.length) % QUOTES.length
  return QUOTES[index]
}
