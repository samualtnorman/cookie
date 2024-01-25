#!node_modules/.bin/rollup --config
import babelPresetEnv from "@babel/preset-env"
import babelPresetTypescript from "@babel/preset-typescript"
import { babel } from "@rollup/plugin-babel"
import terser from "@rollup/plugin-terser"
import { cpus } from "os"
import packageJson from "./package.json" assert { type: "json" }

/** @typedef {import("rollup").RollupOptions} RollupOptions */
/** @typedef {import("@babel/preset-env").Options} BabelPresetEnvOptions */

/** @type {RollupOptions} */ export default {
	external: Object.keys(packageJson.dependencies).map(name => new RegExp(`^${name}(?:$|/)`)),
	input: "src/index.ts",
	output: { dir: "dist" },
	plugins: [
		babel({
			babelHelpers: "bundled",
			extensions: [ ".ts" ],
			presets: [
				[ babelPresetEnv, /** @satisfies {BabelPresetEnvOptions} */ ({ targets: { node: "18.19" } }) ],
				babelPresetTypescript
			]
		}),
		terser({ keep_fnames: true, compress: { passes: Infinity }, maxWorkers: Math.floor(cpus().length / 2) })
	],
	strictDeprecations: true,
	treeshake: { moduleSideEffects: false }
}
