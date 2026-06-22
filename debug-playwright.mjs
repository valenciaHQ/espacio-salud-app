import { chromium } from 'playwright'

process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
})

// Mobile viewport (iPhone 14)
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
mobile.on('console', msg => { if (msg.type() === 'error') console.log('[err]', msg.text().slice(0, 80)) })

await mobile.goto('http://localhost:5174/preview-cal')
await mobile.waitForLoadState('networkidle')
await mobile.waitForTimeout(1500)
await mobile.screenshot({ path: '/tmp/mobile-calendar.png', fullPage: false })
console.log('mobile-calendar.png: calendario en mobile')

// Get computed font sizes of key elements
const fontSizes = await mobile.evaluate(() => {
  const title = document.querySelector('.fc-toolbar-title')
  const btn = document.querySelector('.fc-button')
  const colHeader = document.querySelector('.fc-col-header-cell-cushion')
  const timeSlot = document.querySelector('.fc-timegrid-slot-label-cushion')
  const getFS = (el) => el ? getComputedStyle(el).fontSize : 'n/a'
  return {
    title: getFS(title),
    button: getFS(btn),
    colHeader: getFS(colHeader),
    timeSlot: getFS(timeSlot),
  }
})
console.log('Font sizes on mobile:', fontSizes)

await browser.close()
console.log('Done.')
