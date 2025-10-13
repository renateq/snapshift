import { Page } from '@playwright/test'

export async function waitForLog(page: Page, text: string, timeout = 15000) {
  await page.waitForEvent('console', {
    timeout,
    predicate: (msg) => msg.text().includes(text),
  })
}
