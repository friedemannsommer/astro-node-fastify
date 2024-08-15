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
                    serverPath: getServerPath(optionsOverride?.serverPath ?? options.serverPath)
                })
            ).server
        }
    }
}

export function start(manifest: SSRManifest, options: RuntimeArguments): void {
    if (process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART === '0') {
        return
    }

    // mutate in-place since there should be no need for a copy
    options.serverPath = getServerPath(options.serverPath)

    createServer(new NodeApp(manifest), options).then(setupExitHandlers, (err: Error): void => {
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

function getServerPath(path: string): string {
    if (path.length !== 0) {
        // assume that the given path is valid
        return path
    }

    const callerFile = getCallerFile()

    if (callerFile !== undefined) {
        return dirname(callerFile)
    }

    /**
     * Important note: this only works if this package is included in the entrypoint.
     * Otherwise, we're unable to resolve an absolute path to the client assets.
     */
    return dirname(fileURLToPath(import.meta.url))
}

function getCallerFile(): string | undefined {
    const originalFunc = Error.prepareStackTrace

    try {
        const err = new Error()
        let callerFile: string | undefined

        Error.prepareStackTrace = (_err, stack) => stack

        const stack = err.stack as unknown as NodeJS.CallSite[]

        if (!stack) {
            return undefined
        }

        // biome-ignore lint/style/noNonNullAssertion: there must be at least one entry in the stack trace
        const currentFile = normalizePath(stack[0]!.getFileName())

        for (let index = 1; index < stack.length; index++) {
            // biome-ignore lint/style/noNonNullAssertion: the loop condition guarantees that the index exists
            callerFile = normalizePath(stack[index]!.getFileName())

            if (callerFile !== undefined && callerFile !== currentFile) {
                return callerFile
            }
        }
    } catch (_) {
        /* no-op */
    } finally {
        Error.prepareStackTrace = originalFunc
    }

    return undefined
}

function normalizePath(path: string | undefined): string | undefined {
    if (!path) {
        return undefined
    }

    if (path.startsWith('file://')) {
        return path.slice(7)
    }

    return path
}
