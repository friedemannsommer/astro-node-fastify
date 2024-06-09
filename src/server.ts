import type { EnvironmentConfig, RuntimeArguments } from './typings/config.js'
import { getEnvironmentConfig } from './environment.js'
import fastify, {
    type FastifyInstance,
    type FastifyListenOptions,
    type FastifyReply,
    type FastifyRequest
} from 'fastify'
import fastifyCompress from '@fastify/compress'
import fastifyStatic, { type FastifyStaticOptions, type SetHeadersResponse } from '@fastify/static'
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
    const baseStaticConfig: Partial<FastifyStaticOptions> = {
        maxAge: 900000,
        preCompressed: options.preCompressed,
        setHeaders: setAssetHeaders(pathJoin(options.clientPath, options.assets), options.defaultHeaders?.assets),
        wildcard: false
    }

    await server.register(fastifyCompress, {
        encodings: options.supportedEncodings,
        requestEncodings: options.supportedEncodings
    })

    await server.register(fastifyStatic, {
        ...baseStaticConfig,
        root: options.clientPath
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

function setAssetHeaders(staticPrefix: string, headers?: OutgoingHttpHeaders): (res: SetHeadersResponse) => void {
    const headerKeys: string[] | undefined = headers ? Object.keys(headers) : undefined

    return (res: SetHeadersResponse): void => {
        if (res.filename.startsWith(staticPrefix)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
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
