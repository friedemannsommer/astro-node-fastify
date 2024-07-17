import { fileURLToPath } from 'node:url'

const fixturesRoot = new URL('../../../../fixtures/', import.meta.url)

export function getFixturePath(relativePath: string) {
    return fileURLToPath(new URL(relativePath, fixturesRoot))
}
