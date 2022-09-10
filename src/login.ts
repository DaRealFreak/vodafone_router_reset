import { page } from './browser'
import { args } from './index'

export const SessionData = {
    user: '',
    iv: '',
    key: '',
    nonce: '',
    arNonce: ''
}

/**
 * logs the user in the backend overview
 *
 * @param username
 * @param password
 * @param retry
 */
export async function login (username: string, password: string, retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries <= retry) {
        return false
    }

    try {
        await page.goto('http://vodafone.box', { waitUntil: 'domcontentloaded' })
        await page.evaluate((username, password) => {
            console.log(login(username, password))
        }, username, password)
        // reloading the overview page is needed to get all the session storage items, especially the nonce
        await page.goto('http://vodafone.box/?overview', { waitUntil: 'domcontentloaded' })
    } catch (err) {
        if (err instanceof Error) {
            console.log(`failed to login (try: ${retry + 1}), retrying (err: ${err.message})`)
        }
        return await login(username, password, retry + 1)
    }

    const localStorageData: {} = await page.evaluate(() => {
        /* eslint-disable */
        let json = {}
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i)
            // @ts-ignore
            json[key] = sessionStorage.getItem(key)
        }
        return json
    })

    // @ts-ignore
    SessionData.user = localStorageData.user
    // @ts-ignore
    SessionData.iv = localStorageData.sjcl_iv
    // @ts-ignore
    SessionData.key = localStorageData.sjcl_key
    // @ts-ignore
    SessionData.nonce = localStorageData.csrf_nonce
    // @ts-ignore
    SessionData.arNonce = localStorageData.ar_nonce

    if (SessionData.nonce === undefined) {
        console.log(`failed to login (try: ${retry + 1}), retrying`)
        return await login(username, password, retry + 1)
    }

    return true
}
