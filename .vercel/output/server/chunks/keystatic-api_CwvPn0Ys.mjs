import { r as __exportAll, t as __commonJSMin } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as keystatic_config_default } from "./keystatic.config_i7dJ4Uyp.mjs";
import { makeGenericAPIRouteHandler } from "@keystatic/core/api/generic";
//#endregion
//#region node_modules/.pnpm/@keystatic+astro@5.2.0_@key_be0c0e508d7ca750c572bb98f5fce304/node_modules/@keystatic/astro/dist/keystatic-astro-api.js
var import_set_cookie = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isForbiddenKey(key) {
		return typeof key !== "string" || key in {};
	}
	function createNullObj() {
		return Object.create(null);
	}
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (isForbiddenKey(name)) return null;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.", e);
		}
		var cookie = createNullObj();
		cookie.name = name;
		cookie.value = value;
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			if (isForbiddenKey(key)) return;
			var value = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value);
			else if (key === "max-age") {
				var n = parseInt(value, 10);
				if (!Number.isNaN(n)) cookie.maxAge = n;
			} else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value;
			else if (key === "partitioned") cookie.partitioned = true;
			else if (key) cookie[key] = value;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) {
			if (!options.map) return [];
			else return createNullObj();
		}
		if (input.headers) {
			if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
			else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
			else {
				var sch = input.headers[Object.keys(input.headers).find(function(key) {
					return key.toLowerCase() === "set-cookie";
				})];
				if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
				input = sch;
			}
		}
		if (!Array.isArray(input)) input = [input];
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		}).filter(Boolean);
		else {
			var cookies = createNullObj();
			return input.filter(isNonEmptyString).reduce(function(cookies, str) {
				var cookie = parseString(str, options);
				if (cookie && !isForbiddenKey(cookie.name)) cookies[cookie.name] = cookie;
				return cookies;
			}, cookies);
		}
	}
	function splitCookiesString(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString;
})))();
function makeHandler(_config) {
	return async function keystaticAPIRoute(context) {
		var _context$locals, _ref, _config$clientId, _ref2, _config$clientSecret, _ref3, _config$secret;
		const envVarsForCf = (_context$locals = context.locals) === null || _context$locals === void 0 || (_context$locals = _context$locals.runtime) === null || _context$locals === void 0 ? void 0 : _context$locals.env;
		const { body, headers, status } = await makeGenericAPIRouteHandler({
			..._config,
			clientId: (_ref = (_config$clientId = _config.clientId) !== null && _config$clientId !== void 0 ? _config$clientId : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_ID) !== null && _ref !== void 0 ? _ref : tryOrUndefined(() => {}),
			clientSecret: (_ref2 = (_config$clientSecret = _config.clientSecret) !== null && _config$clientSecret !== void 0 ? _config$clientSecret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_SECRET) !== null && _ref2 !== void 0 ? _ref2 : tryOrUndefined(() => {}),
			secret: (_ref3 = (_config$secret = _config.secret) !== null && _config$secret !== void 0 ? _config$secret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_SECRET) !== null && _ref3 !== void 0 ? _ref3 : tryOrUndefined(() => {})
		}, { slugEnvName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG" })(context.request);
		let headersInADifferentStructure = /* @__PURE__ */ new Map();
		if (headers) {
			if (Array.isArray(headers)) for (const [key, value] of headers) {
				if (!headersInADifferentStructure.has(key.toLowerCase())) headersInADifferentStructure.set(key.toLowerCase(), []);
				headersInADifferentStructure.get(key.toLowerCase()).push(value);
			}
			else if (typeof headers.entries === "function") {
				for (const [key, value] of headers.entries()) headersInADifferentStructure.set(key.toLowerCase(), [value]);
				if ("getSetCookie" in headers && typeof headers.getSetCookie === "function") {
					const setCookieHeaders2 = headers.getSetCookie();
					if (setCookieHeaders2 !== null && setCookieHeaders2 !== void 0 && setCookieHeaders2.length) headersInADifferentStructure.set("set-cookie", setCookieHeaders2);
				}
			} else for (const [key, value] of Object.entries(headers)) headersInADifferentStructure.set(key.toLowerCase(), [value]);
		}
		const setCookieHeaders = headersInADifferentStructure.get("set-cookie");
		headersInADifferentStructure.delete("set-cookie");
		if (setCookieHeaders) for (const setCookieValue of setCookieHeaders) {
			var _options$sameSite;
			const { name, value, ...options } = (0, import_set_cookie.parseString)(setCookieValue);
			const sameSite = (_options$sameSite = options.sameSite) === null || _options$sameSite === void 0 ? void 0 : _options$sameSite.toLowerCase();
			context.cookies.set(name, value, {
				domain: options.domain,
				expires: options.expires,
				httpOnly: options.httpOnly,
				maxAge: options.maxAge,
				path: options.path,
				sameSite: sameSite === "lax" || sameSite === "strict" || sameSite === "none" ? sameSite : void 0
			});
		}
		return new Response(body, {
			status,
			headers: [...headersInADifferentStructure.entries()].flatMap(([key, val]) => val.map((x) => [key, x]))
		});
	};
}
function tryOrUndefined(fn) {
	try {
		return fn();
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/.pnpm/@keystatic+astro@5.2.0_@key_be0c0e508d7ca750c572bb98f5fce304/node_modules/@keystatic/astro/internal/keystatic-api.js
var keystatic_api_exports = /* @__PURE__ */ __exportAll({
	ALL: () => ALL,
	all: () => all,
	prerender: () => false
});
var all = makeHandler({ config: keystatic_config_default });
var ALL = all;
//#endregion
//#region \0virtual:astro:page:node_modules/.pnpm/@keystatic+astro@5.2.0_@key_be0c0e508d7ca750c572bb98f5fce304/node_modules/@keystatic/astro/internal/keystatic-api@_@js
var page = () => keystatic_api_exports;
//#endregion
export { page };
