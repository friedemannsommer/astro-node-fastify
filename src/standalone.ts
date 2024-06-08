import { NodeApp } from 'astro/app/node'
import type { SSRManifest } from 'astro'
import { createServer } from './server.js'
import type { RuntimeArguments } from './typings/config.js'

export function start(manifest: SSRManifest, options: RuntimeArguments): void {
    const app = new NodeApp(manifest)

    createServer(app, options).catch((err: Error): void => {
        console.error(err)
        process.exit(1)
    })
}
