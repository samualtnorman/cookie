# Cookie
Set and get cookies with optional type validation with a [Valibot](https://valibot.dev/) schema.

Requires Node.js 18.19.0 or later.

## Install
```sh
npm install @samual/cookie
```

## Usage
### Non Validated Cookies
#### In the Client
```js
import { parseCookies, setCookie, deleteCookie } from "@samual/cookie"

// parse cookies
const cookies = parseCookies(document.cookie)
// get a cookie
console.log(cookies.get("foo")) // "bar"
// set a cookie
document.cookie = setCookie("foo", "baz")
// delete a cookie
document.cookie = deleteCookie("foo")
```

#### On the Server
```js
import { parseCookies, setCookie, deleteCookie } from "@samual/cookie"

// ...
// in request handling code:

// parse cookies
const cookies = parseCookies(request.headers.get("cookie"))
// get a cookie
console.log(cookies.get("foo")) // "bar"
// set a cookie
response.headers.set("set-cookie", setCookie("foo", "baz"))
// delete a cookie
response.headers.set("set-cookie", deleteCookie("foo"))
```

### Validated Cookies
#### In the Client
```js
import { parseCookies } from "@samual/cookie"
import { getCookie, setCookie, deleteCookie } from "@samual/cookie/typed"

// set up cookie name and schema
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })
// parse cookies
const cookies = parseCookies(document.cookie)
// get a cookie
console.log(getCookie(cookies, MyCookie)) // { foo: "bar" }
// set a cookie
document.cookie = setCookie(MyCookie, { foo: "baz" })
// delete a cookie
document.cookie = deleteCookie(MyCookie)
```

#### On the Server
```js
import { parseCookies } from "@samual/cookie"
import { getCookie, setCookie, deleteCookie } from "@samual/cookie/typed"

// set up cookie name and schema
const MyCookie = makeCookieOptions({ name: "<unique name>", schema: v.object({ foo: v.string() }) })

// ...
// in request handling code:

// parse cookies
const cookies = parseCookies(request.headers.get("cookie"))
// get a cookie
console.log(getCookie(cookies, MyCookie)) // { foo: "bar" }
// set a cookie
response.headers.set("set-cookie", setCookie(MyCookie, { foo: "baz" }))
// delete a cookie
response.headers.set("set-cookie", deleteCookie(MyCookie))
```
