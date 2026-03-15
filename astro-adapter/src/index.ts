import { writeFile } from 'node:fs/promises'
import { relative as pathRelative } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroAdapter, AstroConfig, AstroIntegration, AstroIntegrationLogger } from 'astro'
import { brotli, type CompressFn, gzip, processAssets, zstd } from './compress.js'
import { ADAPTER_BUILD_CONFIG, PACKAGE_NAME } from './constants'
import type { EncodingToken, RuntimeArguments, UserOptions } from './typings/config.js'

const adapterConfig: AstroAdapter = {
    adapterFeatures: {
        buildOutput: 'server',
        middlewareMode: 'classic'
    },
    entrypointResolution: 'auto',
    name: PACKAGE_NAME,
    previewEntrypoint: `${PACKAGE_NAME}/preview`,
    serverEntrypoint: `${PACKAGE_NAME}/entrypoint`,
    supportedAstroFeatures: {
        envGetSecret: 'unsupported',
        hybridOutput: 'stable',
        i18nDomains: 'unsupported',
        serverOutput: 'stable',
        sharpImageService: 'experimental',
        staticOutput: 'unsupported'
    }
}

export default function createIntegration(userOptions?: UserOptions): AstroIntegration {
    const preCompress = userOptions?.preCompressed ?? true
    const compressionEncodings = userOptions?.supportedEncodings ?? ['br', 'gzip', 'deflate']
    let astroConfig: AstroConfig | undefined

    return {
        hooks: {
            'astro:build:done': async ({ logger }): Promise<void> => {
                if (!astroConfig) {
                    logger.warn('astro config is missing')
                    return
                }

                if (preCompress) {
                    await compressAssets(astroConfig, userOptions, compressionEncodings, logger)
                }

                await writeAdapterConfig(astroConfig, userOptions, preCompress, compressionEncodings)
            },
            'astro:config:done': async ({ setAdapter, config }): Promise<void> => {
                setAdapter(adapterConfig)

                astroConfig = config

                if (config.output === 'static') {
                    const error = new Error(
                        `[${PACKAGE_NAME}] only \`output: "server"\` or \`output: "hybrid"\` are supported by this adapter.`
                    )

                    error.name = 'AstroAdapterError'

                    throw error
                }
            },
            'astro:config:setup': ({ updateConfig, config, command }): void => {
                updateConfig({
                    image: {
                        endpoint:
                            config.image.endpoint ??
                            (command === 'dev' ? 'astro/assets/endpoint/dev' : 'astro/assets/endpoint/node')
                    },
                    vite: {
                        ssr: {
                            target: 'node'
                        }
                    }
                })
            }
        },
        name: PACKAGE_NAME
    }
}

async function compressAssets(
    config: AstroConfig,
    userOptions: UserOptions | undefined,
    encodings: EncodingToken[],
    logger: AstroIntegrationLogger
): Promise<void> {
    const compressors: CompressFn[] = []

    if (encodings.includes('zstd')) {
        compressors.push(zstd)
    }

    if (encodings.includes('br')) {
        compressors.push(brotli)
    }

    if (encodings.includes('gzip')) {
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
            path: fileURLToPath(config.build.client),
            threshold: userOptions?.assetCompression?.threshold ?? 1024
        })
    }
}

async function writeAdapterConfig(
    config: AstroConfig,
    userOptions: UserOptions | undefined,
    preCompress: boolean,
    compressionEncodings: EncodingToken[]
): Promise<void> {
    await writeFile(
        new URL(ADAPTER_BUILD_CONFIG, config.build.server),
        JSON.stringify({
            assetsDir: config.build.assets,
            cache: userOptions?.cache,
            clientPath: pathRelative(fileURLToPath(config.build.server), fileURLToPath(config.build.client)),
            defaultHeaders: userOptions?.defaultHeaders,
            dotPrefixes: userOptions?.dotPrefixes ?? ['/.well-known/'],
            host:
                typeof config.server.host === 'boolean'
                    ? config.server.host
                        ? '::'
                        : 'localhost'
                    : config.server.host,
            port: config.server.port,
            preCompressed: preCompress,
            request: userOptions?.request,
            routesWithoutCompression: userOptions?.routesWithoutCompression,
            server: userOptions?.server,
            serverPath: '',
            supportedEncodings: compressionEncodings
        } satisfies RuntimeArguments),
        {
            encoding: 'utf8'
        }
    )
}
