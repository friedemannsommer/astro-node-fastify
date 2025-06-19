import { defineConfig } from 'astro/config'
import nodeFastify from 'astro-node-fastify'

export default defineConfig({
    adapter: nodeFastify({
        server: {
            logLevel: 'fatal'
        }
    }),
    output: 'static'
})
