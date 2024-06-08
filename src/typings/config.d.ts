import type { OutgoingHttpHeaders } from 'node:http'
import type { FastifyServerOptions } from 'fastify'
import type { Level } from 'pino'

export type EncodingToken = 'br' | 'gzip' | 'deflate'
// biome-ignore lint/complexity/noBannedTypes: we want to omit any functions from the resulting type
export type TrustedProxy = Exclude<FastifyServerOptions['trustProxy'], Function>

export interface UserOptions {
    defaultHeaders?: {
        assets?: OutgoingHttpHeaders
        server?: OutgoingHttpHeaders
    }
    preCompressed?: boolean
    server?: {
        accessLogging?: boolean
        connectionTimeout?: number
        http2?: boolean
        keepAliveTimeout?: number
        logLevel?: Level
        requestIdHeader?: string
        trustProxy?: TrustedProxy
    }
    request?: {
        bodyLimit?: number
        maxParamLength?: number
        timeout?: number
    }
    supportedEncodings?: EncodingToken[]
}

export interface RuntimeOptions extends EnvironmentConfig {
    defaultHeaders?: UserOptions['defaultHeaders']
    preCompressed: boolean
    supportedEncodings: EncodingToken[]
}

export interface RuntimeArguments extends Omit<RuntimeOptions, 'https'> {
    clientPath: string
    serverPath: string
    host: string
    port: number
    assets: string
}

export interface EnvironmentConfig {
    host?: string | undefined
    https?:
        | {
              key: string
              cert: string
          }
        | undefined
    port?: number | undefined
    request?:
        | {
              bodyLimit?: number | undefined
              maxParamLength?: number | undefined
              timeout?: number | undefined
          }
        | undefined
    server?:
        | {
              accessLogging?: boolean | undefined
              connectionTimeout?: number | undefined
              http2?: boolean | undefined
              keepAliveTimeout?: number | undefined
              logLevel?: Level | undefined
              requestIdHeader?: string | undefined
              trustProxy?: TrustedProxy | undefined
          }
        | undefined
    socket?: string | undefined
}
