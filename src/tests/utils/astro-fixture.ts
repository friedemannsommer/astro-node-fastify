import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { AstroConfig, AstroInlineConfig, PreviewServer } from 'astro'
// these imports need to use a relative path since the package does not export the required files
import build from '../../../node_modules/astro/dist/core/build/index.js'
import { mergeConfig, resolveConfig } from '../../../node_modules/astro/dist/core/config/index.js'
import { preview } from '../../../node_modules/astro/dist/core/index.js'
import type { SupportedExports } from '../../standalone.js'

// Disable telemetry
process.env.ASTRO_TELEMETRY_DISABLED = '1'

export interface AstroFixtureOptions extends AstroInlineConfig {
    // make "root" a required option
    root: string
}

export interface TestFixture {
    build: (overrideConfig?: Partial<AstroFixtureOptions>) => Promise<void>
    config: AstroConfig

    fetch(url: URL | string, init?: RequestInit): Promise<Response>

    loadEntryPoint(): Promise<SupportedExports>

    preview(overrideConfig?: Partial<AstroFixtureOptions>): Promise<PreviewServer>

    resolveUrl: (relativeUrl: URL | string) => URL

    teardown(): Promise<void>
}

const fixturesBasePath = new URL('../fixtures', import.meta.url)

export async function loadFixture(fixtureConfig: AstroFixtureOptions): Promise<TestFixture> {
    fixtureConfig.logLevel = 'silent'

    const { astroConfig } = await resolveConfig(fixtureConfig, 'dev')

    if (!astroConfig.outDir.href.startsWith(fixturesBasePath.href)) {
        throw new Error(`The fixture output "${fileURLToPath(astroConfig.outDir)}" is not in the fixtures directory`)
    }

    const resolveUrl = resolveConfigUrl(astroConfig)
    let serverRef: PreviewServer | undefined

    return {
        config: astroConfig,
        resolveUrl,
        fetch(url: URL | string, init?: RequestInit): Promise<Response> {
            return fetch(resolveUrl(url), init)
        },
        async build(overrideConfig: Partial<AstroFixtureOptions> = {}): Promise<void> {
            process.env.NODE_ENV = 'production'

            return build(mergeConfig(fixtureConfig, overrideConfig), {
                teardownCompiler: false
            })
        },
        async preview(overrideConfig: Partial<AstroFixtureOptions> = {}): Promise<PreviewServer> {
            process.env.NODE_ENV = 'production'

            const previewServer = await preview(mergeConfig(fixtureConfig, overrideConfig))

            astroConfig.server.host = previewServer.host || 'localhost'
            astroConfig.server.port = previewServer.port
            serverRef = previewServer

            return previewServer
        },
        async loadEntryPoint(): Promise<SupportedExports> {
            process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART = '0'

            return import(new URL(astroConfig.build.server, astroConfig.outDir).href) as Promise<SupportedExports>
        },
        async teardown(): Promise<void> {
            try {
                if (serverRef) {
                    await serverRef.stop()
                    await serverRef.closed()
                }
            } finally {
                await rm(astroConfig.outDir, {
                    maxRetries: 10,
                    recursive: true,
                    force: true
                })
            }
        }
    }
}

function resolveConfigUrl(config: AstroConfig): (relativeUrl: URL | string) => URL {
    return (relativeUrl: URL | string): URL => {
        return new URL(relativeUrl, `http://${config.server?.host || 'localhost'}:${config.server?.port || 4321}`)
    }
}
