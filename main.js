const login = require('./login')
const errors = require('./errors')

const args = require('minimist')(process.argv.slice(2));

// check for user and password being passed
if ("string" !== typeof args.u) {
    throw errors.NoUserError
}

if ("string" !== typeof args.p) {
    throw errors.NoPasswordError
}

async function reset() {
    await login.login(args.u, args.p)

    console.log(login.SessionData)
}

reset().then(r => console.log("router should be reset"));