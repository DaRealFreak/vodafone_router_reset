import { SessionData } from './login'
import { args } from './index'
import { page } from './browser'

/**
 * restarts the router
 *
 * @param retry
 */
export async function restart (retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries !== -1 && args.maxRetries <= retry) {
        return false
    }

    const restartData = {
        RestartReset: 'Restart'
    }

    const output = await page.evaluate((restartData, csrfNonce) => {
        return fetch('http://vodafone.box/php/ajaxSet_status_restart.php', {
            method: 'POST',
            body: JSON.stringify(restartData),
            headers: {
                csrfNonce: csrfNonce
            }
        })
    }, restartData, SessionData.nonce)
        .catch(err => err.toString())

    if (typeof output === 'string') {
        console.log(`failed to restart (try: ${retry + 1}), (err: ${output})`)
        return await restart(retry + 1)
    }

    if (output instanceof Response) {
        if (output.status !== 200) {
            console.log(`failed to restart (try: ${retry + 1})`)
            return await restart(retry + 1)
        }
    }

    return true
}
