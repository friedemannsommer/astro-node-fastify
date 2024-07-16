import nodeFastify from 'astro-node-fastify'
import { defineConfig } from 'astro/config'

export default defineConfig({
    adapter: nodeFastify({
        server: {
            logLevel: 'fatal'
        }
    }),
    output: 'hybrid'
})
