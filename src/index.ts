import type { AstroAdapter, AstroIntegration } from 'astro'
import type { RuntimeArguments, UserOptions } from './typings/config.js'
import { fileURLToPath } from 'node:url'

const packageName = 'astro-node-fastify'
const adapterConfig: AstroAdapter = {
    exports: ['start'],
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
    return {
        name: packageName,
        hooks: {
            'astro:config:setup': ({ updateConfig, config }): void => {
                updateConfig({
                    image: {
                        endpoint: config.image.endpoint ?? 'astro/assets/endpoint/node'
                    }
                })
            },
            'astro:config:done': ({ setAdapter, config }): void => {
                const adapterArgs: RuntimeArguments = {
                    assets: config.build.assets,
                    clientPath: fileURLToPath(config.build.client),
                    serverPath: fileURLToPath(config.build.server),
                    port: config.server.port,
                    host:
                        typeof config.server.host === 'boolean'
                            ? config.server.host
                                ? '::'
                                : 'localhost'
                            : config.server.host,
                    defaultHeaders: userOptions?.defaultHeaders,
                    preCompressed: userOptions?.preCompressed ?? true,
                    supportedEncodings: userOptions?.supportedEncodings ?? ['br', 'gzip', 'deflate'],
                    request: userOptions?.request,
                    server: userOptions?.server
                }

                setAdapter({
                    ...adapterConfig,
                    args: adapterArgs
                })

                if (config.output === 'static') {
                    console.error(
                        `[${packageName}] only \`output: "server"\` or \`output: "hybrid"\` are supported by this adapter.`
                    )
                }
            }
        }
    }
}
