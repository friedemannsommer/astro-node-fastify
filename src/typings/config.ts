import type { OutgoingHttpHeaders } from 'node:http'
import type { FastifyServerOptions } from 'fastify'
import type { Level } from 'pino'

export type EncodingToken = 'br' | 'gzip' | 'deflate'
// biome-ignore lint/complexity/noBannedTypes: we want to omit any functions from the resulting type
export type TrustedProxy = Exclude<FastifyServerOptions['trustProxy'], Function>

/**
 * @internal
 */
type PartialUndef<T> = {
    [P in keyof T]?: T[P] | undefined
}

export interface UserOptions {
    /**
     * Controls which files are processed for asset pre-compression.
     */
    assetCompression?: PartialUndef<AssetCompressionOptions> | undefined
    /**
     * Can be used to define the "[Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)"
     * header for "[public](https://docs.astro.build/en/basics/project-structure/#public)" assets.
     */
    cache?: PartialUndef<CacheOptions> | undefined
    /**
     * Can be used to set headers that should always be sent in their respective use-case (Asset, SSR).
     */
    defaultHeaders?: PartialUndef<DefaultHeaderOptions> | undefined
    /**
     * Controls whether the static assets should be pre-compressed or if they should be dynamically compressed at runtime.
     *
     * @default true
     */
    preCompressed?: boolean | undefined
    /**
     * Can be defined to control which requests the server should handle.
     */
    request?: PartialUndef<RequestOptions> | undefined
    /**
     * Can be defined to configure the server.
     */
    server?: PartialUndef<ServerOptions> | undefined
    /**
     * Controls which compression algorithms are available.
     *
     * @default ['br', 'gzip', 'deflate']
     */
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

/**
 * Can be used to configure the server ([Fastify](https://fastify.dev/)).
 *
 * Note that the HTTPS are only read at runtime via environment variables.
 * The HTTPS key can be set via the `SERVER_KEY_PATH` variable,
 * and the certificate can be set via the `SERVER_CERT_PATH` variable.
 *
 * The server tries to read the `HOST` and `PORT` environment variables to configure the listen target.
 * If the environment variable `SERVER_SOCKET` is set, it will take precedence over `HOST` and `PORT`.
 * In the case, none of the above (`HOST`, `PORT`, `SERVER_SOCKET`) variables are present
 * it will use the Astro [server options](https://docs.astro.build/en/reference/configuration-reference/#server-options).
 */
interface ServerOptions {
    /**
     * Enables or disables request logging.
     *
     * Environment variable: `SERVER_ACCESS_LOGGING`
     * Environment value: "1" (`true`), "0" (`false`)
     *
     * @default true
     */
    accessLogging: boolean
    /**
     * Defines the server timeout in milliseconds.
     * See the Node.js documentation for more details: https://nodejs.org/api/http.html#http_server_timeout
     *
     * Environment variable: `SERVER_CONNECTION_TIMEOUT`
     * Environment value: <integer>
     *
     * @default 0
     */
    connectionTimeout: number
    /**
     * The time in milliseconds to wait for the server to gracefully close before forcefully shutting down.
     *
     * Environment variable: `SERVER_GRACEFUL_TIMEOUT`
     * Environment value: <integer>
     *
     * @default 5000
     */
    gracefulTimeout: number
    /**
     * If `true` an HTTP/2 server will be created instead of the HTTP/1.1 one.
     *
     * Environment variable: `SERVER_HTTP2`
     * Environment value: "1" (`true`), "0" (`false`)
     *
     * @default false
     */
    http2: boolean
    /**
     * Defines the server keep-alive timeout in milliseconds.
     * See the Node.js documentation for more details: https://nodejs.org/api/http.html#http_server_keepalivetimeout
     *
     * Environment variable: `SERVER_KEEP_ALIVE_TIMEOUT`
     * Environment value: <integer>
     *
     * @default 72000
     */
    keepAliveTimeout: number
    /**
     * Defines the log level the server should use. Note that this only affects the server, not Astro itself.
     *
     * Environment variable: `SERVER_LOG_LEVEL`
     * Environment value: {@link Level}
     *
     * @default info
     */
    logLevel: Level
    /**
     * The header name that should be used to set the request ID.
     * Fore more details see Fastify's documentation: https://fastify.dev/docs/latest/Reference/Logging/#logging-request-id
     *
     * Environment variable: `SERVER_REQUEST_ID_HEADER`
     * Environment value: <string>
     *
     * @default "request-id"
     */
    requestIdHeader: false | string
    /**
     * Lets the server know that it's behind a proxy and should trust the "X-Forwarded-*" headers.
     * For more details see Fastify's documentation: https://fastify.dev/docs/latest/Reference/Server/#trustproxy
     *
     * Environment variable: `SERVER_TRUST_PROXY`
     * Environment value: "1" (`true`), "0" (`false`), <string>
     */
    trustProxy: TrustedProxy
}

/**
 * Can be used to control which requests the server should handle.
 */
interface RequestOptions {
    /**
     * Defines the maximum payload (in bytes), the server is allowed to accept.
     *
     * Environment variable: `REQUEST_BODY_LIMIT`
     * Environment value: <integer>
     *
     * @default 1048576
     */
    bodyLimit: number
    /**
     * Defines the maximum number of milliseconds for receiving the entire request from the client.
     * See the Node.js documentation for more details: https://nodejs.org/dist/latest/docs/api/http.html#http_server_requesttimeout
     *
     * Environment variable: `REQUEST_TIMEOUT`
     * Environment value: <integer>
     *
     * @default 0
     */
    timeout: number
}

/**
 * Can be used to set headers that should always be sent in their respective use-case (Asset, SSR).
 */
interface DefaultHeaderOptions {
    /**
     * These headers will be added to every asset response.
     */
    assets: OutgoingHttpHeaders
    /**
     * These headers will be added to every SSR response.
     */
    server: OutgoingHttpHeaders
}

/**
 * Controls which files are processed for asset pre-compression.
 * Note that the compression version will only be used if it's smaller than the source.
 */
interface AssetCompressionOptions {
    /**
     * Lists every file extension that should be processed for asset pre-compression.
     *
     * @default ['.css', '.js', '.html', '.xml', '.cjs', '.mjs', '.svg', '.txt', '.json']
     */
    fileExtensions: string[]
    /**
     * The minimum file size for asset pre-compression to take place.
     *
     * @default 1024
     */
    threshold: number
}

/**
 * Can be used to define the "[Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)"
 * header for "[public](https://docs.astro.build/en/basics/project-structure/#public)" assets.
 *
 * If these options are absent and no "Cache-Control" header is defined in the {@link DefaultHeaderOptions#assets},
 * the cache control header for the "public" assets will be: `Cache-Control: public, max-age=0`.
 */
interface CacheOptions {
    /**
     * Controls the "immutable" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#immutable
     */
    immutable: boolean
    /**
     * Controls the "max-age" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#max-age
     */
    maxAge: number
    /**
     * Controls the "must-revalidate" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#must-revalidate
     */
    mustRevalidate: boolean
    /**
     * Controls the "no-transform" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#no-transform
     */
    noTransform: boolean
    /**
     * Controls the "proxy-revalidate" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#proxy-revalidate
     */
    proxyRevalidate: boolean
    /**
     * Controls the "stale-if-error" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error
     */
    staleIfError: number
    /**
     * Controls the "stale-while-revalidate" directive.
     * Documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-while-revalidate
     */
    staleWhileRevalidate: number
}
