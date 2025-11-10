import { test, expect, Page } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('exiting', async ({ page, context }) => {
  let phonePage: Page

  const pngImageFilePath = path.resolve(__dirname, 'assets/test-image.png')
  await page.goto('http://localhost:3000/')

  await test.step('button is disabled', async () => {
    const btn = page.locator('nav button:has(> h1)')
    await expect(btn).toBeDisabled()
  })

  await test.step('open phone page', async () => {
    const qrCode = page.locator('#qr-code')
    await expect(qrCode).toBeVisible({ timeout: 15000 })

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      qrCode.click(),
    ])
    phonePage = newPage

    await phonePage.waitForLoadState('domcontentloaded')

    await expect(phonePage).toHaveURL(/\/phone\?id=/)

    await expect(phonePage.locator('#upload-btn')).toBeVisible({
      timeout: 15000,
    })
  })

  await test.step('upload images', async () => {
    const uploadBtn = phonePage.locator('#upload-btn')
    await expect(uploadBtn).toBeEnabled()
    await uploadBtn.click()

    const fileInput = phonePage.locator('input[type="file"]')
    await fileInput.setInputFiles([pngImageFilePath])

    const gallery = page.locator('#gallery')
    const children = gallery.locator(':scope > *')
    await expect(children).toHaveCount(1, { timeout: 5000 })
  })

  await test.step('exit (cancel)', async () => {
    const btn = page.locator('nav button:has(> h1)')
    await expect(btn).toBeEnabled()
    await btn.click()

    const exitModal = page.locator('#exit-modal')
    await expect(exitModal).toBeVisible()

    const cancelBtn = exitModal.locator('#exit-btn-no')
    await cancelBtn.click()

    await expect(exitModal).not.toBeVisible()
  })

  await test.step('exit (confirm)', async () => {
    const btn = page.locator('nav button:has(> h1)')
    await expect(btn).toBeEnabled()
    await btn.click()

    const exitModal = page.locator('#exit-modal')
    await expect(exitModal).toBeVisible()

    const confirmBtn = exitModal.locator('#exit-btn-yes')
    await confirmBtn.click()

    await expect(page.locator('#gallery')).not.toBeVisible()
  })
})
