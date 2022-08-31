import {client} from "./browser";
import {SessionData} from "./login";


export async function diagnostic(pingInterval: number, pingNumber: number, pingTarget: string): Promise<boolean> {
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

    let response = await client.post('http://vodafone.box/php/ajaxSet_status_diagnostic_utility_data.php', diagnosticData, {
        withCredentials: true,
        headers: {
            Cookie: "PHPSESSID=" + SessionData.sessionId + ";",
            csrfNonce: SessionData.nonce
        }
    });

    if (response.status != 200) {
        console.log("failed")
        return false
    }

    console.log("success")
    return true
}