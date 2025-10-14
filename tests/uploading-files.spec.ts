import { test, expect, Page } from '@playwright/test'
import { waitForLog } from './utils'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('uploading images', async ({ page, context }) => {
  let phonePage: Page
  const messages: string[] = []
  const imageFilePath = path.resolve(__dirname, 'assets/test-image.png')

  await test.step('open phone page', async () => {
    await page.goto('http://localhost:3000/')
    await expect(page.locator('#qr-code')).toBeVisible({ timeout: 15000 })
    const newPage = await Promise.all([
      context.waitForEvent('page'),
      page.click('#qr-code'),
    ])
    phonePage = newPage[0]

    await phonePage.waitForLoadState()

    expect(phonePage.url()).toContain('/phone?id=')

    phonePage.on('console', (msg) => {
      messages.push(msg.text())
    })
    await expect(phonePage.locator('#upload-btn')).toBeVisible({
      timeout: 15000,
    })
  })

  await test.step('upload an image', async () => {
    await phonePage.click('#upload-btn')

    const fileInput = phonePage.locator('input[type="file"]')

    await fileInput.setInputFiles([imageFilePath])

    if (!messages.includes('[DEV] sending 1 image(s)')) {
      await waitForLog(phonePage, '[DEV] sending 1 image(s)')
    }
  })

  await test.step('upload 10 images', async () => {
    await phonePage.click('#upload-btn')

    const fileInput = phonePage.locator('input[type="file"]')

    await fileInput.setInputFiles(Array(10).fill(imageFilePath))

    if (!messages.includes('[DEV] sending 10 image(s)')) {
      await waitForLog(phonePage, '[DEV] sending 10 image(s)')
    }
  })
})
