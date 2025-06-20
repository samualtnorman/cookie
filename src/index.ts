import type { LaxPartial } from "@samual/lib"

function assertValidCookieName(name: string) {
	if (!/^[!#-+-.\d^-z|~]+$/i.test(name))
		throw SyntaxError(`Invalid cookie name`)
}

/**
 * Parse a [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie) string into a
 * [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
 * @example Client Example
 * ```ts
 * const cookies = parseCookies(document.cookie)
 * console.log(cookies.get("foo")) // "bar"
 * ```
 * @example Server Example
 * ```ts
 * const cookies = parseCookies(request.headers.get("cookie"))
 * console.log(cookies.get("foo")) // "bar"
 * ```
 */
export function parseCookies(cookies: string | undefined | null): Map<string, string> {
	const parsedCookies = new Map<string, string>()

	if (cookies) {
		for (const cookie of cookies.split(`; `)) {
			const index = cookie.indexOf(`=`)

			if (index == -1) {
				parsedCookies.set(``, cookie)
			} else
				parsedCookies.set(cookie.slice(0, index), cookie.slice(index + 1))
		}
	}

	return parsedCookies
}

/**
 * Create a [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) string.
 * Both the cookie name and value must be valid or a
 * [`SyntaxError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError) will be
 * thrown.
 * @example Client Example
 * ```ts
 * document.cookie = setCookie("foo", "bar")
 * ```
 * @example Server Example
 * ```ts
 * response.headers.set("set-cookie", setCookie("foo", "bar"))
 * ```
 */
export function setCookie(
	name: string,
	value: string,
	options?: LaxPartial<{ attributes: `;${string}` }>
): string {
	assertValidCookieName(name)

	if (!/^(?:[!#-+--:<-[\]-~]*)|(?:"[!#-+--:<-[\]-~]*")$/.test(value))
		throw SyntaxError(`Invalid cookie value`)

	return `${name}=${value}${options?.attributes || `;max-age=31536000;path=/;sameSite=lax`}`
}

/**
 * Create a [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) string.
 * The cookie name must be valid or a
 * [`SyntaxError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError) will be
 * thrown.
 * @example Client Example
 * ```ts
 * document.cookie = deleteCookie("foo")
 * ```
 * @example Server Example
 * ```ts
 * response.headers.set("set-cookie", deleteCookie("foo"))
 * ```
 */
export function deleteCookie(name: string): string {
	assertValidCookieName(name)

	return `${name}=;max-age=0;path=/;sameSite=lax`
}
