import { chromium } from 'playwright'

process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
})

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('console', msg => { if (msg.type() === 'error') console.log('[err]', msg.text().slice(0, 80)) })

await page.goto('http://localhost:5174/preview-settings')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/05-with-client-id.png', fullPage: true })

const text = await page.locator('body').innerText()
console.log('Body:', text.slice(0, 600))

await browser.close()
console.log('Done: /tmp/05-with-client-id.png')
