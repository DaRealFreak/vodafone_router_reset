import axios from 'axios';

const tough = require('tough-cookie');
const Cookie = tough.Cookie;
export const cookiejar = new tough.CookieJar();

axios.interceptors.request.use(function (config) {
    cookiejar.getCookies(config.url, function (err: any, cookies: any[]) {
        if (config.headers !== undefined) {
            config.headers.cookie = cookies.join('; ');
        }
    });
    return config;
});

axios.interceptors.response.use(function (response) {
    if (response.headers['set-cookie'] instanceof Array) {
        response.headers['set-cookie'].forEach(function (c) {
            cookiejar.setCookie(Cookie.parse(c), response.config.url, function () {});
        });
    }
    return response;
});