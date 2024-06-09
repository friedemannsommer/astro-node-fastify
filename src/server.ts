import type { EnvironmentConfig, RuntimeArguments } from './typings/config.js'
import { getEnvironmentConfig } from './environment.js'
import fastify, {
    type FastifyInstance,
    type FastifyListenOptions,
    type FastifyReply,
    type FastifyRequest
} from 'fastify'
import fastifyCompress from '@fastify/compress'
import fastifyStatic from '@fastify/static'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { NodeApp } from 'astro/app/node'

export async function createServer(app: NodeApp, options: RuntimeArguments): Promise<void> {
    const config = getServerConfig(options)
    const listenConfig: FastifyListenOptions = {}
    const appHandler = createAppHandler(app)
    const server = fastify({
        bodyLimit: config.request?.bodyLimit,
        connectionTimeout: config.server?.connectionTimeout,
        disableRequestLogging: config.server?.accessLogging === false,
        // @ts-expect-error
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
        encodings: options.supportedEncodings
    })

    await server.register(fastifyStatic, {
        immutable: true,
        maxAge: 31_536_000_000,
        preCompressed: true,
        prefix: options.assets,
        root: resolve(options.clientPath, options.assets),
        wildcard: false
    })

    await server.register(fastifyStatic, {
        preCompressed: true,
        root: options.clientPath,
        wildcard: false
    })

    server.all('/*', appHandler as unknown as Parameters<(typeof server)['all']>[1])

    if (options.socket) {
        listenConfig.path = options.socket
    } else {
        listenConfig.host = options.host
        listenConfig.port = options.port
    }

    server.log.info('server listening on %s', await server.listen(listenConfig))

    setupExitHandlers(server as unknown as FastifyInstance)
}

function getServerConfig(options: RuntimeArguments): EnvironmentConfig {
    return {
        ...options,
        ...getEnvironmentConfig()
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
            reply.status(response.status)
            reply.send(response.body)
        } else {
            reply.status(404).send()
        }
    }
}

function setupExitHandlers(server: FastifyInstance): void {
    function handleSignal(): void {
        server.close().catch((err: Error): void => {
            server.log.error(err)
        })
    }

    for (const eventName of ['exit', 'SIGINT', 'SIGTERM']) {
        process.once(eventName, handleSignal)
    }
}
