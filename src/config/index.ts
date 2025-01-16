export * from "./env";

export const COOKIES = {
	ACCESS_TOKEN: "access_token",
	REFRESH_TOKEN: "refresh_token",
};

export const UNPROTECTED_ROUTES_REGEX = /^\/(docs|auth\/(login|register)|health|$)/;
