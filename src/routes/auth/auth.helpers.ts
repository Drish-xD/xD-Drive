import { getUnixTime } from "date-fns";
import { sign } from "hono/jwt";
import type { CookieOptions } from "hono/utils/cookie";
import { CONFIG } from "@/config";
import type { TJWTPayload } from "@/helpers/types";
import type { TUser } from "@/models";

export const generateJwtTokens = async (id: TUser["id"]) => {
	const currentTimeInSeconds = getUnixTime(new Date());

	const accessTokenPayload: TJWTPayload = {
		exp: currentTimeInSeconds + CONFIG.JWT_EXPIRES_IN,
		iat: currentTimeInSeconds,
		id,
	};
	const refreshTokenPayload: TJWTPayload = {
		exp: currentTimeInSeconds + CONFIG.JWT_REFRESH_EXPIRES_IN,
		iat: currentTimeInSeconds,
		id,
	};

	const [accessToken, refreshToken] = await Promise.all([sign(accessTokenPayload, CONFIG.JWT_SECRET), sign(refreshTokenPayload, CONFIG.JWT_REFRESH_SECRET)]);

	return { accessToken, refreshToken };
};

export const setCookieOptions: Record<"accessToken" | "refreshToken", CookieOptions> = {
	accessToken: {
		httpOnly: true,
		maxAge: CONFIG.JWT_EXPIRES_IN,
		sameSite: "strict",
		secure: CONFIG.IsProd,
	},
	refreshToken: {
		httpOnly: true,
		maxAge: CONFIG.JWT_REFRESH_EXPIRES_IN,
		sameSite: "strict",
		secure: CONFIG.IsProd,
	},
};
