import { Options } from "tsup";

export const tsup: Options = {
  target: "es2017",
  clean: true,
  dts: false,
  entry: ["src"],
  keepNames: true,
  minify: true,
  sourcemap: true,
  format: ["cjs"],
};
