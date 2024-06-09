import type { OutgoingHttpHeaders } from 'node:http'
import type { FastifyServerOptions } from 'fastify'
import type { Level } from 'pino'

export type EncodingToken = 'br' | 'gzip' | 'deflate'
// biome-ignore lint/complexity/noBannedTypes: we want to omit any functions from the resulting type
export type TrustedProxy = Exclude<FastifyServerOptions['trustProxy'], Function>

type PartialUndef<T> = {
    [P in keyof T]?: T[P] | undefined
}

export interface UserOptions {
    assetCompression?: PartialUndef<AssetCompressionOptions> | undefined
    cache?: PartialUndef<CacheOptions> | undefined
    defaultHeaders?: PartialUndef<DefaultHeaderOptions> | undefined
    preCompressed?: boolean | undefined
    request?: PartialUndef<RequestOptions> | undefined
    server?: PartialUndef<ServerOptions> | undefined
    supportedEncodings?: EncodingToken[] | undefined
}

export interface RuntimeOptions extends EnvironmentConfig {
    cache?: PartialUndef<CacheOptions> | undefined
    defaultHeaders?: PartialUndef<DefaultHeaderOptions> | undefined
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
    request?: PartialUndef<RequestOptions> | undefined
    server?: PartialUndef<ServerOptions> | undefined
    socket?: string | undefined
}

interface ServerOptions {
    accessLogging: boolean
    connectionTimeout: number
    gracefulTimeout: number
    http2: boolean
    keepAliveTimeout: number
    logLevel: Level
    requestIdHeader: string
    trustProxy: TrustedProxy
}

interface RequestOptions {
    bodyLimit: number
    maxParamLength: number
    timeout: number
}

interface DefaultHeaderOptions {
    assets: OutgoingHttpHeaders
    server: OutgoingHttpHeaders
}

interface AssetCompressionOptions {
    compressibleFileExtensions: string[]
    threshold: number
}

interface CacheOptions {
    immutable: boolean
    maxAge: number
    mustRevalidate: boolean
    noTransform: boolean
    proxyRevalidate: boolean
    staleIfError: number
    staleWhileRevalidate: number
}
