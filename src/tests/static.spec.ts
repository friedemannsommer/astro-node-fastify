import { createFixture, type TestFixture } from './utils/astro-fixture.js'
import { getFixturePath } from './utils/path.js'
import { expect } from 'chai'

describe('Astro static output', (): void => {
    let fixture: TestFixture | undefined

    afterEach(async (): Promise<void> => {
        if (fixture) {
            await fixture.teardown()
            fixture = undefined
        }
    })

    it('should not build', async (): Promise<void> => {
        fixture = await createFixture({
            root: getFixturePath('./astro-static-default-base')
        })

        let failed = false

        try {
            await fixture.build()
            failed = true
        } catch (_) {
            // expected outcome
        }

        if (failed) {
            expect.fail('a static app should not be buildable')
        }
    })
})
