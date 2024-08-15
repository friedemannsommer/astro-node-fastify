import type { CreatePreviewServer, PreviewServer } from 'astro'
import type { SupportedExports } from './standalone.js'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const createPreviewServer: CreatePreviewServer = async (previewParams): Promise<PreviewServer> => {
    process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART = '0'

    const ssrModule = (await import(previewParams.serverEntrypoint.toString())) as SupportedExports
    let host = previewParams.host ?? 'localhost'
    let port = previewParams.port
    const server = await ssrModule.startServer({
        defaultHeaders: previewParams.headers ? { server: previewParams.headers } : undefined,
        host,
        port,
        serverPath: dirname(fileURLToPath(previewParams.serverEntrypoint))
    })
    let resolveCloseFuture: VoidFunction | undefined
    const closeFuture = new Promise<void>((resolve): void => {
        resolveCloseFuture = resolve
    })
    const serverAddresses = server.addresses()

    if (serverAddresses.length === 0) {
        throw new Error('Server was unable to bind to any address')
    }

    // biome-ignore lint/style/noNonNullAssertion: it is guaranteed that the array is not empty
    const address = serverAddresses[0]!

    port = address.port
    host = address.address

    return {
        host,
        port,
        stop(): Promise<void> {
            return server.close().then(resolveCloseFuture)
        },
        closed(): Promise<void> {
            return closeFuture
        }
    }
}

export default createPreviewServer
