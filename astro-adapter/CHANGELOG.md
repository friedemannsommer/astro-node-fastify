# astro-node-fastify

## 0.6.0

### Minor Changes

- [#370](https://github.com/friedemannsommer/astro-node-fastify/pull/370) [`517dd53`](https://github.com/friedemannsommer/astro-node-fastify/commit/517dd5332aa75cff941d095bf41296b7c440773d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Introduced the [`disableAstroHtmlStreaming`](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.ServerOptions.html#disableastrohtmlstreaming) server option to disable the (now by default enabled) experimental [Astro HTML streaming](https://docs.astro.build/en/recipes/streaming-improve-page-performance/) feature.

- [#370](https://github.com/friedemannsommer/astro-node-fastify/pull/370) [`517dd53`](https://github.com/friedemannsommer/astro-node-fastify/commit/517dd5332aa75cff941d095bf41296b7c440773d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Introduced [`compressionThreshold`](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.ServerOptions.html#compressionthreshold) server option to configure the minimum buffer size (which has been increased to 10 kb) for on-demand compression.

- [#362](https://github.com/friedemannsommer/astro-node-fastify/pull/362) [`3201bd4`](https://github.com/friedemannsommer/astro-node-fastify/commit/3201bd499cff76129ff352682a06f3bcf2e45b08) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Added an option to disable compression for statically configured routes (see [`routesWithoutCompression`](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.UserOptions.html#routeswithoutcompression)).

- [#362](https://github.com/friedemannsommer/astro-node-fastify/pull/362) [`3201bd4`](https://github.com/friedemannsommer/astro-node-fastify/commit/3201bd499cff76129ff352682a06f3bcf2e45b08) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Added "[zstd](https://github.com/facebook/zstd)" as a supported encoding algorithm (only available for Node.js v22.15 and above).

- [#370](https://github.com/friedemannsommer/astro-node-fastify/pull/370) [`517dd53`](https://github.com/friedemannsommer/astro-node-fastify/commit/517dd5332aa75cff941d095bf41296b7c440773d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Introduced [`disableOnDemandCompression`](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.ServerOptions.html#disableondemandcompression) server option to globally disable on-demand response compression (while keeping request compression enabled).

- [#370](https://github.com/friedemannsommer/astro-node-fastify/pull/370) [`517dd53`](https://github.com/friedemannsommer/astro-node-fastify/commit/517dd5332aa75cff941d095bf41296b7c440773d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Introduced [`enableAstroResponseBuffering`](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.ServerOptions.html#enableastroresponsebuffering) option to buffer all responses emitted by Astro in-memory before sending them to the client.

## 0.5.0

### Minor Changes

- [`e56cfba`](https://github.com/friedemannsommer/astro-node-fastify/commit/e56cfbac711e6a50f2e2b386e5d86fce8ad11876) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated request handler to use the Astro renderer as fallback if no route data is available.

## 0.4.16

### Patch Changes

- [`8f32e7e`](https://github.com/friedemannsommer/astro-node-fastify/commit/8f32e7ec57c3bbe705630f38f39de1b13c0de552) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Update Astro support to include v5.17

## 0.4.15

### Patch Changes

- [`b02c26b`](https://github.com/friedemannsommer/astro-node-fastify/commit/b02c26bc6319937004afce90a1e91a0b595b5606) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Removed unnecessary Fastify option [`useSemicolonDelimiter`](https://fastify.dev/docs/latest/Reference/Server/#usesemicolondelimiter) since the statically and explicitly set value was the default value.

## 0.4.14

### Patch Changes

- [`e1f6f32`](https://github.com/friedemannsommer/astro-node-fastify/commit/e1f6f322b152067513570cb98aafdc298d2fbc74) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated `@fastify/static` from [v8.3 to v9.0](https://github.com/fastify/fastify-static/compare/v8.3.0...v9.0.0) and `fastify` from [v5.6 to 5.7](https://github.com/fastify/fastify/compare/v5.6.2...v5.7.1).

## 0.4.13

### Patch Changes

- [`722069d`](https://github.com/friedemannsommer/astro-node-fastify/commit/722069dc0227530d9667c37cd5c7e747445aa6fb) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Update Astro to 5.16 and adjust Astro peer dependency range

## 0.4.12

### Patch Changes

- [`4e2a567`](https://github.com/friedemannsommer/astro-node-fastify/commit/4e2a5671ed8564ce2911f366f5c1856166d0558a) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Bumped Astro peer dependency to v5.15

## 0.4.11

### Patch Changes

- [`335f99f`](https://github.com/friedemannsommer/astro-node-fastify/commit/335f99f32616b791d14f19f1a8f85748e85c924f) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated Astro to v5.14 and Fastify to v5.6

## 0.4.10

### Patch Changes

- [`cb3429a`](https://github.com/friedemannsommer/astro-node-fastify/commit/cb3429a0b050150d31efa5c8e28a0e56ce7e261f) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated Astro peer dependency range to include v5.13

## 0.4.9

### Patch Changes

- [`33d7567`](https://github.com/friedemannsommer/astro-node-fastify/commit/33d75671618fd67ad12de740b80f7765d88cb342) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - update Astro peer dependency range to 5.12

## 0.4.8

### Patch Changes

- [`10fa305`](https://github.com/friedemannsommer/astro-node-fastify/commit/10fa30523d8a1624727ed121b3e4ba93e97de203) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted the peer dependency range for Astro to include version 5.11.

## 0.4.7

### Patch Changes

- [`e1df3fd`](https://github.com/friedemannsommer/astro-node-fastify/commit/e1df3fde0eaf7d027922675d533f27243d458930) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted the peer dependency range for Astro to include version 5.10.

## 0.4.6

### Patch Changes

- [`c7646d0`](https://github.com/friedemannsommer/astro-node-fastify/commit/c7646d0adbe3e72425ea794fcfc6e4e1f5bc77b5) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted the peer dependency range for Astro to include version 5.9.

## 0.4.5

### Patch Changes

- [`51ff196`](https://github.com/friedemannsommer/astro-node-fastify/commit/51ff19605bcb4cb525e0fae49650af3bd256c586) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted `astro` peerDependencies range to support version 5.8.

## 0.4.4

### Patch Changes

- [`faf68df`](https://github.com/friedemannsommer/astro-node-fastify/commit/faf68dfff726548649e5debc70e78655f674ad8c) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted the peer dependency range for Astro to include version 5.7 and updated Fastify to resolve [`CVE-2025-32442`](https://github.com/advisories/GHSA-mg2h-6x62-wpwc).

## 0.4.3

### Patch Changes

- [`3b1fe35`](https://github.com/friedemannsommer/astro-node-fastify/commit/3b1fe35ba031e4b2dde7d98bb5ea8957f7e222a9) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted the peer dependency range for Astro to include version 5.6.

## 0.4.2

### Patch Changes

- [`95a5243`](https://github.com/friedemannsommer/astro-node-fastify/commit/95a52434468e374c6798e4fce27b3a2ec4174528) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Adjusted the peer dependency range for Astro to include version 5.5.

## 0.4.1

### Patch Changes

- [`c42347c`](https://github.com/friedemannsommer/astro-node-fastify/commit/c42347cc1974ded8c29a03dc4472a4bf4b6eca6d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Extended Astro peer dependency range to support versions up to 5.4.

## 0.4.0

### Minor Changes

- [`2909ad7`](https://github.com/friedemannsommer/astro-node-fastify/commit/f66ad601df156eb42f58a7e5d200bf5d332d20c9) Thanks [@ah-hn](https://github.com/ah-hn)! - Increased `max-age` for statis assets to one year ([#180](https://github.com/friedemannsommer/astro-node-fastify/pull/180))

## 0.3.1

### Patch Changes

- [`3f549bf`](https://github.com/friedemannsommer/astro-node-fastify/commit/3f549bff0e6fc3acb7118a6f770807b87053d33d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Upgraded Astro dependency to v5.3

## 0.3.0

### Minor Changes

- [#169](https://github.com/friedemannsommer/astro-node-fastify/pull/169) [`409090f`](https://github.com/friedemannsommer/astro-node-fastify/commit/409090fc07d39c72c830df66ec7967d0d6c93f29) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Added `dotPrefixes` option to allow serving dot files. (Defaults to `/.well-known`)

## 0.2.2

### Patch Changes

- [`67c473b`](https://github.com/friedemannsommer/astro-node-fastify/commit/67c473ba91457d51b45364c754235ac4f555d4ec) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated `astro` peer dependency range to include compatibility with version 5.2.

## 0.2.1

### Patch Changes

- [`0977a8f`](https://github.com/friedemannsommer/astro-node-fastify/commit/0977a8f47de1da361efa81315b0fcfe4836270e7) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated dependencies

- [`0977a8f`](https://github.com/friedemannsommer/astro-node-fastify/commit/0977a8f47de1da361efa81315b0fcfe4836270e7) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Added upper minor version constraint for Astro peer dependency

## 0.2.0

### Minor Changes

- [`7cfcbe9`](https://github.com/friedemannsommer/astro-node-fastify/commit/7cfcbe9d4a4ff3fabd9e2d6784d95815b2d4124e) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Upgraded Astro to v5

## 0.1.1

### Patch Changes

- [`8b64c40`](https://github.com/friedemannsommer/astro-node-fastify/commit/8b64c403cefb9e651e040e5f08b65b5dbfb055a3) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Removed default `cacheControl` header for assets

## 0.1.0

### Minor Changes

- [`01fc051`](https://github.com/friedemannsommer/astro-node-fastify/commit/01fc051cce28b22cc823f8c89885c459eabfa773) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Upgraded Fastify from v4 to v5

## 0.0.16

### Patch Changes

- [`16eecf3`](https://github.com/friedemannsommer/astro-node-fastify/commit/16eecf3645a8a1e2cb0730375fd8ee57f0967e2a) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Fixed server path resolution to use the path to the parent directory instead of the caller file path.

## 0.0.15

### Patch Changes

- [`e9c72dd`](https://github.com/friedemannsommer/astro-node-fastify/commit/e9c72dd88ca4aebefa65f16fdb5b000bc46caa9b) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Normalized file paths in stack trace handling.

## 0.0.14

### Patch Changes

- [`a94d5f2`](https://github.com/friedemannsommer/astro-node-fastify/commit/a94d5f29eccc9b8c8e6ffbb35e03be5467c07a86) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Introduced a new mechanism to resolve server paths to be able to correctly resolve relative client paths.

## 0.0.13

### Patch Changes

- [`3f8c4f8`](https://github.com/friedemannsommer/astro-node-fastify/commit/3f8c4f83f1fb643fbac2d58530b370e1556a84d8) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated package license from ISC to MIT.

## 0.0.12

### Patch Changes

- [`b60d78d`](https://github.com/friedemannsommer/astro-node-fastify/commit/b60d78dde3613ea4d735d524bf4099babbf5a704) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - fixed static assets path generation

## 0.0.11

### Patch Changes

- [`26771d2`](https://github.com/friedemannsommer/astro-node-fastify/commit/26771d2394dc213947f292c14999d1498b9c6ded) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - updated client assets handling to use a relative path

## 0.0.10

### Patch Changes

- [`87fc28a`](https://github.com/friedemannsommer/astro-node-fastify/commit/87fc28acbaa7d3183b982dfeee90cd2a06071022) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - updated server to prevent request body parsing by Fastify, so that Astro can parse it as expected.

## 0.0.9

### Patch Changes

- [`5987f28`](https://github.com/friedemannsommer/astro-node-fastify/commit/5987f28ca2c931405ea436c76f703dfde8f03b02) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - fixed boolean value parsing for runtime config. they will no longer override adapter options.

- [`e707f2b`](https://github.com/friedemannsommer/astro-node-fastify/commit/e707f2b4f130bfba55c6b748a7866566fdfae5a6) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - updated documentation to include the default values for `connectionTimeout`, `gracefulTimeout`, `http2`, and `requestIdHeader`

## 0.0.8

### Patch Changes

- [`b5649ac`](https://github.com/friedemannsommer/astro-node-fastify/commit/b5649acea489d3652c15cf0c7b3342a59e78111c) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - fixed `request` and `server` runtime config overriding adapter options

## 0.0.7

### Patch Changes

- [`7322b17`](https://github.com/friedemannsommer/astro-node-fastify/commit/7322b174ef099d91da45d59aa0a27373ea33a806) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - fixed runtime config generation to include `cache` from adapter options

## 0.0.6

### Patch Changes

- [`2498520`](https://github.com/friedemannsommer/astro-node-fastify/commit/24985205bc2c1effbe09ae648d815632294e5f81) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - fixed typings so that they can be included in the package dist.

## 0.0.5

### Patch Changes

- [`c53397b`](https://github.com/friedemannsommer/astro-node-fastify/commit/c53397b36317880ba0c129dc398a30f1d60afb2f) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - an empty `HOST` or `PORT` value will no longer overwrite the build-time server options

## 0.0.4

### Patch Changes

- [`cd76420`](https://github.com/friedemannsommer/astro-node-fastify/commit/cd76420e22a536d4ea9e88f831d5c0a196e7711d) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - changed listen port to explicitly fall back to `0`

## 0.0.3

### Patch Changes

- [`152c8c2`](https://github.com/friedemannsommer/astro-node-fastify/commit/152c8c27900d30169b91377653cf13796484fccb) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - fixed environment config usage for log level, socket, host, and port

## 0.0.2

### Patch Changes

- [`457d78c`](https://github.com/friedemannsommer/astro-node-fastify/commit/457d78c2b2ea86c00e0e0ccc52403e690fd5592c) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - updated package exports to use "default" instead of "import"

- [`71a57ca`](https://github.com/friedemannsommer/astro-node-fastify/commit/71a57ca3e66e595eb06ac77dcdcb13a4285a264a) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - replaced `console.error` with `logger.error` for the Astro config validation.
