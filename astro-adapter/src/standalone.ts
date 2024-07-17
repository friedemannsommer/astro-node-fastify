import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SSRManifest } from 'astro'
import { NodeApp } from 'astro/app/node'
import type { FastifyInstance } from 'fastify'
import { type ServiceRuntime, createServer } from './server.js'
import type { RuntimeArguments } from './typings/config.js'

export interface SupportedExports {
    options: RuntimeArguments
    startServer: (options?: Partial<RuntimeArguments>) => Promise<FastifyInstance>
}

export function createExports(manifest: SSRManifest, options: RuntimeArguments): SupportedExports {
    return {
        options,
        async startServer(optionsOverride?: Partial<RuntimeArguments>): Promise<FastifyInstance> {
            return (
                await createServer(new NodeApp(manifest), {
                    ...options,
                    ...optionsOverride,
                    cache: {
                        ...options.cache,
                        ...optionsOverride?.cache
                    },
                    defaultHeaders: {
                        ...options.defaultHeaders,
                        ...optionsOverride?.defaultHeaders
                    },
                    request: {
                        ...options.request,
                        ...optionsOverride?.request
                    },
                    server: {
                        ...options.server,
                        ...optionsOverride?.server
                    },
                    serverPath: getServerPath()
                })
            ).server
        }
    }
}

export function start(manifest: SSRManifest, options: RuntimeArguments): void {
    if (process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART === '0') {
        return
    }

    const app = new NodeApp(manifest)

    // mutate in-place since there should be no need for a copy
    options.serverPath = getServerPath()

    createServer(app, options).then(setupExitHandlers, (err: Error): void => {
        console.error(err)
        process.exit(1)
    })
}

function setupExitHandlers({ config, server }: ServiceRuntime): void {
    const gracefulTimeout = config.server?.gracefulTimeout ?? 5_000
    let shutdownTimer: NodeJS.Timeout | undefined
    let shutdownRef: Promise<void> | undefined

    function handleSignal(signal: string): void {
        server.log.info({ signal }, 'received shutdown signal.')
        gracefulShutdown()
    }

    function gracefulShutdown(): void {
        if (shutdownRef) {
            return
        }

        shutdownTimer = setTimeout((): void => {
            server.log.error({ timeout: gracefulTimeout }, 'failed to shutdown server within grace period.')
            process.exit(1)
        }, gracefulTimeout)

        shutdownRef = server.close()
        shutdownRef.then(
            (): void => {
                clearTimeout(shutdownTimer)
                process.exit(0)
            },
            (error: Error): void => {
                clearTimeout(shutdownTimer)
                server.log.error({ error }, 'received exception while trying to shutdown the server.')
                process.exit(1)
            }
        )
    }

    for (const eventName of ['SIGINT', 'SIGTERM']) {
        process.once(eventName, handleSignal)
    }
}

/**
 * Important note: this only works if this package is included in the entrypoint.
 * Otherwise, we're unable to resolve an absolute path to the client assets.
 */
function getServerPath(): string {
    return dirname(fileURLToPath(import.meta.url))
}
