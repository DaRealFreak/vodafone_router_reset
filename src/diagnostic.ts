import { SessionData } from './login'
import { args } from './index'
import { page } from './browser'

export interface DiagnosticData {
    Ping: {
        DiagnosticsState: string
        Host: string
        NumberOfRepetitions: string
        Timeout: string
        DataBlockSize: string
        SuccessCount: string
        FailureCount: string
        AverageResponseTimeDetailed: string
        MinimumResponseTimeDetailed: string
        MaximumResponseTimeDetailed: string
    }
    Route: {
        DiagnosticsState: string
        Host: string
        MaxHopCount: string
        NumberOfEntries: string
        BlockSize: string
    }
    Dns: {
        DiagnosticsState: string
        HostName: string
        DNSServer: string
    }
}

/**
 * checks the diagnostic data for the pinged target
 *
 * @param pingInterval
 * @param pingNumber
 * @param pingTarget
 * @param retry
 */
export async function diagnostic (pingInterval: number, pingNumber: number, pingTarget: string, retry: number = 0): Promise<boolean> {
    // exceeded retries
    if (args.maxRetries !== -1 && args.maxRetries <= retry) {
        return false
    }

    const diagnosticData = {
        Type: 'PingStart',
        Data: {
            Status: 'Requested',
            Target: pingTarget,
            PingNum: pingNumber.toString(),
            PingInterval: pingInterval.toString(),
            PingSize: '64',
            PingType: 1
        }
    }

    const output: string = await page.evaluate((diagnosticData, csrfNonce) => {
        return fetch('http://vodafone.box/php/ajaxSet_status_diagnostic_utility_data.php', {
            method: 'POST',
            body: JSON.stringify(diagnosticData),
            headers: {
                csrfNonce: csrfNonce
            }
        }).then(res => res.text())
            .catch(err => err.toString())
    }, diagnosticData, SessionData.nonce)

    if (output.includes('SUCCESS')) {
        let results = await diagnosticResults()
        while (results.Ping.DiagnosticsState !== 'Complete') {
            console.log('state incomplete, sleeping 1000ms before checking again')
            await delay(1000)
            results = await diagnosticResults()
        }
        console.log(results)
        return true
    } else {
        console.log(`failed to start the diagnostic data (try: ${retry + 1}), retrying`)
        return await diagnostic(pingInterval, pingNumber, pingTarget, retry + 1)
    }
}

async function diagnosticResults (): Promise<DiagnosticData> {
    const output: string = await page.evaluate((csrfNonce) => {
        return fetch('http://vodafone.box/php/status_diagnostic_utility_data.php?{%22Ping%22:{},%22Route%22:{},%22Dns%22:{}}', {
            method: 'GET',
            headers: {
                csrfNonce: csrfNonce
            }
        }).then(res => res.text())
            .catch(err => err.toString())
    }, SessionData.nonce)

    return await new Promise<DiagnosticData>((resolve, reject) => {
        try {
            const data: DiagnosticData = JSON.parse(output)
            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}

function delay (ms: number): Promise<{}> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
