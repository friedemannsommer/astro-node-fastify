import { NodeApp } from 'astro/app/node'
import type { SSRManifest } from 'astro'
import { createServer } from './server.js'
import type { RuntimeArguments } from './typings/config.js'
import type { FastifyInstance } from 'fastify'

export interface SupportedExports {
    options: RuntimeArguments
    startServer: (options?: Partial<RuntimeArguments>) => Promise<FastifyInstance>
}

export function createExports(manifest: SSRManifest, options: RuntimeArguments): SupportedExports {
    return {
        options,
        startServer(optionsOverride?: Partial<RuntimeArguments>): Promise<FastifyInstance> {
            return createServer(new NodeApp(manifest), {
                ...options,
                ...optionsOverride
            })
        }
    }
}

export function start(manifest: SSRManifest, options: RuntimeArguments): void {
    if (process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART === '0') {
        return
    }

    const app = new NodeApp(manifest)

    createServer(app, options).then(setupExitHandlers, (err: Error): void => {
        console.error(err)
        process.exit(1)
    })
}

function setupExitHandlers(server: FastifyInstance): void {
    function handleSignal(): void {
        server.close().then(
            (): void => {
                process.exit(0)
            },
            (err: Error): void => {
                server.log.error(err)
                process.exit(1)
            }
        )
    }

    for (const eventName of ['SIGINT', 'SIGTERM']) {
        process.once(eventName, handleSignal)
    }
}
