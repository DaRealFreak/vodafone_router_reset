import {SessionData} from "./login";
import {args} from "./main";
import axios, {AxiosError} from "axios";

export async function overview(retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries <= retry) {
        return false
    }

    let response
    try {
        response = await axios.get('http://vodafone.box/php/overview_data.php', {
            withCredentials: true,
            headers: {
                csrfNonce: SessionData.nonce
            }
        });
    } catch (err) {
        console.log("failed to retrieve overview (try: " + (retry + 1) + "), retrying")
        if (err instanceof AxiosError) {
            console.log("code: " + err.code)
            if (err.response !== undefined) {
                console.log("status code: " + err.response.status)
            }
        }
        return overview(retry + 1)
    }

    if (response.status != 200) {
        console.log("failed to retrieve overview (try: " + (retry + 1) + ")")
        return false
    }

    // csrf nonce is apparently not correct yet as seen from the overview
    // (should contain javascript code as well instead of just empty lines)
    console.log(response.data)

    return true
}