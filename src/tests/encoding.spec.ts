import { expect } from 'chai'
import { previewFixture, type TestFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'

describe('Response encoding', (): void => {
    let fixture: TestFixture | undefined

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
            fixture = undefined
        }
    })

    it('should compress with default options', async (): Promise<void> => {
        fixture = await previewFixture({
            root: getFixturePath('./astro-encoding-default-base')
        })

        const [smallReply, largeReply] = await Promise.all([
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Accept-Encoding': 'gzip',
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            }),
            fixture.fetch('/echo', {
                body: 'Test'.repeat(1_000),
                headers: {
                    'Accept-Encoding': 'br',
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            })
        ])

        expect(smallReply.status).to.eq(200)
        expect(smallReply.headers.get('content-type')).to.eq('text/plain')
        expect(smallReply.headers.get('content-encoding')).to.eq('gzip')
        expect(await smallReply.text()).to.eq('Test')

        expect(largeReply.status).to.eq(200)
        expect(largeReply.headers.get('content-type')).to.eq('text/plain')
        expect(largeReply.headers.get('content-encoding')).to.eq('br')
        expect(await largeReply.text()).to.eq('Test'.repeat(1_000))
    })

    it('should only compress using the specified encodings', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-encoding-restricted-base')
            },
            {
                supportedEncodings: ['gzip']
            }
        )

        const [deflateReply, gzipReply, brotliReply] = await Promise.all([
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Accept-Encoding': 'deflate',
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            }),
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Accept-Encoding': 'gzip',
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            }),
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Accept-Encoding': 'br',
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            })
        ])

        expect(deflateReply.status).to.eq(200)
        expect(deflateReply.headers.get('content-type')).to.eq('text/plain')
        expect(deflateReply.headers.get('content-encoding')).to.be.null
        expect(await deflateReply.text()).to.eq('Test')

        expect(gzipReply.status).to.eq(200)
        expect(gzipReply.headers.get('content-type')).to.eq('text/plain')
        expect(gzipReply.headers.get('content-encoding')).to.eq('gzip')
        expect(await gzipReply.text()).to.eq('Test')

        expect(brotliReply.status).to.eq(200)
        expect(brotliReply.headers.get('content-type')).to.eq('text/plain')
        expect(brotliReply.headers.get('content-encoding')).to.be.null
        expect(await brotliReply.text()).to.eq('Test')
    })
})
