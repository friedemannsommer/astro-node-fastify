import { fileURLToPath } from 'node:url'
import { expect } from 'chai'
import getPort from 'get-port'
import { loadFixture, type TestFixture } from './utils/astro-fixture.js'

describe('Astro hybrid output', (): void => {
    let fixture: TestFixture

    beforeEach(async (): Promise<void> => {
        fixture = await loadFixture({
            root: fileURLToPath(new URL('./fixtures/astro-hybrid', import.meta.url)),
            server: {
                host: 'localhost',
                port: await getPort()
            }
        })
    })

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
        }
    })

    it('should start with default options', async (): Promise<void> => {
        await fixture.build()
        await fixture.preview()

        const [indexRender, preRender, echoReply] = await Promise.all([
            fixture.fetch('/'),
            fixture.fetch('/prerender'),
            fixture.fetch('/echo', {
                body: 'Test',
                headers: {
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            })
        ])

        expect(preRender.status).to.eq(200)
        expect(indexRender.status).to.eq(200)
        expect(echoReply.status).to.eq(200)

        expect(await preRender.text()).to.eq('Hello World!')
        expect(await indexRender.text()).to.eq(
            '<!DOCTYPE html><html lang="en"> <head><title>fixture</title></head> <body> <h1>Hello World</h1> </body></html>'
        )
        expect(await echoReply.text()).to.eq('Test')
    })
})
