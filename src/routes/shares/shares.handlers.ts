import { isBefore } from "date-fns";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { resourceShares } from "@/db/schema";
import type { AppRouteHandler } from "@/helpers/types";
import type { TCreateShareEmail, TCreateShareLink, TDeleteShareEmail, TDeleteShareLink, TGetResourcePermissions, TGetShareLink } from "./shares.routes";

/**
 * Create public share link
 */
export const createShareLink: AppRouteHandler<TCreateShareLink> = async (ctx) => {
	const db = ctx.get("db");
	const userData = ctx.get("userData");
	const { id: resourceId } = ctx.req.valid("param");
	const { accessLevel, expiresAt } = ctx.req.valid("json");

	const resource = await db.query.resources.findFirst({ where: (r, fn) => fn.eq(r.id, resourceId) });

	if (!resource) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@createShareLink#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	if (resource.ownerId !== userData.id) {
		throw new HTTPException(HTTP_STATUSES.FORBIDDEN.CODE, {
			cause: "shares.handlers@createShareLink#002",
			message: MESSAGES.RESOURCE.NOT_OWNER,
		});
	}

	const existing = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.isPublic, true)),
	});

	if (existing) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "shares.handlers@createShareLink#003",
			message: MESSAGES.RESOURCE.PUBLIC_SHARE_ALREADY_EXISTS,
		});
	}

	const [share] = await db
		.insert(resourceShares)
		.values({
			accessLevel,
			createdBy: userData.id,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			grantedTo: null,
			isPublic: true,
			publicLinkToken: crypto.randomUUID(),
			resourceId,
		})
		.returning();

	return ctx.json(share, HTTP_STATUSES.CREATED.CODE);
};

/**
 * Get public share link
 */
export const getShareLink: AppRouteHandler<TGetShareLink> = async (ctx) => {
	const db = ctx.get("db");
	const { token } = ctx.req.valid("param");

	const share = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.eq(s.publicLinkToken, token),
	});

	if (!share || !share.isPublic) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@getShareLink#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	if (share.expiresAt && isBefore(new Date(share.expiresAt), new Date())) {
		throw new HTTPException(HTTP_STATUSES.GONE.CODE, {
			cause: "shares.handlers@getShareLink#002",
			message: MESSAGES.RESOURCE.PUBLIC_SHARE_EXPIRED,
		});
	}

	return ctx.json(share, HTTP_STATUSES.OK.CODE);
};

/**
 * Delete public share link
 */
export const deleteShareLink: AppRouteHandler<TDeleteShareLink> = async (ctx) => {
	const db = ctx.get("db");
	const { token } = ctx.req.valid("param");

	const share = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.eq(s.publicLinkToken, token),
	});

	if (!share || !share.isPublic) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@deleteShareLink#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	await db.delete(resourceShares).where(eq(resourceShares.publicLinkToken, token));

	return ctx.json({ message: MESSAGES.RESOURCE.DELETED_SUCCESS }, HTTP_STATUSES.OK.CODE);
};

/**
 * Share resource with user by email
 */
export const createShareEmail: AppRouteHandler<TCreateShareEmail> = async (ctx) => {
	const db = ctx.get("db");
	const userData = ctx.get("userData");
	const { id: resourceId } = ctx.req.valid("param");
	const { userId, accessLevel, expiresAt } = ctx.req.valid("json");

	const resource = await db.query.resources.findFirst({ where: (r, fn) => fn.eq(r.id, resourceId) });
	if (!resource) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@createShareEmail#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	const user = await db.query.users.findFirst({ where: (u, fn) => fn.eq(u.id, userId) });
	if (!user) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@createShareEmail#002",
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		});
	}

	const existing = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.grantedTo, userId)),
	});
	if (existing) {
		throw new HTTPException(HTTP_STATUSES.CONFLICT.CODE, {
			cause: "shares.handlers@createShareEmail#003",
			message: MESSAGES.RESOURCE.PUBLIC_SHARE_ALREADY_EXISTS,
		});
	}

	const [share] = await db
		.insert(resourceShares)
		.values({
			accessLevel,
			createdBy: userData.id,
			expiresAt: expiresAt ? new Date(expiresAt) : null,
			grantedTo: userId,
			isPublic: false,
			publicLinkToken: null,
			resourceId,
		})
		.returning();

	return ctx.json(share, HTTP_STATUSES.CREATED.CODE);
};

/**
 * Delete user share
 */
export const deleteShareEmail: AppRouteHandler<TDeleteShareEmail> = async (ctx) => {
	const db = ctx.get("db");
	const { id: resourceId, userId } = ctx.req.valid("param");
	const share = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.grantedTo, userId)),
	});
	if (!share) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, { message: "Share not found" });
	}
	await db.delete(resourceShares).where(and(eq(resourceShares.resourceId, resourceId), eq(resourceShares.grantedTo, userId)));
	return ctx.json({ message: "User share deleted" }, HTTP_STATUSES.OK.CODE);
};

/**
 * Get resource permissions
 */
export const getResourcePermissions: AppRouteHandler<TGetResourcePermissions> = async (ctx) => {
	const db = ctx.get("db");
	const { id: resourceId } = ctx.req.valid("param");

	const resource = await db.query.resources.findFirst({ where: (r, fn) => fn.eq(r.id, resourceId) });

	if (!resource) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@getResourcePermissions#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	const publicShare = await db.query.resourceShares.findFirst({
		columns: {
			accessLevel: true,
			expiresAt: true,
			publicLinkToken: true,
		},
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.isPublic, true), fn.isNotNull(s.publicLinkToken)),
	});

	const userShares = await db.query.resourceShares.findMany({
		columns: {
			accessLevel: true,
			expiresAt: true,
			grantedTo: true,
		},
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.isPublic, false)),
	});

	return ctx.json({ public: publicShare, users: userShares }, HTTP_STATUSES.OK.CODE);
};
