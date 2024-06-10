# Astro Node.js Fastify

> This adapter uses the [Fastify](https://fastify.dev/) web framework that allows [Astro](https://astro.build/) to
> deploy SSR sites to Node.js targets.
> It also uses comes with response compression which is enabled by default.

[![CI](https://github.com/friedemannsommer/astro-node-fastify/actions/workflows/ci.yml/badge.svg)](https://github.com/friedemannsommer/astro-node-fastify/actions/workflows/ci.yml)
![Node.js runtime support](https://img.shields.io/node/v/astro-node-fastify?style=flat)
![NPM Version](https://img.shields.io/npm/v/astro-node-fastify?style=flat)

## Table of contents

<!-- TOC -->
* [Astro Node.js Fastify](#astro-nodejs-fastify)
  * [Table of contents](#table-of-contents)
  * [Quickstart](#quickstart)
  * [Usage](#usage)
  * [Configuration](#configuration)
<!-- TOC -->

## Quickstart

1. Install via the package manager of your choice
    * Example via NPM: `npm i --save-prod astro-node-fastify`
    * Or via
      the [Astro CLI](https://docs.astro.build/en/guides/integrations-guide/#automatic-integration-setup): `astro add astro-node-fastify`
2. Build your site
3. Either start a [preview](https://docs.astro.build/en/reference/cli-reference/#astro-preview) or
   run [standalone entry](https://docs.astro.build/en/reference/configuration-reference/#buildserverentry).

## Usage

Install this package as a runtime dependency with the package manager of your choice.
Afterward, you can configure which assets will be pre compressed, which cache headers
the "[public](https://docs.astro.build/en/basics/project-structure/#public)" should have, the default response headers
that every SSR response should have, which compression algorithms should be available, and some more tweaks.

## Configuration

The configuration documentation can be found here:
[https://friedemannsommer.github.io/astro-node-fastify/](https://friedemannsommer.github.io/astro-node-fastify/development/interfaces/_internal_.UserOptions.html).
