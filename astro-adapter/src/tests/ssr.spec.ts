import { expect } from 'chai'
import { type TestFixture, previewFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'

describe('Astro SSR output', (): void => {
    let fixture: TestFixture | undefined

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
            fixture = undefined
        }
    })

    it('should start with default options', async (): Promise<void> => {
        fixture = await previewFixture({
            root: getFixturePath('./astro-ssr-default-base')
        })

        const [indexRender, echoReply] = await Promise.all([
            fixture.fetch('/'),
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            })
        ])

        expect(indexRender.status).to.eq(404)
        expect(echoReply.status).to.eq(200)

        expect(echoReply.headers.get('content-type')).to.eq('text/plain')

        expect(await echoReply.text()).to.eq('Test')
    })

    it('should return the configured default headers', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-ssr-headers-base')
            },
            {
                defaultHeaders: {
                    server: {
                        'X-Test': '1',
                        'X-Another': 'one'
                    }
                }
            }
        )

        const [assetReply, serverReply] = await Promise.all([
            fixture.fetch('/robots.txt'),
            fixture.fetch('/?header=example')
        ])

        expect(assetReply.status).to.eq(404)
        expect(serverReply.status).to.eq(200)

        expect(assetReply.headers.get('x-test')).to.eq('1')
        expect(assetReply.headers.get('x-another')).to.eq('one')
        expect(serverReply.headers.get('content-type')).to.eq('text/plain')
        expect(serverReply.headers.get('x-param')).to.eq('example')
        expect(serverReply.headers.get('x-test')).to.eq('1')
        expect(serverReply.headers.get('x-another')).to.eq('one')

        expect(await serverReply.text()).to.eq('Hello world.')
    })

    it('should serve content from .well-known path', async () => {
        fixture = await previewFixture({
            root: getFixturePath('./astro-ssr-dot-prefix')
        })

        const [wellKnown, apiDotFile, apiTextFile] = await Promise.all([
            fixture.fetch('/.well-known/test.txt'),
            fixture.fetch('/api/.path.txt'),
            fixture.fetch('/api/test.txt')
        ])

        expect(wellKnown.status).to.eq(200)
        expect(apiDotFile.status).to.eq(404)
        expect(apiTextFile.status).to.eq(200)

        expect(await wellKnown.text()).to.eq('hello world')
        expect(await apiTextFile.text()).to.eq('hello world')
    })

    it('should not serve content from .well-known path', async () => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-ssr-dot-prefix')
            },
            {
                dotPrefixes: []
            }
        )

        const [wellKnown, apiDotFile, apiTextFile] = await Promise.all([
            fixture.fetch('/.well-known/test.txt'),
            fixture.fetch('/api/.path.txt'),
            fixture.fetch('/api/test.txt')
        ])

        expect(wellKnown.status).to.eq(404)
        expect(apiDotFile.status).to.eq(404)
        expect(apiTextFile.status).to.eq(200)

        expect(await apiTextFile.text()).to.eq('hello world')
    })

    it('should only serve content from api path', async () => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-ssr-dot-prefix')
            },
            {
                dotPrefixes: ['/api/']
            }
        )

        const [wellKnown, apiDotFile, apiTextFile] = await Promise.all([
            fixture.fetch('/.well-known/test.txt'),
            fixture.fetch('/api/.path.txt'),
            fixture.fetch('/api/test.txt')
        ])

        expect(wellKnown.status).to.eq(404)
        expect(apiDotFile.status).to.eq(200)
        expect(apiTextFile.status).to.eq(200)

        expect(await apiDotFile.text()).to.eq('dot API path')
        expect(await apiTextFile.text()).to.eq('hello world')
    })
})
