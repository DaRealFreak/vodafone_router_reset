import {parse} from 'ts-command-line-args';
import {browser, initialize_browser} from "./browser";
import {restart} from "./restart";
import {login} from "./login";

interface VodafoneResetArguments {
    username: string;
    password: string;
    maxRetries: number;
}

export const args = parse<VodafoneResetArguments>({
    username: {type: String, alias: 'u', description: 'user for the login'},
    password: {type: String, alias: 'p', description: 'password for the login'},
    maxRetries: {type: Number, alias: 'r', description: 'max amount of retries for each request', defaultValue: 5}
});


/**
 * logs in using the parsed arguments "user" and "password" before trying to restart the router
 */
async function reset(): Promise<boolean> {
    await initialize_browser()

    let loginStatus = login(args.username, args.password).then(
        (status: boolean) => {
            if (!status) {
                console.log("unable to login")
                return false
            }

            console.log("successfully logged in")
            return true
        }
    )

    // check login status
    let loginSuccess = await loginStatus
    if (!loginSuccess) {
        return loginSuccess
    }

    let restartStatus = restart().then(
        (status: boolean) => {
            if (!status) {
                console.log("unable to restart the router")
                return false
            }

            console.log("successfully restarted the router")
            return true
        }
    )

    // check restart status
    return await restartStatus
}

reset().then((success: boolean) => {
    if (success) {
        console.log("router should be reset")
    } else {
        console.log("an error occurred")
    }

    browser.close().then(() => []);
});