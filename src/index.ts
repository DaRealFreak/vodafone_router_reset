import { parse } from 'ts-command-line-args'
import { browser, initializeBrowser } from './browser'
import { restart } from './restart'
import { login } from './login'

interface VodafoneResetArguments {
    username: string
    password: string
    maxRetries: number
}

export const args = parse<VodafoneResetArguments>({
    username: { type: String, alias: 'u', description: 'user for the login' },
    password: { type: String, alias: 'p', description: 'password for the login' },
    maxRetries: { type: Number, alias: 'r', description: 'max amount of retries for each request', defaultValue: 5 }
})

/**
 * logs in using the parsed arguments "user" and "password" before trying to restart the router
 */
async function reset (): Promise<boolean> {
    await initializeBrowser()

    const loginStatus = login(args.username, args.password).then(
        (status: boolean) => {
            if (!status) {
                console.log('unable to login')
                return false
            }

            console.log('successfully logged in')
            return true
        }
    )

    // check login status
    const loginSuccess = await loginStatus
    if (!loginSuccess) {
        return loginSuccess
    }

    const restartStatus = restart().then(
        (status: boolean) => {
            if (!status) {
                console.log('unable to restart the router')
                return false
            }

            console.log('successfully restarted the router')
            return true
        }
    )

    // check restart status
    return await restartStatus
}

reset()
    .then((success: boolean) => {
        if (success) {
            console.log('router should be reset')
        } else {
            console.log('an error occurred')
        }

        browser.close()
            .then(() => [])
            .catch(() => console.log('unable to close browser'))
    })
    .catch(
        () => console.log('unexpected error occurred')
    )
