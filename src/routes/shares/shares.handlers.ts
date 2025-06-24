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
	const { logger, db, userData } = ctx.var;
	const { id: resourceId } = ctx.req.valid("param");
	const { accessLevel, expiresAt } = ctx.req.valid("json");

	const resource = await db.query.resources.findFirst({ where: (r, fn) => fn.eq(r.id, resourceId) });
	logger.debug("shares.handlers@createShareLink#resource", { resource });

	if (!resource) {
		logger.error("shares.handlers@createShareLink#notFound", { resourceId });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@createShareLink#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	if (resource.ownerId !== userData.id) {
		logger.error("shares.handlers@createShareLink#notOwner", { resourceId, userId: userData.id });
		throw new HTTPException(HTTP_STATUSES.FORBIDDEN.CODE, {
			cause: "shares.handlers@createShareLink#002",
			message: MESSAGES.RESOURCE.NOT_OWNER,
		});
	}

	const existing = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.isPublic, true)),
	});
	logger.debug("shares.handlers@createShareLink#existing", { existing });

	if (existing) {
		logger.error("shares.handlers@createShareLink#alreadyExists", { resourceId });
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
	logger.debug("shares.handlers@createShareLink#created", { share });

	return ctx.json(share, HTTP_STATUSES.CREATED.CODE);
};

/**
 * Get public share link
 */
export const getShareLink: AppRouteHandler<TGetShareLink> = async (ctx) => {
	const { logger, db } = ctx.var;
	const { token } = ctx.req.valid("param");

	const share = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.eq(s.publicLinkToken, token),
	});
	logger.debug("shares.handlers@getShareLink#share", { share });

	if (!share || !share.isPublic) {
		logger.error("shares.handlers@getShareLink#notFound", { token });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@getShareLink#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	if (share.expiresAt && isBefore(new Date(share.expiresAt), new Date())) {
		logger.error("shares.handlers@getShareLink#expired", { token });
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
	const { logger, db } = ctx.var;
	const { token } = ctx.req.valid("param");

	const share = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.eq(s.publicLinkToken, token),
	});
	logger.debug("shares.handlers@deleteShareLink#share", { share });

	if (!share || !share.isPublic) {
		logger.error("shares.handlers@deleteShareLink#notFound", { token });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@deleteShareLink#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	await db.delete(resourceShares).where(eq(resourceShares.publicLinkToken, token));
	logger.debug("shares.handlers@deleteShareLink#deleted", { token });

	return ctx.json({ message: MESSAGES.RESOURCE.DELETED_SUCCESS }, HTTP_STATUSES.OK.CODE);
};

/**
 * Share resource with user by email
 */
export const createShareEmail: AppRouteHandler<TCreateShareEmail> = async (ctx) => {
	const { logger, db, userData } = ctx.var;
	const { id: resourceId } = ctx.req.valid("param");
	const { userId, accessLevel, expiresAt } = ctx.req.valid("json");

	const resource = await db.query.resources.findFirst({ where: (r, fn) => fn.eq(r.id, resourceId) });
	logger.debug("shares.handlers@createShareEmail#resource", { resource });
	if (!resource) {
		logger.error("shares.handlers@createShareEmail#notFound", { resourceId });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@createShareEmail#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	const user = await db.query.users.findFirst({ where: (u, fn) => fn.eq(u.id, userId) });
	logger.debug("shares.handlers@createShareEmail#user", { user });
	if (!user) {
		logger.error("shares.handlers@createShareEmail#userNotFound", { userId });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "shares.handlers@createShareEmail#002",
			message: MESSAGES.AUTH.USER_NOT_FOUND,
		});
	}

	const existing = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.grantedTo, userId)),
	});
	logger.debug("shares.handlers@createShareEmail#existing", { existing });
	if (existing) {
		logger.error("shares.handlers@createShareEmail#alreadyExists", { resourceId, userId });
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
	logger.debug("shares.handlers@createShareEmail#created", { share });

	return ctx.json(share, HTTP_STATUSES.CREATED.CODE);
};

/**
 * Delete user share
 */
export const deleteShareEmail: AppRouteHandler<TDeleteShareEmail> = async (ctx) => {
	const { logger, db } = ctx.var;
	const { id: resourceId, userId } = ctx.req.valid("param");
	const share = await db.query.resourceShares.findFirst({
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.grantedTo, userId)),
	});
	logger.debug("shares.handlers@deleteShareEmail#share", { share });
	if (!share) {
		logger.error("shares.handlers@deleteShareEmail#notFound", { resourceId, userId });
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, { message: "Share not found" });
	}
	await db.delete(resourceShares).where(and(eq(resourceShares.resourceId, resourceId), eq(resourceShares.grantedTo, userId)));
	logger.debug("shares.handlers@deleteShareEmail#deleted", { resourceId, userId });
	return ctx.json({ message: "User share deleted" }, HTTP_STATUSES.OK.CODE);
};

/**
 * Get resource permissions
 */
export const getResourcePermissions: AppRouteHandler<TGetResourcePermissions> = async (ctx) => {
	const { logger, db } = ctx.var;
	const { id: resourceId } = ctx.req.valid("param");

	const resource = await db.query.resources.findFirst({ where: (r, fn) => fn.eq(r.id, resourceId) });
	logger.debug("shares.handlers@getResourcePermissions#resource", { resource });

	if (!resource) {
		logger.error("shares.handlers@getResourcePermissions#notFound", { resourceId });
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
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.isPublic, true)),
	});
	logger.debug("shares.handlers@getResourcePermissions#publicShare", { publicShare });

	const userShares = await db.query.resourceShares.findMany({
		columns: {
			accessLevel: true,
			expiresAt: true,
			grantedTo: true,
		},
		where: (s, fn) => fn.and(fn.eq(s.resourceId, resourceId), fn.eq(s.isPublic, false)),
	});
	logger.debug("shares.handlers@getResourcePermissions#userShares", { userShares });

	return ctx.json({ public: publicShare, users: userShares }, HTTP_STATUSES.OK.CODE);
};
