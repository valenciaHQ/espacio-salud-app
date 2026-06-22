import { chromium } from 'playwright'

process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
})

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

page.on('console', msg => {
  if (msg.type() === 'error') console.log('[err]', msg.text().slice(0, 120))
})

// 1. Login page
console.log('\n--- Screenshot 1: Login page ---')
await page.goto('http://localhost:5173/login')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: '/tmp/01-login.png', fullPage: true })
console.log('Guardado: /tmp/01-login.png')

// 2. Settings page (preview route, sin auth)
console.log('\n--- Screenshot 2: Settings con Google Calendar card ---')
await page.goto('http://localhost:5173/preview-settings')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/02-settings.png', fullPage: true })
console.log('Guardado: /tmp/02-settings.png')

// 3. Scroll down to see the Google Calendar card
const body = await page.locator('body').innerText()
console.log('Contenido visible (extracto):', body.slice(0, 500))

// 4. Check specifically for the calendar card
const hasCalendarCard = body.includes('Google Calendar')
const hasWarning = body.includes('VITE_GOOGLE_CLIENT_ID')
console.log('Tiene card "Google Calendar":', hasCalendarCard)
console.log('Muestra aviso de configuración:', hasWarning)

// 5. Scroll to bottom and screenshot
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(500)
await page.screenshot({ path: '/tmp/03-settings-bottom.png', fullPage: false })
console.log('Guardado: /tmp/03-settings-bottom.png (viewport al final)')

await browser.close()
console.log('\nDone.')
