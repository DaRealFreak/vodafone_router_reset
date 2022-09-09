import { SessionData } from './login'
import { args } from './main'
import { page } from './browser'

/**
 * checks if the overview page can be loaded after being logged in
 *
 * @param retry
 */
export async function overview (retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries <= retry) {
        return false
    }

    const output: string = await page.evaluate((csrfNonce) => {
        return fetch('http://vodafone.box/php/overview_data.php', {
            method: 'GET',
            headers: {
                csrfNonce: csrfNonce
            }
        }).then(res => res.text())
            .catch(err => err.toString())
    }, SessionData.nonce)

    // the value is only displayed when we successfully logged in, so we can rely on it being in the response
    if (output.includes('js_isCmOperational')) {
        return true
    } else {
        console.log(`failed to retrieve the overview (try: ${retry + 1}), retrying`)
        return await overview(retry + 1)
    }
}
