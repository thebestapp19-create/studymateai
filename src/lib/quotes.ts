export type Quote = {
  text: string
  author: string
}

/** Real quotes from real people, one surfaced per day. */
export const QUOTES: Quote[] = [
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    text: 'It always seems impossible until it is done.',
    author: 'Nelson Mandela',
  },
  {
    text: 'The expert in anything was once a beginner.',
    author: 'Helen Hayes',
  },
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
  {
    text: 'Learning never exhausts the mind.',
    author: 'Leonardo da Vinci',
  },
  {
    text: 'Continuous effort — not strength or intelligence — is the key to unlocking our potential.',
    author: 'Winston Churchill',
  },
  {
    text: 'Believe you can and you are halfway there.',
    author: 'Theodore Roosevelt',
  },
]

/** Days elapsed since the Unix epoch in the viewer's own timezone. */
function dayIndex(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(local.getTime() / 86_400_000)
}

/** The same quote for the whole day, a different one tomorrow. */
export function getDailyQuote(date: Date = new Date()): Quote {
  const index = ((dayIndex(date) % QUOTES.length) + QUOTES.length) % QUOTES.length
  return QUOTES[index]
}
