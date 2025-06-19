import { access } from 'node:fs/promises'
import { expect } from 'chai'
import { buildFixture, type TestFixture } from './utils/astro-fixture.js'
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
    } catch (_err) {
        expect.fail('Expected promise to be fulfilled')
    }
}
