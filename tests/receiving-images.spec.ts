import { test, expect, Page } from '@playwright/test'
import { waitForLog } from './utils'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIMEs = [
  'image/png',
  'image/svg+xml',
  'image/jpeg',
  'image/webp',
  // 'image/heif', // both .heic & .heif use MIME type image/heif
  // 'image/heif',
  'image/gif',
]

test('receiving images', async ({ page, context }) => {
  let phonePage: Page
  const messages: string[] = []

  const pngImageFilePath = path.resolve(__dirname, 'assets/test-image.png')
  const svgImageFilePath = path.resolve(__dirname, 'assets/test-image.svg')
  const jpgImageFilePath = path.resolve(__dirname, 'assets/test-image.jpg')
  const webpImageFilePath = path.resolve(__dirname, 'assets/test-image.webp')
  // const heicImageFilePath = path.resolve(__dirname, 'assets/test-image.heic')
  // const heifImageFilePath = path.resolve(__dirname, 'assets/test-image.heif')
  const gifImageFilePath = path.resolve(__dirname, 'assets/test-image.gif')

  await test.step('open phone page', async () => {
    await page.goto('http://localhost:3000/')
    await expect(page.locator('#qr-code')).toBeVisible({ timeout: 15000 })
    const newPage = await Promise.all([
      context.waitForEvent('page'),
      page.click('#qr-code'),
    ])
    phonePage = newPage[0]
    phonePage.on('console', (msg) => {
      messages.push(msg.text())
    })

    await phonePage.waitForLoadState()

    expect(phonePage.url()).toContain('/phone?id=')

    await expect(phonePage.locator('#upload-btn')).toBeVisible({
      timeout: 15000,
    })
  })

  await test.step('upload images', async () => {
    await phonePage.click('#upload-btn')

    const fileInput = phonePage.locator('input[type="file"]')

    await fileInput.setInputFiles([
      pngImageFilePath,
      svgImageFilePath,
      jpgImageFilePath,
      webpImageFilePath,
      // heicImageFilePath,
      // heifImageFilePath,
      gifImageFilePath,
    ])
  })

  await test.step('receive images', async () => {
    await page.waitForTimeout(20000)
    expect(messages.filter((msg) => msg == '[DEV] received').length).toBe(
      MIMEs.length,
    )
  })
})
