import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";

const isTest = Boolean(process.env.TEST);

const plugins = [
  nodeResolve({
    preferBuiltins: true,
    extensions: [".js", ".ts"],
  }),
  commonjs(),
  json(),
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
];

if (isTest) {
  plugins.push(
    copy({
      targets: [
        {
          src: "dist/index.js",
          dest: "lambda",
          rename: "handler.js",
        },
      ],
      hook: "writeBundle",
    })
  );
}

export default {
  input: "src/handler.ts",
  output: {
    format: "cjs",
    file: "dist/index.js",
  },
  preserveModules: false,
  plugins,
};
