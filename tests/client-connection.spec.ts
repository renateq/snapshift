import { test, expect, Page } from '@playwright/test'
import { waitForLog } from './utils'

test('client connection lifecycle', async ({ page, context }) => {
  const messages: string[] = []
  page.on('console', (msg) => {
    messages.push(msg.text())
  })

  let phonePage: Page

  await test.step('register', async () => {
    await page.goto('http://localhost:3000/')

    await expect(page.locator('#qr-code')).toBeVisible({ timeout: 15000 })

    if (!messages.includes('[DEV] registered')) {
      await waitForLog(page, '[DEV] registered')
    }

    expect(messages).toContain('[DEV] registered')
  })

  await test.step('open phone page', async () => {
    const newPage = await Promise.all([
      context.waitForEvent('page'),
      page.click('#qr-code'),
    ])
    phonePage = newPage[0]

    await phonePage.waitForLoadState()

    expect(phonePage.url()).toContain('/phone?id=')

    if (!messages.includes('[DEV] connected')) {
      await waitForLog(page, '[DEV] connected')
    }

    expect(messages).toContain('[DEV] connected')
  })

  await test.step('close phone page', async () => {
    await phonePage.close()

    if (!messages.includes('[DEV] disconnected')) {
      await waitForLog(page, '[DEV] disconnected')
    }

    expect(messages).toContain('[DEV] disconnected')
  })
})
