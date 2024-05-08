import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import zip from "rollup-plugin-zip";

const isZip = Boolean(process.env.ZIP);
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

if (isZip) {
  plugins.push(
    zip({
      file: "./handler.zip",
    })
  );
}

if (isTest) {
  plugins.push(
    copy({
      targets: [
        {
          src: "dist/handler.js",
          dest: "lambda",
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
    dir: "dist",
  },
  preserveModules: false,
  plugins,
};
