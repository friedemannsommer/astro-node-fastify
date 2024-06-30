import { fileURLToPath } from 'node:url'
import { expect } from 'chai'
import getPort from 'get-port'
import { type TestFixture, loadFixture } from './utils/astro-fixture.js'

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

        const res = await fixture.fetch('/prerender')

        expect(res.status).to.eq(200)
        expect(await res.text()).to.eq('Hello World!')
    })
})
