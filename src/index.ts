import { tryThen } from "@samual/lib/tryThen"

export const encodeString = (string: string) =>
	btoa(string).replaceAll(`=`, ``).replaceAll(`+`, `*`).replaceAll(`/`, `-`)

export const decodeString = (string: string) => atob(string.replaceAll(`*`, `+`).replaceAll(`-`, `/`))

/** @example
  * // client
  * const cookies = parseCookies(document.cookie)
  *
  * console.log(cookies.get("foo")) // "bar"
  *
  * @example
  * // server
  * const cookies = parseCookies(request.headers.get("cookie"))
  *
  * console.log(cookies.get("foo")) // "bar" */
export function parseCookies(cookies: string | undefined | null): Map<string, string> {
	const parsedCookies = new Map<string, string>

	if (cookies) {
		for (const cookie of cookies.split(`; `)) {
			const index = cookie.indexOf(`=`)

			if (index == -1)
				tryThen(() => decodeString(cookie), value => parsedCookies.set(``, value))
			else {
				tryThen(
					() => [ decodeString(cookie.slice(0, index)), decodeString(cookie.slice(index + 1)) ],
					([ key, value ]) => parsedCookies.set(key, value)
				)
			}
		}
	}

	return parsedCookies
}

/** @example
  * // client
  * document.cookie = setCookie("foo", "bar")
  *
  * @example
  * // server
  * response.headers.set("set-cookie", setCookie("foo", "bar")) */
export const setCookie = (name: string, value: string, options?: { attributes?: `;${string}` | undefined }): string =>
	`${encodeString(name)}=${encodeString(value)}${options?.attributes || `;max-age=31536000;path=/;sameSite=lax`}`

/** @example
  * // client
  * document.cookie = deleteCookie("foo")
  *
  * @example
  * // server
  * response.headers.set("set-cookie", deleteCookie("foo")) */
export const deleteCookie = (name: string): string => `${encodeString(name)}=;max-age=0;path=/;sameSite=lax`
