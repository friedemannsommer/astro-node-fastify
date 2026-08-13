import { readdir } from 'node:fs/promises'
import { afterEach, describe, it } from 'node:test'
import { expect } from 'chai'
import { previewFixture, type TestFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'

describe('Astro cache headers', { concurrency: false }, (): void => {
    let fixture: TestFixture | undefined

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
            fixture = undefined
        }
    })

    it('should not set a cache-control header by default', async (): Promise<void> => {
        fixture = await previewFixture({
            root: getFixturePath('./astro-server-base')
        })

        const [assetReply, serverReply] = await Promise.all([fixture.fetch('/robots.txt'), fixture.fetch('/')])

        expect(assetReply.status).to.eq(200)
        expect(serverReply.status).to.eq(200)

        expect(assetReply.headers.get('cache-control')).to.be.null
        expect(serverReply.headers.get('cache-control')).to.be.null
    })

    it('should set the configured cache-control header on public assets only', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-server-base')
            },
            {
                cache: {
                    maxAge: 3600
                }
            }
        )

        const [assetReply, serverReply] = await Promise.all([fixture.fetch('/robots.txt'), fixture.fetch('/')])

        expect(assetReply.status).to.eq(200)
        expect(serverReply.status).to.eq(200)

        expect(assetReply.headers.get('cache-control')).to.eq('public,max-age=3600')
        expect(serverReply.headers.get('cache-control')).to.be.null
    })

    it('should include all configured cache directives', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-server-base')
            },
            {
                cache: {
                    immutable: true,
                    maxAge: 3600,
                    mustRevalidate: true,
                    noTransform: true,
                    proxyRevalidate: true,
                    staleIfError: 60,
                    staleWhileRevalidate: 30
                }
            }
        )

        const assetReply = await fixture.fetch('/robots.txt')

        expect(assetReply.status).to.eq(200)
        expect(assetReply.headers.get('cache-control')).to.eq(
            'public,max-age=3600,stale-if-error=60,stale-while-revalidate=30,immutable,must-revalidate,no-transform,proxy-revalidate'
        )
    })

    it('should mark build assets as immutable', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-server-base')
            },
            {
                cache: {
                    maxAge: 3600
                }
            }
        )

        const buildAssets = await readdir(new URL('./_astro/', fixture.resolveClientPath('./'))).catch(
            () => [] as string[]
        )
        const buildAsset = buildAssets.find((filename) => filename.endsWith('.css') || filename.endsWith('.js'))

        expect(buildAsset).to.be.undefined

        const assetReply = await fixture.fetch('/_astro/some-asset.js')

        expect(assetReply.status).to.eq(404)
        expect(assetReply.headers.get('cache-control')).to.be.null
    })

    it('should serve pre-compressed assets when the client accepts the encoding', async (): Promise<void> => {
        fixture = await previewFixture({
            root: getFixturePath('./astro-server-base')
        })

        const [gzipReply, brotliReply, identityReply] = await Promise.all([
            fixture.fetch('/lorem-ipsum.txt', {
                headers: {
                    'Accept-Encoding': 'gzip'
                }
            }),
            fixture.fetch('/lorem-ipsum.txt', {
                headers: {
                    'Accept-Encoding': 'br'
                }
            }),
            fixture.fetch('/lorem-ipsum.txt', {
                headers: {
                    'Accept-Encoding': 'identity'
                }
            })
        ])

        expect(gzipReply.status).to.eq(200)
        expect(gzipReply.headers.get('content-encoding')).to.eq('gzip')

        expect(brotliReply.status).to.eq(200)
        expect(brotliReply.headers.get('content-encoding')).to.eq('br')

        expect(identityReply.status).to.eq(200)
        expect(identityReply.headers.get('content-encoding')).to.be.null
        expect(await identityReply.text()).to.contain('Lorem ipsum')
    })
})
