import { createReadStream, createWriteStream, type ReadStream } from 'node:fs'
import { readdir, rm, stat } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import stream from 'node:stream/promises'
import { createBrotliCompress, createGzip, constants as ZLIB_CONSTANTS } from 'node:zlib'
import type { AstroIntegrationLogger } from 'astro'

export type CompressFn = (filePath: string, originalSize: number, fileStream: ReadStream) => Promise<void>

export interface AssetCompressionArgs {
    readonly compressibleFileExtensions: Set<string>
    readonly compressors: CompressFn[]
    readonly logger: AstroIntegrationLogger
    readonly path: string
    readonly threshold: number
}

export async function processAssets({
    compressibleFileExtensions,
    compressors,
    logger,
    path,
    threshold
}: AssetCompressionArgs): Promise<void> {
    const entries = await readdir(path, { withFileTypes: true })
    const compressionResults: Array<Promise<void>> = []

    for (const entry of entries) {
        const filename = resolve(path, entry.name)

        if (entry.isDirectory()) {
            compressionResults.push(
                processAssets({ compressibleFileExtensions, compressors, logger, path: filename, threshold })
            )
        } else if (compressibleFileExtensions.has(extname(filename))) {
            const fileStats = await stat(filename)

            if (fileStats.size > threshold) {
                logger.debug(`compressing file [${filename}]`)

                for (const compressor of compressors) {
                    compressionResults.push(compressor(filename, fileStats.size, createReadStream(filename)))
                }
            }
        }
    }

    await Promise.all(compressionResults)
}

export async function gzip(path: string, originalSize: number, fileStream: ReadStream): Promise<void> {
    const outputPath = `${path}.gz`

    await stream.pipeline(
        fileStream,
        createGzip({
            level: ZLIB_CONSTANTS.Z_BEST_COMPRESSION
        }),
        createWriteStream(outputPath)
    )

    await removeLargerOrEqual(outputPath, originalSize)
}

export async function brotli(path: string, originalSize: number, fileStream: ReadStream): Promise<void> {
    const outputPath = `${path}.br`

    await stream.pipeline(
        fileStream,
        createBrotliCompress({
            params: {
                [ZLIB_CONSTANTS.BROTLI_PARAM_QUALITY]: ZLIB_CONSTANTS.BROTLI_MAX_QUALITY
            }
        }),
        createWriteStream(outputPath)
    )

    await removeLargerOrEqual(outputPath, originalSize)
}

async function removeLargerOrEqual(path: string, originalSize: number): Promise<void> {
    const fileStats = await stat(path)

    if (fileStats.size >= originalSize) {
        await rm(path)
    }
}
