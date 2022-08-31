import {client} from "./browser";
import {SessionData} from "./login";
import {args} from "./main";


export async function restart(retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries <= retry) {
        return false
    }

    let restartData = {
        RestartReset: "Restart"
    }

    let response
    try {
        response = await client.post('http://vodafone.box/php/ajaxSet_status_restart.php', restartData, {
            withCredentials: true,
            headers: {
                Cookie: SessionData.cookie,
                csrfNonce: SessionData.nonce
            }
        });
    } catch (err) {
        console.log("failed to restart (try: " + (retry + 1) + "), retrying")
        return restart(retry + 1)
    }

    if (response.status != 200) {
        console.log("failed to restart (try: " + (retry + 1) + ")")
        return false
    }

    return true
}