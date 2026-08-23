/**
 * Bundles the production build into a single self-contained HTML page.
 *
 * Used for the shareable preview: one file, no external requests except the
 * Google Fonts stylesheet, so it can be opened from disk or hosted anywhere.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const ASSETS = join(DIST, 'assets')
const OUT = join(DIST, 'studymate-preview.html')

const files = readdirSync(ASSETS)
const cssFile = files.find((name) => name.endsWith('.css'))
const jsFile = files.find((name) => name.endsWith('.js'))

if (!cssFile || !jsFile) {
  throw new Error('Run `npm run build` first — no built assets found in dist/assets.')
}

const css = readFileSync(join(ASSETS, cssFile), 'utf8')
// A literal </script> inside the bundle would close the tag early.
const js = readFileSync(join(ASSETS, jsFile), 'utf8').replaceAll('</script>', '<\\/script>')

const html = `<title>StudyMate AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`

writeFileSync(OUT, html)
console.log(`wrote ${OUT} (${(html.length / 1024).toFixed(0)} kB)`)
