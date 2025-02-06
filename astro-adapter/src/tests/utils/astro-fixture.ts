import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { AstroConfig, AstroInlineConfig } from 'astro'
import getPort from 'get-port'
// these imports need to use a relative path since the package doesn't export the required files
import build from '../../../../node_modules/astro/dist/core/build/index.js'
import { mergeConfig, resolveConfig } from '../../../../node_modules/astro/dist/core/config/index.js'
import createIntegration from '../../index.js'
import type { SupportedExports } from '../../standalone.js'
import type { RuntimeArguments, UserOptions } from '../../typings/config.js'
import type { FastifyInstance } from 'fastify'

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

    preview(overrideConfig?: Partial<RuntimeArguments>): Promise<FastifyInstance>

    resolveClientPath(relativePath: URL | string): URL

    resolveUrl(relativeUrl: URL | string): URL

    teardown(): Promise<void>
}

const fixturesBasePath = new URL('../../../../fixtures', import.meta.url)

export async function previewFixture(
    options: AstroFixtureOptions,
    integrationOptions?: UserOptions
): Promise<TestFixture> {
    const fixture = await buildFixture(options, integrationOptions)

    await fixture.preview()

    return fixture
}

export async function buildFixture(
    options: AstroFixtureOptions,
    integrationOptions?: UserOptions
): Promise<TestFixture> {
    const fixture = await createFixture(options, integrationOptions)

    await fixture.build()

    return fixture
}

export async function createFixture(
    options: AstroFixtureOptions,
    integrationOptions?: UserOptions
): Promise<TestFixture> {
    return loadFixture({
        ...options,
        adapter: createIntegration({
            ...integrationOptions,
            server: {
                ...integrationOptions?.server,
                logLevel: 'error'
            }
        }),
        server: {
            host: 'localhost',
            port: await getPort(),
            ...(options.server ?? {})
        }
    })
}

export async function loadFixture(fixtureConfig: AstroFixtureOptions): Promise<TestFixture> {
    fixtureConfig.logLevel = 'silent'

    const { astroConfig } = await resolveConfig(fixtureConfig, 'dev')

    if (!astroConfig.outDir.href.startsWith(fixturesBasePath.href)) {
        throw new Error(`The fixture output "${fileURLToPath(astroConfig.outDir)}" is not in the fixtures directory`)
    }

    const resolveUrl = resolveConfigUrl(astroConfig)
    let serverRef: FastifyInstance | undefined

    return {
        config: astroConfig,
        resolveUrl,
        fetch(url: URL | string, init?: RequestInit): Promise<Response> {
            const headers = new Headers(init?.headers)
            const requestUrl = resolveUrl(url)

            if (!headers.has('origin')) {
                headers.set('origin', requestUrl.origin)
            }

            return fetch(requestUrl, {
                ...init,
                headers
            })
        },
        async build(overrideConfig: Partial<AstroFixtureOptions> = {}): Promise<void> {
            process.env.NODE_ENV = 'production'

            return build(mergeConfig(fixtureConfig, overrideConfig))
        },
        resolveClientPath(relativePath: URL | string): URL {
            return new URL(relativePath, astroConfig.build.client)
        },
        async preview(overrideConfig: Partial<RuntimeArguments> = {}): Promise<FastifyInstance> {
            process.env.NODE_ENV = 'production'
            process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART = '0'

            const entrypointUrl = new URL(`./entry.mjs?ts=${Date.now()}`, astroConfig.build.server)
            const { startServer } = (await import(entrypointUrl.href)) as SupportedExports

            serverRef = await startServer({
                ...overrideConfig,
                serverPath: fileURLToPath(astroConfig.build.server)
            })

            const addresses = serverRef.addresses()

            if (addresses.length === 0) {
                throw new Error('Server was unable to bind to any address')
            }

            // biome-ignore lint/style/noNonNullAssertion: array contains at least one element
            astroConfig.server.host = addresses[0]!.address
            // biome-ignore lint/style/noNonNullAssertion: array contains at least one element
            astroConfig.server.port = addresses[0]!.port

            return serverRef
        },
        async loadEntryPoint(): Promise<SupportedExports> {
            process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART = '0'

            return import(new URL(astroConfig.build.server, astroConfig.outDir).href) as Promise<SupportedExports>
        },
        async teardown(): Promise<void> {
            try {
                if (serverRef) {
                    await serverRef.close()
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
