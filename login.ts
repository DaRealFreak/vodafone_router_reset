import axios from "axios";

import {IvNotFoundError, SaltNotFoundError} from "./errors";
import {
    DEFAULT_SJCL_ITERATIONS,
    DEFAULT_SJCL_KEYSIZEBITS,
    DEFAULT_SJCL_TAGLENGTH,
    sjclCCMdecrypt,
    sjclCCMencrypt,
    sjclPbkdf2
} from "./vodafone/sjclCrypto";
import {client} from "./browser";
import {args} from "./main";

export const SessionData = {
    user: "",
    sessionId: "",
    iv: "",
    salt: "",
    key: "",
    nonce: "",
};

export async function login(username: string, password: string, retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries < retry) {
        return false
    }

    let loginPageHTML = await getLoginPage()
    SessionData.user = username
    SessionData.sessionId = getCurrentSessionId(loginPageHTML)
    SessionData.iv = getIvFromLogin(loginPageHTML)
    SessionData.salt = getSaltFromLogin(loginPageHTML)
    SessionData.key = sjclPbkdf2(password, SessionData.salt, DEFAULT_SJCL_ITERATIONS, DEFAULT_SJCL_KEYSIZEBITS);

    let jsData = '{"Password": "' + password + '", "Nonce": "' + SessionData.sessionId + '"}';
    let authData = "loginPassword";
    let encryptData = sjclCCMencrypt(SessionData.key, jsData, SessionData.iv, authData, DEFAULT_SJCL_TAGLENGTH);
    let loginData = {'EncryptData': encryptData, 'Name': "admin", 'AuthData': authData};

    let response = await client.post('http://vodafone.box/php/ajaxSet_Password.php', loginData, {
        withCredentials: true,
        headers: {
            Cookie: "PHPSESSID=" + SessionData.sessionId + ";"
        }
    });

    if (response.status != 200) {
        return login(username, password, retry + 1)
    }

    let loginResponse = response.data
    if (loginResponse.p_status != "Default") {
        console.log("unexpected status: " + loginResponse.p_status)
        return false
    }

    SessionData.nonce = sjclCCMdecrypt(SessionData.key, loginResponse.encryptData, SessionData.iv, "nonce", DEFAULT_SJCL_TAGLENGTH);

    return true
}

function getLoginPage() {
    return axios.get(`http://vodafone.box/`).then((home) => {
        return home.data
    })
}

function getSaltFromLogin(html: string): string {
    const regex = /var mySalt = '(\w{16})'/g;
    let salt = regex.exec(html)

    if (salt === null || salt.length !== 2) {
        throw SaltNotFoundError
    }

    return salt[1]
}

function getIvFromLogin(html: string): string {
    const regex = /var myIv = '(\w{16})'/g;
    let iv = regex.exec(html)

    if (iv === null || iv.length !== 2) {
        throw IvNotFoundError
    }

    return iv[1]
}

function getCurrentSessionId(html: string): string {
    const regex = /var currentSessionId = '(\w{32})'/g;
    let sessionId = regex.exec(html)

    if (sessionId === null || sessionId.length !== 2) {
        throw IvNotFoundError
    }

    return sessionId[1]
}
