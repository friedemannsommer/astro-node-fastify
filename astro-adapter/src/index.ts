import { relative as pathRelative } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroAdapter, AstroIntegration } from 'astro'
import { type CompressFn, brotli, gzip, processAssets } from './compress.js'
import type { RuntimeArguments, UserOptions } from './typings/config.js'

const packageName = 'astro-node-fastify'
const adapterConfig: AstroAdapter = {
    exports: ['startServer', 'options'],
    name: packageName,
    previewEntrypoint: 'astro-node-fastify/preview',
    serverEntrypoint: 'astro-node-fastify/standalone',
    supportedAstroFeatures: {
        assets: {
            supportKind: 'stable',
            isSharpCompatible: true,
            isSquooshCompatible: true
        },
        envGetSecret: 'unsupported',
        hybridOutput: 'stable',
        i18nDomains: 'unsupported',
        serverOutput: 'stable',
        staticOutput: 'stable'
    }
}

export default function createIntegration(userOptions?: UserOptions): AstroIntegration {
    const preCompress = userOptions?.preCompressed ?? true
    const compressionEncodings = userOptions?.supportedEncodings ?? ['br', 'gzip', 'deflate']
    let clientAssetsPath: URL | undefined

    return {
        hooks: {
            'astro:build:done': async ({ logger }): Promise<void> => {
                if (!clientAssetsPath) {
                    logger.warn('client assets path is missing')
                    return
                }

                if (preCompress) {
                    const compressors: CompressFn[] = []

                    if (compressionEncodings.includes('br')) {
                        compressors.push(brotli)
                    }

                    if (compressionEncodings.includes('gzip')) {
                        compressors.push(gzip)
                    }

                    if (compressors.length !== 0) {
                        await processAssets({
                            compressibleFileExtensions: new Set(
                                (
                                    userOptions?.assetCompression?.fileExtensions ?? [
                                        '.css',
                                        '.js',
                                        '.html',
                                        '.xml',
                                        '.cjs',
                                        '.mjs',
                                        '.svg',
                                        '.txt',
                                        '.json'
                                    ]
                                ).map((fileExt) => (fileExt.startsWith('.') ? fileExt : `.${fileExt}`))
                            ),
                            compressors,
                            logger,
                            path: fileURLToPath(clientAssetsPath),
                            threshold: userOptions?.assetCompression?.threshold ?? 1024
                        })
                    }
                }
            },
            'astro:config:done': ({ setAdapter, config, logger }): void => {
                const adapterArgs: RuntimeArguments = {
                    assetsDir: config.build.assets,
                    cache: userOptions?.cache,
                    clientPath: pathRelative(fileURLToPath(config.build.server), fileURLToPath(config.build.client)),
                    defaultHeaders: userOptions?.defaultHeaders,
                    host:
                        typeof config.server.host === 'boolean'
                            ? config.server.host
                                ? '::'
                                : 'localhost'
                            : config.server.host,
                    port: config.server.port,
                    preCompressed: preCompress,
                    request: userOptions?.request,
                    server: userOptions?.server,
                    serverPath: '',
                    supportedEncodings: compressionEncodings
                }

                setAdapter({
                    ...adapterConfig,
                    args: adapterArgs
                })

                clientAssetsPath = config.build.client

                if (config.output === 'static') {
                    logger.error(
                        `[${packageName}] only \`output: "server"\` or \`output: "hybrid"\` are supported by this adapter.`
                    )
                }
            },
            'astro:config:setup': ({ updateConfig, config }): void => {
                updateConfig({
                    image: {
                        endpoint: config.image.endpoint ?? 'astro/assets/endpoint/node'
                    },
                    vite: {
                        ssr: {
                            target: 'node'
                        }
                    }
                })
            }
        },
        name: packageName
    }
}
