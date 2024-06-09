import type { EnvironmentConfig, RuntimeArguments, RuntimeOptions } from './typings/config.js'
import { getEnvironmentConfig } from './environment.js'
import fastify, {
    type FastifyInstance,
    type FastifyListenOptions,
    type FastifyReply,
    type FastifyRequest
} from 'fastify'
import fastifyCompress from '@fastify/compress'
import fastifyStatic, { type SetHeadersResponse } from '@fastify/static'
import { readFile } from 'node:fs/promises'
import { NodeApp } from 'astro/app/node'
import type { OutgoingHttpHeaders } from 'node:http'
import type { HookHandlerDoneFunction } from 'fastify/types/hooks.js'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import { Readable } from 'node:stream'
import { join as pathJoin } from 'node:path'

export async function createServer(app: NodeApp, options: RuntimeArguments): Promise<FastifyInstance> {
    const config = getServerConfig(options)
    const listenConfig: FastifyListenOptions = {
        listenTextResolver(address: string): string {
            return `server listening on: ${address}`
        }
    }
    const appHandler = createAppHandler(app)
    const server = fastify({
        bodyLimit: config.request?.bodyLimit,
        connectionTimeout: config.server?.connectionTimeout,
        disableRequestLogging: config.server?.accessLogging === false,
        // @ts-expect-error - the underlying type doesn't explicitly allow `http2: undefined`
        http2: config.server?.http2 === true ? true : undefined,
        https: config.https
            ? {
                  allowHTTP1: true,
                  cert: await readFile(config.https.cert),
                  key: await readFile(config.https.key)
              }
            : undefined,
        keepAliveTimeout: config.server?.keepAliveTimeout,
        logger: {
            level: options.server?.logLevel ?? 'info'
        },
        maxParamLength: config.request?.maxParamLength,
        requestIdHeader: config.server?.requestIdHeader,
        requestTimeout: config.request?.timeout,
        trustProxy: config.server?.trustProxy,
        useSemicolonDelimiter: false
    })

    await server.register(fastifyCompress, {
        encodings: options.supportedEncodings,
        requestEncodings: options.supportedEncodings
    })

    await server.register(fastifyStatic, {
        preCompressed: options.preCompressed,
        root: options.clientPath,
        setHeaders: setAssetHeaders(
            pathJoin(options.clientPath, options.assets),
            options.defaultHeaders?.assets,
            options.cache
        ),
        wildcard: false
    })

    server.all(
        '/*',
        {
            // @ts-expect-error - the underlying type doesn't explicitly allow `preHandler: undefined`
            preHandler: options.defaultHeaders?.server ? setDefaultHeaders(options.defaultHeaders.server) : undefined
        },
        appHandler
    )

    if (options.socket) {
        listenConfig.path = options.socket
    } else {
        listenConfig.host = options.host
        listenConfig.port = options.port
    }

    await server.ready()
    await server.listen(listenConfig)

    return server as unknown as FastifyInstance
}

function getServerConfig(options: RuntimeArguments): EnvironmentConfig {
    return {
        ...options,
        ...getEnvironmentConfig()
    }
}

function setAssetHeaders(
    staticPrefix: string,
    headers?: OutgoingHttpHeaders,
    cache?: RuntimeOptions['cache']
): (res: SetHeadersResponse) => void {
    const headerKeys: string[] | undefined = headers ? Object.keys(headers) : undefined
    const dynamicAssetCacheControl = createCacheControlHeader(cache)

    return (res: SetHeadersResponse): void => {
        if (res.filename.startsWith(staticPrefix)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
        } else if (dynamicAssetCacheControl !== undefined) {
            res.setHeader('Cache-Control', dynamicAssetCacheControl)
        }

        if (headerKeys) {
            for (const header of headerKeys) {
                // biome-ignore lint/style/noNonNullAssertion: if `headerKeys` is defined `headers` is as well
                res.setHeader(header, headers![header])
            }
        }
    }
}

function setDefaultHeaders(
    headers: OutgoingHttpHeaders
): (_req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => void {
    return (_req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction): void => {
        reply.headers(headers)
        done()
    }
}

function createAppHandler(app: NodeApp): (req: FastifyRequest, reply: FastifyReply) => Promise<void> {
    return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
        const routeData = app.match(req.raw)

        if (routeData) {
            const response = await app.render(req.raw, {
                clientAddress: req.ip,
                routeData,
                locals: {
                    reqId: req.id
                }
            })

            for (const cookie of NodeApp.getSetCookieFromResponse(response)) {
                reply.header('Set-Cookie', cookie)
            }

            reply.headers(Object.fromEntries(response.headers.entries()))
            reply.code(response.status)

            return reply.send(response.body ? Readable.fromWeb(response.body as WebReadableStream) : undefined)
        }

        return reply.code(404).send()
    }
}

function createCacheControlHeader(cache?: RuntimeOptions['cache']): string | undefined {
    if (!cache) {
        return undefined
    }

    const headerValues = ['public']

    if (cache.maxAge !== undefined) {
        headerValues.push(`max-age=${cache.maxAge}`)
    }

    if (cache.staleIfError !== undefined) {
        headerValues.push(`stale-if-error=${cache.staleIfError}`)
    }

    if (cache.staleWhileRevalidate !== undefined) {
        headerValues.push(`stale-while-revalidate=${cache.staleWhileRevalidate}`)
    }

    if (cache.immutable) {
        headerValues.push('immutable')
    }

    if (cache.mustRevalidate) {
        headerValues.push('must-revalidate')
    }

    if (cache.noTransform) {
        headerValues.push('no-transform')
    }

    if (cache.proxyRevalidate) {
        headerValues.push('proxy-revalidate')
    }

    return headerValues.length > 1 ? headerValues.join(',') : undefined
}
