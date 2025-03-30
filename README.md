# Astro Node.js Fastify

> This adapter uses the [Fastify](https://fastify.dev/) web framework which allows [Astro](https://astro.build/) to
> deploy SSR sites to Node.js targets.
> It also compresses asset and SSR responses by default.

[![CI](https://github.com/friedemannsommer/astro-node-fastify/actions/workflows/ci.yml/badge.svg)](https://github.com/friedemannsommer/astro-node-fastify/actions/workflows/ci.yml)
![Node.js runtime support](https://img.shields.io/node/v/astro-node-fastify?style=flat)
[![NPM Version](https://img.shields.io/npm/v/astro-node-fastify?style=flat)](https://www.npmjs.com/package/astro-node-fastify)

## Table of contents

<!-- TOC -->
* [Astro Node.js Fastify](#astro-nodejs-fastify)
  * [Table of contents](#table-of-contents)
  * [Quickstart](#quickstart)
  * [Usage](#usage)
  * [Configuration Example](#configuration-example)
  * [Configuration](#configuration)
  * [Troubleshooting](#troubleshooting)
    * [Common Issues and Solutions](#common-issues-and-solutions)
      * [Compression Not Working](#compression-not-working)
      * [404 Errors for Assets in Dot Files/Directories](#404-errors-for-assets-in-dot-filesdirectories)
      * [Static Assets Not Caching Properly](#static-assets-not-caching-properly)
      * [Server Running Out of Memory](#server-running-out-of-memory)
      * [Issues Behind a Reverse Proxy](#issues-behind-a-reverse-proxy)
    * [Getting Help](#getting-help)
<!-- TOC -->

## Quickstart

1. Install via the package manager of your choice
    * Example via NPM: `npm i --save-prod astro-node-fastify`
    * Or via
      the [Astro CLI](https://docs.astro.build/en/guides/integrations-guide/#automatic-integration-setup):
      `astro add astro-node-fastify`
2. Build your site
3. Either start a [preview](https://docs.astro.build/en/reference/cli-reference/#astro-preview) or
   the [standalone entry](https://docs.astro.build/en/reference/configuration-reference/#buildserverentry).

## Usage

Add this package as a runtime dependency using your preferred package manager.

Once installed, you can customize various aspects of your Astro application through configuration options.
You can specify which assets should be pre-compressed to improve load times,
define appropriate cache headers for files in your Astro "public" directory,
and set default response headers that will apply to all server-side rendered responses.

For instance, you might configure specific cache control settings for static assets or enable particular compression
algorithms like gzip or brotli.

## Configuration Example

```javascript
// astro.config.mjs
import {defineConfig} from 'astro/config';
import nodeFastify from 'astro-node-fastify';

export default defineConfig({
    output: 'server',
    adapter: nodeFastify({
        // Controls whether static assets are pre-compressed at build time (true)
        // or compressed dynamically at runtime (false).
        // Pre-compressing improves performance by avoiding on-the-fly compression.
        preCompressed: true,

        // Specifies which compression algorithms the server should support.
        // Browsers will choose the best available algorithm they support
        // based on the Accept-Encoding header.
        supportedEncodings: ['br', 'gzip'],

        // Configure cache headers for static assets to optimize performance
        // and reduce server load by leveraging browser and CDN caching.
        cache: {
            // Set maximum time (in seconds) that browsers should cache assets
            // 604,800 seconds = 7 days
            maxAge: 604800,

            // Allow CDNs to serve stale content while revalidating in background
            // 86,400 seconds = 24 hours
            staleWhileRevalidate: 86400,

            // Allow serving stale content if origin server errors occur
            // 86,400 seconds = 24 hours
            staleIfError: 86400
        },

        // Set HTTP headers that will be automatically included in responses
        defaultHeaders: {
            // Headers for dynamically generated server-side rendered pages
            ssr: {
                // Prevents MIME-type sniffing security issues
                'X-Content-Type-Options': 'nosniff',

                // Prevents your site from being embedded in iframes on other domains
                // protecting against clickjacking attacks
                'X-Frame-Options': 'SAMEORIGIN'
            },

            // Headers for static assets served from the public directory
            asset: {
                // Prevents MIME-type sniffing security issues
                'X-Content-Type-Options': 'nosniff'
            }
        },

        // Configure the underlying Fastify server behavior
        server: {
            // Enables HTTP request logging for monitoring and debugging
            accessLogging: true,

            // Specifies which IP addresses should be trusted when behind proxies
            // Important for preserving correct client IP addresses in logs and for
            // security features that depend on accurate client identification
            trustProxy: ['127.0.0.1', '::1']
        },

        // Configure which files and directories starting with a dot (.) can be served.
        // The following example shows the default configuration - '/.well-known/' is
        // already included by default, so you only need to specify this option if you
        // want to add additional paths or remove the default.
        dotPrefixes: ['/.well-known/']
    })
});
```

## Configuration

The configuration documentation can be found here:
[https://friedemannsommer.github.io/astro-node-fastify/](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.UserOptions.html).

## Troubleshooting

### Common Issues and Solutions

#### Compression Not Working

**Symptoms**: Assets aren't being compressed as expected, or browsers aren't receiving compressed content.

**Solutions**:

- Make sure you haven't disabled `preCompressed` if you want build-time compression
- Check that your `supportedEncodings` includes the compression algorithms you expect (`br` and/or `gzip`)
- Verify that the client sending requests includes the appropriate `Accept-Encoding` header

#### 404 Errors for Assets in Dot Files/Directories

**Symptoms**: Assets under directories that start with a dot (e.g., `.github/`) are inaccessible.

**Solutions**:

- Add the path prefix to the `dotPrefixes` option (e.g., `['/.custom-directory/', '/.other-directory/']`)
- Note that by default only `/.well-known/` is allowed

#### Static Assets Not Caching Properly

**Symptoms**: Browsers repeatedly download the same static assets instead of using cached versions.

**Solutions**:

- Ensure your `cache` configuration is correctly set with appropriate values
- Check if other headers in your deployment environment (like CDN settings) might be overriding your cache configuration
- Verify that the `Cache-Control` header is being set correctly using browser developer tools

#### Server Running Out of Memory

**Symptoms**: Server crashes with memory-related errors under load.

**Solutions**:

- Consider setting `preCompressed: true` (default) to avoid runtime compression overhead
- If your site has huge assets, you might need to allocate more memory to your Node.js process

#### Issues Behind a Reverse Proxy

**Symptoms**: Client IP addresses are incorrect, or some security features don't work properly.

**Solutions**:

- Configure the `server.trustProxy` setting to properly identify trusted proxy servers
- Ensure your reverse proxy (nginx, Apache, etc.) is correctly configured to pass the required headers:
    - `X-Forwarded-For`: Original client IP address
    - `X-Forwarded-Proto`: Original protocol (http/https)
    - `X-Forwarded-Host`: Original host requested by the client
    - `X-Real-IP`: Alternative client IP header used by some proxies

### Getting Help

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/friedemannsommer/astro-node-fastify/issues) to see if your problem has
   been reported
2. Before opening a new issue:
    - Make sure the issue is related to this adapter specifically, not your Astro project or deployment environment
    - Create a minimal reproduction that isolates the problem to this adapter's functionality
    - Include your adapter configuration and relevant environment details (Node.js version, OS, etc.)

**Support Scope**:

- ✅ Issues with the adapter's core functionality (compression, serving files, caching, etc.)
- ✅ Documentation clarifications or improvements
- ✅ Feature requests specific to the adapter
- ❌ General Astro project issues not specific to this adapter
- ❌ Deployment environment setup (AWS, Vercel, etc.)
- ❌ Custom server configurations beyond this adapter's API

For general Astro help, please use [Astro's Discord](https://astro.build/chat)
or [Stack Overflow](https://stackoverflow.com/questions/tagged/astro).
