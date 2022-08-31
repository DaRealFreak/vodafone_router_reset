import axios from "axios";
import "./vodafone/sjclCrypto";
import {IvNotFoundError, SaltNotFoundError} from "./errors";
import {sjclCCMencrypt, sjclPbkdf2} from "./vodafone/sjclCrypto";

export const SessionData = {
    sessionId: "",
    iv: "",
    salt: "",
    key: "",
};
1
export async function login(username: string, password: string) {
    let loginPageHTML = await getLoginPage()
    SessionData.sessionId = getCurrentSessionId(loginPageHTML)
    SessionData.iv = getIvFromLogin(loginPageHTML)
    SessionData.salt = getSaltFromLogin(loginPageHTML)
    SessionData.key = sjclPbkdf2(password, SessionData.salt, 1000, 128);

    let jsData = '{"Password": "' + password + '", "Nonce": "' + SessionData.sessionId + '"}';
    let authData = "loginPassword";
    let encryptData = sjclCCMencrypt(SessionData.key, jsData, SessionData.iv, authData, 128);
    let loginData = {'EncryptData': encryptData, 'Name': "admin", 'AuthData': authData};

    axios.post('http://vodafone.box/php/ajaxSet_Password.php', loginData)
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
    // ?_n=85226
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
