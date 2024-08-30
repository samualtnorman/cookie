import { tryCatch } from "@samual/lib/tryCatch"
import * as v from "valibot"
import type { parseCookies } from "."
import * as Cookie from "."

export type CookieOptions<T extends v.GenericSchema> = { name: string, schema: T, attributes?: `;${string}` | undefined }

/** Make a {@link CookieOptions} object for use with {@link getCookie}, {@link setCookie}, and {@link deleteCookie}.
  * The schema should be compatible with [JSON](https://developer.mozilla.org/en-US/docs/Glossary/JSON) meaning only
  * [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null),
  * [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type)s,
  * [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#number_type)s,
  * [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type)s,
  * [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)s, and
  * [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)s can be used.
  * @example
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) }) */
export const makeCookieOptions = <T extends v.GenericSchema>(options: CookieOptions<T>) => options

/** @example
  * // client
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
  * const cookies = parseCookies(document.cookie)
  * const myCookie = getCookie(cookies, MyCookie)
  *
  * console.log(myCookie) // { foo: "bar" }
  * @example
  * // server
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
  * const cookies = parseCookies(request.headers.get("cookie"))
  * const myCookie = getCookie(cookies, MyCookie)
  *
  * console.log(myCookie) // { foo: "bar" }
  * @param cookies Returned value of {@link parseCookies}. */
export function getCookie<
	T extends v.GenericSchema
>(cookies: Map<string, string>, options: CookieOptions<T>): v.InferOutput<T> | undefined {
	const cookie = cookies.get(options.name)

	if (cookie) {
		const result = v.safeParse(options.schema, tryCatch(() => JSON.parse(cookie)))

		if (result.success)
			return result.output
	}
}

/** @example
  * // client
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
  *
  * document.cookie = setCookie(MyCookie, { foo: "bar" })
  *
  * @example
  * // server
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
  *
  * response.headers.set("set-cookie", setCookie(MyCookie, { foo: "bar" })) */
export const setCookie = <T extends v.GenericSchema>(options: CookieOptions<T>, value: v.InferOutput<T>): string =>
	value === undefined
		? Cookie.deleteCookie(options.name)
		: Cookie.setCookie(options.name, JSON.stringify(value), options)

/** @example
  * // client
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
  *
  * document.cookie = deleteCookie(MyCookie)
  *
  * @example
  * // server
  * const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
  *
  * response.headers.set("set-cookie", deleteCookie(MyCookie)) */
export const deleteCookie = <T extends v.GenericSchema>(options: CookieOptions<T>): string =>
	Cookie.deleteCookie(options.name)
