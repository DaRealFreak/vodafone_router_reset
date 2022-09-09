import puppeteer, {Browser, Page} from "puppeteer";

export let browser: Browser;
export let page: Page;

/**
 * initializes the browser
 */
export async function initialize_browser() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    page.on('console', msg => console.log('puppeteer log:', msg.text()));
}