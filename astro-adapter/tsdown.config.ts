import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/preview.ts", "src/entrypoint.ts"],
  dts: true,
  attw: {
    enabled: true,
    profile: "esm-only",
  },
  publint: true,
  unused: true,
  outExtensions: () => ({ dts: ".d.ts" }),
});
