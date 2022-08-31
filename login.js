const errors = require('./errors')
const axios = require("axios");
const sjclCrypto = require("./vodafone/sjclCrypto");

const SessionData = {
    sessionId: "",
    iv: "",
    salt: "",
    key: "",
};

async function login(username, password) {
    let loginPageHTML = await getLoginPage()
    SessionData.sessionId = getCurrentSessionId(loginPageHTML)
    SessionData.iv = getIvFromLogin(loginPageHTML)
    SessionData.salt = getSaltFromLogin(loginPageHTML)
    SessionData.key = sjclCrypto.sjclPbkdf2(password, SessionData.salt, sjclCrypto.DEFAULT_SJCL_ITERATIONS, sjclCrypto.DEFAULT_SJCL_KEYSIZEBITS);

    let jsData = '{"Password": "' + password + '", "Nonce": "' + SessionData.sessionId + '"}';
    let authData = "loginPassword";
    let encryptData = sjclCrypto.sjclCCMencrypt(SessionData.key, jsData, SessionData.iv, authData, sjclCrypto.DEFAULT_SJCL_TAGLENGTH);
    let loginData = {'EncryptData': encryptData, 'Name': "admin", 'AuthData': authData};
}

function getLoginPage() {
    return axios.get(`http://vodafone.box/`).then((home) => {
        return home.data
    })
}

function getSaltFromLogin(html) {
    const regex = /var mySalt = '(\w{16})'/g;
    let salt = regex.exec(html)

    if (salt.length !== 2) {
        throw errors.SaltNotFoundError
    }

    return salt[1]
}

function getIvFromLogin(html) {
    const regex = /var myIv = '(\w{16})'/g;
    let iv = regex.exec(html)

    if (iv.length !== 2) {
        throw errors.IvNotFoundError
    }

    return iv[1]
}

function getCurrentSessionId(html) {
    const regex = /var currentSessionId = '(\w{32})'/g;
    let sessionId = regex.exec(html)

    if (sessionId.length !== 2) {
        throw errors.IvNotFoundError
    }

    return sessionId[1]
}

module.exports.SessionData = SessionData;
module.exports.login = login;
