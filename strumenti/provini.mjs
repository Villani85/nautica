import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const P = process.env.PORTA_COLLAUDO || 5194
const pv = spawn('npx', ['vite', 'preview', '--port', P], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const b = await chromium.launch({ channel: 'chrome', headless: false })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${P}/`, { waitUntil: 'load' })
await pg.waitForTimeout(2500)
const H = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight)
for (const f of (process.env.QUOTE || '0 0.12 0.24 0.36').split(/\s+/).map(Number)) {
  await pg.evaluate((y) => scrollTo(0, y), Math.round(H * f))
  await pg.waitForTimeout(1800)
  writeFileSync(`${process.env.FUORI}/provino-${f}.png`, await pg.screenshot())
}
console.log('provini scritti')
await b.close(); pv.kill(); process.exit(0)
