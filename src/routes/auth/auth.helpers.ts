import { CONFIG } from "@/config";
import type { TJWTPayload } from "@/helpers/types";
import type { TUser } from "@/models";
import { getUnixTime } from "date-fns";
import { sign } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";

export const generateJwtTokens = async (id: TUser["id"]) => {
	const currentTimeInSeconds = getUnixTime(new Date());

	const accessTokenPayload: TJWTPayload = {
		id,
		exp: currentTimeInSeconds + CONFIG.JWT_EXPIRES_IN,
		iat: currentTimeInSeconds,
	};
	const refreshTokenPayload: TJWTPayload = {
		id,
		exp: currentTimeInSeconds + CONFIG.JWT_REFRESH_EXPIRES_IN,
		iat: currentTimeInSeconds,
	};

	const [accessToken, refreshToken] = await Promise.all([sign(accessTokenPayload, CONFIG.JWT_SECRET), sign(refreshTokenPayload, CONFIG.JWT_REFRESH_SECRET)]);

	return { accessToken, refreshToken };
};

export const setCookieOptions: Record<"accessToken" | "refreshToken", CookieOptions> = {
	accessToken: {
		httpOnly: true,
		secure: CONFIG.IsProd,
		sameSite: "strict",
		maxAge: CONFIG.JWT_EXPIRES_IN,
	},
	refreshToken: {
		httpOnly: true,
		secure: CONFIG.IsProd,
		sameSite: "strict",
		maxAge: CONFIG.JWT_REFRESH_EXPIRES_IN,
	},
};
