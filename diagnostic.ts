import {client} from "./browser";
import {SessionData} from "./login";
import {args} from "./main";
import {AxiosError} from "axios";

export async function diagnostic(pingInterval: number, pingNumber: number, pingTarget: string, retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries <= retry) {
        return false
    }

    let diagnosticData = {
        Type: "PingStart",
        Data: {
            Status: "Requested",
            Target: pingTarget,
            PingNum: pingNumber.toString(),
            PingInterval: pingInterval.toString(),
            PingSize: "64",
            PingType: 1
        }
    }

    let response
    try {
        response = await client.post('http://vodafone.box/php/ajaxSet_status_diagnostic_utility_data.php', diagnosticData, {
            withCredentials: true,
            headers: {
                Cookie: SessionData.cookie,
                csrfNonce: SessionData.nonce
            }
        });
    } catch (err) {
        console.log("failed to start diagnostic (try: " + (retry + 1) + "), retrying")
        if (err instanceof AxiosError) {
            console.log("code: " + err.code)
            if (err.response !== undefined) {
                console.log("status code: " + err.response.status)
            }
        }
        return diagnostic(pingInterval, pingNumber, pingTarget, retry + 1)
    }

    if (response.status != 200) {
        console.log("failed to start diagnostic (try: " + (retry + 1) + ")")
        return false
    }

    return true
}