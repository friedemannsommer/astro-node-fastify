import { getOptions, startServer } from './standalone'

export const options = await getOptions()

export { startServer }

if (process.env.ASTRO_NODE_FASTIFY_INTERNAL_AUTOSTART !== '0') {
    await startServer()
}
