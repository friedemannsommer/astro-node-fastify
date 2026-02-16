import { access } from 'node:fs/promises'
import { versions } from 'node:process'
import { expect } from 'chai'
import { buildFixture, previewFixture, type TestFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'

describe('Astro asset compression', (): void => {
    const majorVersion = +versions.node.slice(0, versions.node.indexOf('.'))
    let fixture: TestFixture | undefined

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
            fixture = undefined
        }
    })

    it('should compress with default options', async (): Promise<void> => {
        fixture = await buildFixture({
            root: getFixturePath('./astro-asset-compression-base')
        })

        await assertPromiseRejected(access(fixture.resolveClientPath('./robots.txt.gz')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./robots.txt.br')))
        await assertPromiseFulfilled(access(fixture.resolveClientPath('./lorem-ipsum.txt.gz')))
        await assertPromiseFulfilled(access(fixture.resolveClientPath('./lorem-ipsum.txt.br')))
    })

    it('should only use brotli compression', async (): Promise<void> => {
        fixture = await buildFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                supportedEncodings: ['br']
            }
        )

        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.gz')))
        await assertPromiseFulfilled(access(fixture.resolveClientPath('./lorem-ipsum.txt.br')))
    })

    it('should only use gzip compression', async (): Promise<void> => {
        fixture = await buildFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                supportedEncodings: ['gzip']
            }
        )

        await assertPromiseFulfilled(access(fixture.resolveClientPath('./lorem-ipsum.txt.gz')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.br')))
    })
    ;(majorVersion < 22 ? xit : it)('should only use Zstd compression', async (): Promise<void> => {
        fixture = await buildFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                supportedEncodings: ['zstd']
            }
        )

        await assertPromiseFulfilled(access(fixture.resolveClientPath('./lorem-ipsum.txt.zst')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.br')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.gz')))
    })

    it('should not pre-compress client assets', async (): Promise<void> => {
        fixture = await buildFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                preCompressed: false
            }
        )

        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.gz')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.br')))
    })

    it('should only compress specified file extension', async (): Promise<void> => {
        fixture = await buildFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                assetCompression: {
                    fileExtensions: ['.csv']
                }
            }
        )

        await assertPromiseFulfilled(access(fixture.resolveClientPath('./mock.csv.gz')))
        await assertPromiseFulfilled(access(fixture.resolveClientPath('./mock.csv.br')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.gz')))
        await assertPromiseRejected(access(fixture.resolveClientPath('./lorem-ipsum.txt.br')))
    })

    it('should not compress route response if disabled via config option', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                routesWithoutCompression: ['/no-compression']
            }
        )

        const response = await fixture.fetch('/no-compression')

        expect(response.status).to.eq(200)
        expect(response.headers.get('content-encoding')).to.be.null
        expect(response.headers.get('content-type')).to.eq('text/plain')
        expect(await response.text()).to.contain('Hello world.')
    })

    it('should not compress Fastify responses if disabled via config option', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                server: {
                    disableOnDemandCompression: true
                }
            }
        )

        const [robots, loremIpsum, noCompression] = await Promise.all([
            fixture.fetch('/robots.txt'),
            fixture.fetch('/lorem-ipsum.txt'),
            fixture.fetch('/no-compression')
        ])

        expect(robots.status).to.eq(200)
        expect(robots.headers.get('content-encoding')).to.be.null
        expect(robots.headers.get('content-length')).not.to.be.null

        expect(loremIpsum.status).to.eq(200)
        expect(loremIpsum.headers.get('content-encoding')).not.to.be.null
        expect(loremIpsum.headers.get('content-length')).not.to.be.null

        expect(noCompression.status).to.eq(200)
        expect(noCompression.headers.get('content-encoding')).to.be.null
        expect(noCompression.headers.get('transfer-encoding')).to.eq('chunked')
        expect(noCompression.headers.get('content-length')).to.be.null
    })

    it('should not stream Astro responses if disabled via config option', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                server: {
                    enableAstroResponseBuffering: true,
                    disableOnDemandCompression: true
                }
            }
        )

        const noCompression = await fixture.fetch('/no-compression')

        expect(noCompression.status).to.eq(200)
        expect(noCompression.headers.get('content-encoding')).to.be.null
        expect(noCompression.headers.get('transfer-encoding')).to.be.null
        expect(noCompression.headers.get('content-length')).not.to.be.null
    })

    it('should compress stream Astro responses even if streaming is disabled via config option', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-asset-compression-base')
            },
            {
                server: {
                    enableAstroResponseBuffering: true
                }
            }
        )

        const noCompression = await fixture.fetch('/no-compression')

        expect(noCompression.status).to.eq(200)
        expect(noCompression.headers.get('content-encoding')).not.to.be.null
        expect(noCompression.headers.get('transfer-encoding')).not.to.be.null
        expect(noCompression.headers.get('content-length')).to.be.null
    })
})

async function assertPromiseRejected(promise: Promise<void>): Promise<void> {
    try {
        await promise
    } catch (_err) {
        return
    }

    expect.fail('Expected promise to be rejected')
}

async function assertPromiseFulfilled(promise: Promise<void>): Promise<void> {
    try {
        await promise
    } catch (err) {
        console.error(err)
        expect.fail('Expected promise to be fulfilled')
    }
}
