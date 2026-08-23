# StudyMate AI

A study companion that answers one question: *how ready am I for this exam, and
what should I do next?*

React + TypeScript + Vite + Tailwind CSS. No backend, no account — everything
lives in the browser.

## Development

```bash
npm install
npm run dev
```

`npm run build` type-checks and bundles; `npm run lint` runs oxlint.

`npm run build:preview` additionally writes `dist/studymate-preview.html` — the
whole app inlined into one file, for opening straight from disk or hosting
anywhere static.

## How it fits together

```
src/lib/curriculum/   subjects → topics → concepts, plus parametric question generators
src/lib/content/      turns concepts + generators into questions and flashcards
src/lib/engine/       mastery, readiness, the planner and the insight lines
src/lib/store/        reducer + localStorage persistence
src/screens/          welcome, home, exams, exam detail, sessions, progress, profile
```

### Content

There is no model call at runtime. Questions are **synthesised**, not stored: each
concept carries a definition, a deeper explanation, an example and a common
misconception, and the content engine turns those into several different question
forms (define, identify, complete, example, apply, true-pairing, spot-the-false)
with distractors drawn from neighbouring concepts. Quantitative topics add
parametric generators that produce fresh numbers, a worked explanation and
error-shaped distractors on every call.

Level matters throughout: the grade band selects which topics and concepts are in
play, shifts the mix of question forms, decides whether distractors come from the
same topic (harder) or across the subject (easier), and controls how much depth an
explanation carries.

### The learner model

Every answer and every flashcard rating updates a per-topic stat: an exponentially
weighted accuracy, an evidence weight, and spaced-repetition state per card.
Mastery combines those, discounted when the evidence is thin, and decays slowly
when a topic goes untouched.

Readiness for an exam is the average topic contribution plus a small, capped bonus
for study consistency — and it is fully explainable: the app can say which topics
carry it, which drag it down, and what a given session is worth, because
`estimateGain` re-runs the same readiness function against a simulated improvement.

The planner ranks every topic by exam urgency × knowledge gap × staleness, picks a
mode per topic (level check, flashcards, practice, review) and sizes each item to
the learner's daily goal.

## Data

Stored under `studymate.state.v1` in `localStorage`. Resetting from the profile
screen clears it.
