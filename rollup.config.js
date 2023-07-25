import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/viewer-request.ts",
  output: {
    format: "cjs",
    dir: "dist",
  },
  preserveModules: false,
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      extensions: [".js", ".ts"],
    }),
    commonjs(),
    json(),
    copy({
      targets: [
        {
          src: "src/bundle.json",
          dest: "dist",
        },
      ],
    }),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "bundled",
      extensions: [".js", ".ts"],
      presets: ["@babel/preset-env", "@babel/preset-typescript"],
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
