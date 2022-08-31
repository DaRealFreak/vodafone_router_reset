import {parse} from 'ts-command-line-args';
import {diagnostic} from "./diagnostic";

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
    let success = await loginStatus
    if (!success) {
        return success
    }

    let diagnosticStatus = await diagnostic(100, 10, "192.168.0.1").catch((err: any) => console.log(err))
    if (diagnosticStatus === null || !diagnosticStatus) {
        return false
    }

    return true
}

reset().then((success: boolean) => {
    if (success) {
        console.log("router should be reset")
    } else {
        console.log("an error occurred")
    }
});