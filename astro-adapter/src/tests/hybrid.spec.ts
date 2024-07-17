import { expect } from 'chai'
import { type TestFixture, previewFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'

describe('Astro hybrid output', (): void => {
    let fixture: TestFixture | undefined

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
            fixture = undefined
        }
    })

    it('should start with default options', async (): Promise<void> => {
        fixture = await previewFixture({
            root: getFixturePath('./astro-hybrid-default-base')
        })

        const [indexRender, preRender, echoReply] = await Promise.all([
            fixture.fetch('/'),
            fixture.fetch('/prerender.txt'),
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            })
        ])

        expect(indexRender.status).to.eq(200)
        expect(preRender.status).to.eq(200)
        expect(echoReply.status).to.eq(200)

        expect(indexRender.headers.get('content-type')).to.eq('text/html; charset=UTF-8')
        expect(preRender.headers.get('content-type')).to.eq('text/plain; charset=UTF-8')
        expect(echoReply.headers.get('content-type')).to.eq('text/plain')

        expect(await indexRender.text()).to.eq(
            '<!DOCTYPE html><html lang="en"> <head><title>fixture</title></head> <body> <h1>Hello World</h1> </body></html>'
        )
        expect(await preRender.text()).to.eq('Hello World!')
        expect(await echoReply.text()).to.eq('Test')
    })

    it('should return the configured default headers', async (): Promise<void> => {
        fixture = await previewFixture(
            {
                root: getFixturePath('./astro-hybrid-headers-base')
            },
            {
                defaultHeaders: {
                    assets: {
                        'X-Asset': 'test'
                    },
                    server: {
                        'X-Test': '1',
                        'X-Another': 'one'
                    }
                }
            }
        )

        const [assetReply, serverReply] = await Promise.all([fixture.fetch('/robots.txt'), fixture.fetch('/')])

        expect(assetReply.status).to.eq(200)
        expect(serverReply.status).to.eq(200)

        expect(assetReply.headers.get('content-type')).to.eq('text/plain; charset=UTF-8')
        expect(assetReply.headers.get('X-Asset')).to.eq('test')
        expect(serverReply.headers.get('content-type')).to.eq('text/plain')
        expect(serverReply.headers.get('X-Test')).to.eq('1')
        expect(serverReply.headers.get('X-Another')).to.eq('one')

        expect(await assetReply.text()).to.eq('User-Agent: *\nDisallow: /')
        expect(await serverReply.text()).to.eq('Hello world.')
    })
})
