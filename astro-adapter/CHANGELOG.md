# astro-node-fastify

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
