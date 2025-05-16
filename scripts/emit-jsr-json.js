#!/usr/bin/env node
import { mkdirSync as makeDirectorySync, writeFileSync } from "fs"
import packageJson from "../package.json" with { type: "json" }
import { getExports } from "./lib/exports.js"

const { name, version, license, dependencies } = packageJson

makeDirectorySync("dist", { recursive: true })

const imports = Object.fromEntries(
	Object.entries(dependencies)
		.map(([ name, version ],) => [ name, `${name == `@samual/lib` ? `npm` : `jsr`}:${name}@${version}`, ])
)

writeFileSync(
	"dist/jsr.json",
	JSON.stringify({ name, version, license, exports: await getExports(`.ts`), imports }, undefined, "\t")
)

process.exit()
