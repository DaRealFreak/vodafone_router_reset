import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
// @ts-ignore
import {CookieJar} from 'tough-cookie';

declare module 'axios' {
    interface AxiosRequestConfig {
        jar?: CookieJar;
    }
}

export const jar = new CookieJar();
export const client = wrapper(axios.create({jar}));
