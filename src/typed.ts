import { tryCatch } from "@samual/lib/tryCatch"
import { utf8Decoder } from "@samual/lib/utf8Decoder"
import { utf8Encoder } from "@samual/lib/utf8Encoder"
import type { StandardSchemaV1 } from "@standard-schema/spec"
import { SchemaError } from "@standard-schema/utils"
import type { parseCookies } from "./index"
import * as Cookie from "./index"

/**
 * A cookie options object produced by {@linkcode makeCookieOptions()}.
 */
export type CookieOptions<T extends StandardSchemaV1> = {
	/** If `rawName` is not set to `true`, `name` can be any string as it'll be base64url encoded. */
	name: string
	/**
	 * Must be a [Standard Schema](https://standardschema.dev/#what-schema-libraries-implement-the-spec) that is
	 * compatible with JSON.
	 * @see {@linkcode makeCookieOptions()}
	 */
	schema: T
	/**
	 * Additional attributes to append to
	 * [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) strings created.
	 */
	attributes?: `;${string}` | undefined
	/**
	 * If set to `true`, the `name` will not be base64url'd. This means the given `name` must be a valid cookie name or
	 * a `SyntaxError` will be thrown.
	 */
	rawName?: boolean | undefined
	/**
	 * If set to `true`, this should only be used when `schema` is a string schema or strange or broken behaviour is
	 * likely to be seen.
	 */
	rawValue?: boolean | undefined
}

const encodeString = (string: string) => btoa(String.fromCharCode(...utf8Encoder.encode(string)))
	.replaceAll(`=`, ``).replaceAll(`+`, `-`).replaceAll(`/`, `_`)

const decodeString = (string: string) => utf8Decoder.decode(
	Uint8Array.from(atob(string.replaceAll(`-`, `+`).replaceAll(`_`, `/`)), character => character.charCodeAt(0))
)

/**
 * Make a {@linkcode CookieOptions} object for use with {@linkcode getCookie()}, {@linkcode setCookie()}, and
 * {@linkcode deleteCookie()}.
 * The schema should be compatible with [JSON](https://developer.mozilla.org/en-US/docs/Glossary/JSON) meaning only
 * [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null),
 * [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)s,
 * [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)s,
 * [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)s,
 * [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)s, and
 * [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)s can be used.
 * @example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 * ```
 */
export const makeCookieOptions = <T extends StandardSchemaV1>(options: CookieOptions<T>) => options

/**
 * Get the validated value from the cookie
 * [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) given by
 * {@linkcode parseCookies()}.
 * @example Client Example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 * const cookies = parseCookies(document.cookie)
 * const myCookie = getCookie(cookies, MyCookie)
 *
 * console.log(myCookie) // { foo: "bar" }
 * ```
 * @example Server Example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 * const cookies = parseCookies(request.headers.get("cookie"))
 * const myCookie = getCookie(cookies, MyCookie)
 *
 * console.log(myCookie) // { foo: "bar" }
 * ```
 * @param cookies Returned value of {@linkcode parseCookies()}.
 */
export function getCookie<
	T extends StandardSchemaV1
>(cookies: Map<string, string>, options: CookieOptions<T>): StandardSchemaV1.InferOutput<T> | undefined {
	const cookie = cookies.get(options.rawName ? options.name : encodeString(options.name))

	if (cookie) {
		const result = options.schema["~standard"].validate(tryCatch(() => JSON.parse(options.rawValue ? cookie : decodeString(cookie))))

		if (result instanceof Promise) {
			console.error(`Caught`, TypeError(`Schema validation must be synchronous`))

			return
		}

		if (result.issues) {
			console.error(`Caught`, new SchemaError(result.issues))

			return
		}

		return result.value
	}
}

/**
 * Create a [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) string for
 * the given options object and from the given value.
 * @example Client Example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 *
 * document.cookie = setCookie(MyCookie, { foo: "bar" })
 * ```
 * @example Server Example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 *
 * response.headers.set("set-cookie", setCookie(MyCookie, { foo: "bar" }))
 * ```
 */
export function setCookie<T extends StandardSchemaV1>(
	options: CookieOptions<T>,
	value: StandardSchemaV1.InferInput<T> | undefined
): string {
	const name = options.rawName ? options.name : encodeString(options.name)

	if (value === undefined)
		return Cookie.deleteCookie(name)

	const json = JSON.stringify(value)

	return Cookie.setCookie(name, options.rawValue ? json : encodeString(json), options)
}

/**
 * Create a [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) string for
 * the given options object.
 * @example Client Example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 *
 * document.cookie = deleteCookie(MyCookie)
 * ```
 * @example Server Example
 * ```ts
 * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: z.object({ foo: z.string() }) })
 *
 * response.headers.set("set-cookie", deleteCookie(MyCookie))
 * ```
 */
export const deleteCookie = <T extends StandardSchemaV1>(options: CookieOptions<T>): string =>
	Cookie.deleteCookie(options.rawName ? options.name : encodeString(options.name))
