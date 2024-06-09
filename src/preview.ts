import type { CreatePreviewServer, PreviewServer } from 'astro'
import type { SupportedExports } from './standalone.js'

const createPreviewServer: CreatePreviewServer = async (previewParams): Promise<PreviewServer> => {
    process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART = '0'

    const ssrModule = (await import(previewParams.serverEntrypoint.toString())) as SupportedExports
    const host = previewParams.host ?? 'localhost'
    const port = previewParams.port
    const server = await ssrModule.startServer({
        port,
        host,
        defaultHeaders: previewParams.headers ? { server: previewParams.headers } : undefined
    })
    let resolveCloseFuture: VoidFunction | undefined
    const closeFuture = new Promise<void>((resolve): void => {
        resolveCloseFuture = resolve
    })

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
