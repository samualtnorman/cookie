import { tryCatch } from "@samual/lib/tryCatch"
import { utf8Decoder } from "@samual/lib/utf8Decoder"
import { utf8Encoder } from "@samual/lib/utf8Encoder"
import * as v from "valibot"
import type { parseCookies } from "."
import * as Cookie from "."

export type CookieOptions<T extends v.GenericSchema> = {
	name: string
	schema: T
	attributes?: `;${string}` | undefined
	rawName?: boolean | undefined
	rawValue?: boolean | undefined
}

const encodeString = (string: string) => btoa(String.fromCharCode(...utf8Encoder.encode(string)))
	.replaceAll(`=`, ``).replaceAll(`+`, `-`).replaceAll(`/`, `_`)

const decodeString = (string: string) => utf8Decoder.decode(
	Uint8Array.from(atob(string.replaceAll(`-`, `+`).replaceAll(`_`, `/`)), character => character.charCodeAt(0))
)

/**
Make a {@link CookieOptions} object for use with {@link getCookie}, {@link setCookie}, and {@link deleteCookie}.
The schema should be compatible with [JSON](https://developer.mozilla.org/en-US/docs/Glossary/JSON) meaning only
[`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null),
[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)s,
[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)s,
[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)s,
[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)s, and
[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)s can be used.
@example
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
*/
export const makeCookieOptions = <T extends v.GenericSchema>(options: CookieOptions<T>) => options

/**
@example
// client
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
const cookies = parseCookies(document.cookie)
const myCookie = getCookie(cookies, MyCookie)

console.log(myCookie) // { foo: "bar" }
@example
// server
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
const cookies = parseCookies(request.headers.get("cookie"))
const myCookie = getCookie(cookies, MyCookie)

console.log(myCookie) // { foo: "bar" }
@param cookies Returned value of {@link parseCookies}.
*/
export function getCookie<
	T extends v.GenericSchema
>(cookies: Map<string, string>, options: CookieOptions<T>): v.InferOutput<T> | undefined {
	const cookie = cookies.get(options.rawName ? options.name : encodeString(options.name))

	if (cookie) {
		const result =
			v.safeParse(options.schema, tryCatch(() => JSON.parse(options.rawValue ? cookie : decodeString(cookie))))

		if (result.success)
			return result.output
	}
}

/**
@example
// client
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })

document.cookie = setCookie(MyCookie, { foo: "bar" })

@example
// server
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })

response.headers.set("set-cookie", setCookie(MyCookie, { foo: "bar" }))
*/
export function setCookie<T extends v.GenericSchema>(options: CookieOptions<T>, value: v.InferOutput<T>): string {
	const name = options.rawName ? options.name : encodeString(options.name)

	if (value === undefined)
		return Cookie.deleteCookie(name)

	const json = JSON.stringify(value)

	return Cookie.setCookie(name, options.rawValue ? json : encodeString(json), options)
}

/**
@example
// client
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })

document.cookie = deleteCookie(MyCookie)

@example
// server
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })

response.headers.set("set-cookie", deleteCookie(MyCookie))
*/
export const deleteCookie = <T extends v.GenericSchema>(options: CookieOptions<T>): string =>
	Cookie.deleteCookie(options.rawName ? options.name : encodeString(options.name))
