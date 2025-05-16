import { findFiles } from "@samual/lib/findFiles"

export const getExports = async (/** @type {string} */ fileExtension) => ({
	".": `./index${fileExtension}`,
	...Object.fromEntries(
		(await findFiles(`dist`))
			.filter(path => path != `dist/index${fileExtension}` && path.endsWith(fileExtension))
			.map(path => [ `.${path.slice(4, -3)}`, `.${path.slice(4)}` ])
	)
})
