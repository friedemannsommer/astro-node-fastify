import { afterEach, describe, it } from 'node:test'
import { expect } from 'chai'
import { getEnvironmentConfig } from '../environment.js'

const ENV_KEYS = [
    'HOST',
    'PORT',
    'REQUEST_BODY_LIMIT',
    'REQUEST_TIMEOUT',
    'SERVER_ACCESS_LOGGING',
    'SERVER_CERT_PATH',
    'SERVER_COMPRESSION_THRESHOLD',
    'SERVER_CONNECTION_TIMEOUT',
    'SERVER_DISABLE_ASTRO_HTML_STREAMING',
    'SERVER_DISABLE_ON_DEMAND_COMPRESSION',
    'SERVER_ENABLE_ASTRO_RESPONSE_BUFFERING',
    'SERVER_GRACEFUL_TIMEOUT',
    'SERVER_HTTP2',
    'SERVER_KEEP_ALIVE_TIMEOUT',
    'SERVER_KEY_PATH',
    'SERVER_LOG_LEVEL',
    'SERVER_REQUEST_ID_HEADER',
    'SERVER_SOCKET',
    'SERVER_TRUST_PROXY'
] as const

describe('Environment config', (): void => {
    const originalEnv = new Map<string, string | undefined>()

    afterEach((): void => {
        for (const key of ENV_KEYS) {
            if (originalEnv.has(key)) {
                const value = originalEnv.get(key)

                if (value === undefined) {
                    delete process.env[key]
                } else {
                    process.env[key] = value
                }

                originalEnv.delete(key)
            }
        }
    })

    function setEnv(key: (typeof ENV_KEYS)[number], value: string | undefined): void {
        if (!originalEnv.has(key)) {
            originalEnv.set(key, process.env[key])
        }

        if (value === undefined) {
            delete process.env[key]
        } else {
            process.env[key] = value
        }
    }

    it('should return an empty config if no environment variables are set', (): void => {
        for (const key of ENV_KEYS) {
            setEnv(key, undefined)
        }

        const config = getEnvironmentConfig()

        expect(config.host).to.be.undefined
        expect(config.port).to.be.undefined
        expect(config.https).to.be.undefined
        expect(config.request).to.be.undefined
        expect(config.server).to.be.undefined
        expect(config.socket).to.be.undefined
    })

    it('should parse the host and port', (): void => {
        setEnv('HOST', ' 127.0.0.1 ')
        setEnv('PORT', '8080')

        const config = getEnvironmentConfig()

        expect(config.host).to.eq('127.0.0.1')
        expect(config.port).to.eq(8080)
    })

    it('should ignore an empty host and an invalid port', (): void => {
        setEnv('HOST', '   ')
        setEnv('PORT', 'not-a-number')

        const config = getEnvironmentConfig()

        expect(config.host).to.be.undefined
        expect(config.port).to.be.undefined
    })

    it('should only set https if both key and cert paths are present', (): void => {
        setEnv('SERVER_KEY_PATH', '/path/to/key.pem')
        setEnv('SERVER_CERT_PATH', undefined)

        expect(getEnvironmentConfig().https).to.be.undefined

        setEnv('SERVER_KEY_PATH', undefined)
        setEnv('SERVER_CERT_PATH', '/path/to/cert.pem')

        expect(getEnvironmentConfig().https).to.be.undefined

        setEnv('SERVER_KEY_PATH', '/path/to/key.pem')

        expect(getEnvironmentConfig().https).to.deep.eq({
            key: '/path/to/key.pem',
            cert: '/path/to/cert.pem'
        })
    })

    it('should parse the socket path', (): void => {
        setEnv('SERVER_SOCKET', ' /run/app.sock ')

        expect(getEnvironmentConfig().socket).to.eq('/run/app.sock')
    })

    it('should parse request options', (): void => {
        setEnv('REQUEST_BODY_LIMIT', '2048')
        setEnv('REQUEST_TIMEOUT', '5000')

        expect(getEnvironmentConfig().request).to.deep.eq({
            bodyLimit: 2048,
            timeout: 5000
        })
    })

    it('should ignore invalid request options', (): void => {
        setEnv('REQUEST_BODY_LIMIT', 'abc')
        setEnv('REQUEST_TIMEOUT', '')

        expect(getEnvironmentConfig().request).to.be.undefined
    })

    it('should parse boolean server options ("1" is true, everything else is false)', (): void => {
        setEnv('SERVER_ACCESS_LOGGING', '1')
        setEnv('SERVER_HTTP2', '0')
        setEnv('SERVER_DISABLE_ON_DEMAND_COMPRESSION', 'true')

        expect(getEnvironmentConfig().server).to.deep.eq({
            accessLogging: true,
            http2: false,
            disableOnDemandCompression: false
        })
    })

    it('should parse numeric server options', (): void => {
        setEnv('SERVER_COMPRESSION_THRESHOLD', '1024')
        setEnv('SERVER_CONNECTION_TIMEOUT', '3000')
        setEnv('SERVER_GRACEFUL_TIMEOUT', '10000')
        setEnv('SERVER_KEEP_ALIVE_TIMEOUT', '60000')

        expect(getEnvironmentConfig().server).to.deep.eq({
            compressionThreshold: 1024,
            connectionTimeout: 3000,
            gracefulTimeout: 10000,
            keepAliveTimeout: 60000
        })
    })

    it('should only accept valid log levels', (): void => {
        setEnv('SERVER_LOG_LEVEL', 'DEBUG')

        expect(getEnvironmentConfig().server).to.deep.eq({
            logLevel: 'debug'
        })

        setEnv('SERVER_LOG_LEVEL', 'verbose')

        expect(getEnvironmentConfig().server).to.be.undefined
    })

    it('should pass through the request id header', (): void => {
        setEnv('SERVER_REQUEST_ID_HEADER', 'x-request-id')

        expect(getEnvironmentConfig().server).to.deep.eq({
            requestIdHeader: 'x-request-id'
        })
    })

    it('should parse "trust proxy" as boolean or string', (): void => {
        setEnv('SERVER_TRUST_PROXY', '1')

        expect(getEnvironmentConfig().server).to.deep.eq({
            trustProxy: true
        })

        setEnv('SERVER_TRUST_PROXY', '0')

        expect(getEnvironmentConfig().server).to.deep.eq({
            trustProxy: false
        })

        setEnv('SERVER_TRUST_PROXY', '127.0.0.1')

        expect(getEnvironmentConfig().server).to.deep.eq({
            trustProxy: false
        })
    })

    it('should omit undefined server options', (): void => {
        setEnv('SERVER_ACCESS_LOGGING', '1')
        setEnv('SERVER_LOG_LEVEL', 'invalid')

        const serverConfig = getEnvironmentConfig().server

        expect(serverConfig).to.deep.eq({
            accessLogging: true
        })
        expect(serverConfig).to.not.have.property('logLevel')
    })
})
