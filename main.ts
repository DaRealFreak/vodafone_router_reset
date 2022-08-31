import {parse} from 'ts-command-line-args';

const {login, SessionData} = require("./login");

interface VodafoneResetArguments {
    username: string;
    password: string;
}

// args typed as ICopyFilesArguments
export const args = parse<VodafoneResetArguments>({
    username: {type: String, alias: 'u', description: 'user for the login'},
    password: {type: String, alias: 'p', description: 'password for the login'}
});


async function reset() {
    await login(args.username, args.password)

    console.log(SessionData)
}

reset().then(r => console.log("router should be reset"));