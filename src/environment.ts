import type { Level } from 'pino'
import type { EnvironmentConfig } from './typings/config.js'

const logLevels: Level[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

export function getEnvironmentConfig(): EnvironmentConfig {
    const host = process.env.HOST?.trim()
    const port = tryParseInt(process.env.PORT)
    const config: EnvironmentConfig = {
        https: getHttpsConfig(),
        request: getRequestConfig(),
        server: getServerConfig(),
        socket: process.env.SERVER_SOCKET?.trim()
    }

    if (host) {
        config.host = host
    }

    if (port !== undefined) {
        config.port = port
    }

    return config
}

function getHttpsConfig(): EnvironmentConfig['https'] {
    const keyPath = process.env.SERVER_KEY_PATH
    const certPath = process.env.SERVER_CERT_PATH

    if (keyPath && certPath) {
        return {
            key: keyPath,
            cert: certPath
        }
    }

    return undefined
}

function getServerConfig(): EnvironmentConfig['server'] {
    const accessLogging = process.env.SERVER_ACCESS_LOGGING?.trim() === '1'
    const connectionTimeout = tryParseInt(process.env.SERVER_CONNECTION_TIMEOUT)
    const gracefulTimeout = tryParseInt(process.env.SERVER_GRACEFUL_TIMEOUT)
    const http2 = process.env.SERVER_HTTP2?.trim() === '1'
    const keepAliveTimeout = tryParseInt(process.env.SERVER_KEEP_ALIVE_TIMEOUT)
    const logLevel = parseLogLevel(process.env.SERVER_LOG_LEVEL?.trim())
    const requestIdHeader = process.env.SERVER_REQUEST_ID_HEADER
    const trustProxy = process.env.SERVER_TRUST_PROXY?.trim()

    return {
        accessLogging,
        connectionTimeout,
        gracefulTimeout,
        http2,
        keepAliveTimeout,
        logLevel,
        requestIdHeader: requestIdHeader?.trim(),
        trustProxy: trustProxy === '1' ? true : trustProxy === '0' ? false : trustProxy
    }
}

function getRequestConfig(): EnvironmentConfig['request'] {
    const bodyLimit = tryParseInt(process.env.REQUEST_BODY_LIMIT)
    const timeout = tryParseInt(process.env.REQUEST_TIMEOUT)

    if (bodyLimit || timeout) {
        return {
            bodyLimit,
            timeout
        }
    }

    return undefined
}

function parseLogLevel(value: string | undefined): Level | undefined {
    if (!value) {
        return undefined
    }

    const logLevel = value.toLowerCase() as Level

    return logLevels.includes(logLevel) ? logLevel : undefined
}

function tryParseInt(value: string | undefined): number | undefined {
    if (typeof value !== 'string') {
        return undefined
    }

    const parsed = Number.parseInt(value as string)

    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed
    }

    return undefined
}