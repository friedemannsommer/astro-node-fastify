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
    const accessLogging = tryParseBool(process.env.SERVER_ACCESS_LOGGING?.trim())
    const connectionTimeout = tryParseInt(process.env.SERVER_CONNECTION_TIMEOUT)
    const gracefulTimeout = tryParseInt(process.env.SERVER_GRACEFUL_TIMEOUT)
    const http2 = tryParseBool(process.env.SERVER_HTTP2?.trim())
    const keepAliveTimeout = tryParseInt(process.env.SERVER_KEEP_ALIVE_TIMEOUT)
    const logLevel = parseLogLevel(process.env.SERVER_LOG_LEVEL?.trim())
    const requestIdHeader = process.env.SERVER_REQUEST_ID_HEADER?.trim()
    const trustProxy = process.env.SERVER_TRUST_PROXY?.trim()

    return createConfig({
        accessLogging,
        connectionTimeout,
        gracefulTimeout,
        http2,
        keepAliveTimeout,
        logLevel,
        requestIdHeader: requestIdHeader?.trim(),
        trustProxy: tryParseBool(trustProxy) ?? trustProxy
    })
}

function getRequestConfig(): EnvironmentConfig['request'] {
    return createConfig({
        bodyLimit: tryParseInt(process.env.REQUEST_BODY_LIMIT),
        timeout: tryParseInt(process.env.REQUEST_TIMEOUT)
    })
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

function tryParseBool(value: string | undefined): boolean | undefined {
    if (typeof value !== 'string') {
        return undefined
    }

    return value === '1'
}

function createConfig<T extends Record<string, unknown>>(base: T): T | undefined {
    const config: Record<string, unknown> = {}
    let valueDefined = false

    for (const [key, value] of Object.entries(base)) {
        if (value !== undefined && value !== null) {
            config[key] = value
            valueDefined = true
        }
    }

    return valueDefined ? (config as T) : undefined
}
