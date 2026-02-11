import { access } from 'node:fs/promises'
import { versions } from 'node:process'
import { expect } from 'chai'
import { buildFixture, previewFixture, type TestFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'

describe('Astro asset compression', (): void => {
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

    it('should only use Zstd compression', async (): Promise<void> => {
        const majorVersion = +versions.node.slice(0, versions.node.indexOf('.'))

        if (majorVersion < 22) {
            console.warn('Zstd compression is not supported on Node.js versions below 22.15. Skipping test.')
            return
        }

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

    it('should not compress the response if disabled via config option', async (): Promise<void> => {
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
