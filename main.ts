import {parse} from 'ts-command-line-args';
import {diagnostic} from "./diagnostic";
import {overview} from "./overview";

const {login} = require("./login");

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


async function reset(): Promise<boolean> {
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

    let overviewStatus = overview().then(
        (status: boolean) => {
            if (!status) {
                console.log("unable to retrieve the overview")
                return false
            }

            console.log("successfully retrieved the overview")
            return true
        }
    )

    return await overviewStatus

    let restartStatus = diagnostic(1000, 10, "192.168.0.1").then(
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
});