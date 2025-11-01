import { test, expect, Page } from '@playwright/test'
import { waitForLog } from './utils'
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
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

test('downloading all images', async ({ page, context }) => {
  const messages: string[] = []
  page.on('console', (msg) => {
    messages.push(msg.text())
  })

  let phonePage: Page

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

  await test.step('display images', async () => {
    const gallery = page.locator('#gallery')

    // check file types
    for (const mime of MIMEs) {
      if (!messages.includes(`[DEV] new file: ${mime}`)) {
        await waitForLog(page, `[DEV] new file: ${mime}`)
      }
    }

    // Check that gallery has the correct number of children
    const children = gallery.locator(':scope > *')
    await expect(children).toHaveCount(MIMEs.length, { timeout: 5000 })

    // Check that each child contains an image
    for (let i = 0; i < MIMEs.length; i++) {
      const img = children.nth(i).locator('img')
      await expect(img).toHaveCount(1) // Each child must have exactly one img
    }
  })

  await test.step('download all images', async () => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#download-all-btn'),
    ])

    // Save the downloaded file to a temp path
    const downloadPath = await download.path()
    const tempPath = path.join(process.cwd(), 'downloaded.zip')
    await download.saveAs(tempPath)

    // Verify file exists
    expect(fs.existsSync(tempPath)).toBeTruthy()

    // Extract and inspect ZIP contents
    const zip = new AdmZip(tempPath)
    const zipEntries = zip.getEntries()

    // Verify there are correct number of images inside
    expect(zipEntries.length).toBe(MIMEs.length)

    // Cleanup
    fs.unlinkSync(tempPath)
  })
})
