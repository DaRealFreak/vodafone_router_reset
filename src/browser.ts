import puppeteer, { Browser, Page } from 'puppeteer'

export let browser: Browser
export let page: Page

/**
 * initializes the browser
 */
export async function initializeBrowser (): Promise<void> {
    browser = await puppeteer.launch()
    page = await browser.newPage()
    // set 1 hour default timeout
    page.setDefaultTimeout(1000 * 60 * 60)
    page.on('console', msg => console.log('puppeteer log:', msg.text()))
}
