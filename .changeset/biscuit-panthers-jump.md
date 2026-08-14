---
"astro-node-fastify": patch
---

Fix the client assets path resolution when starting the standalone entry (`node <build directory>/entry.mjs`) without an explicit `serverPath` override.
