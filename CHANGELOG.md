# astro-node-fastify

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