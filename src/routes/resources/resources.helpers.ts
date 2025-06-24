import { isBefore } from "date-fns";
import { HTTPException } from "hono/http-exception";
import { HTTP_STATUSES, MESSAGES } from "@/constants";
import { type DB, db } from "@/db";
// import type { TResource } from "@/models";

// type TResourceTree = (TResource & { isFolder: true; children: TResourceTree[] }) | (TResource & { isFolder: false; children?: undefined });

// export const generateResourcesTree = (rows: TResource[]): TResourceTree[] => {
// 	const resourceMap: Record<string, TResourceTree> = {};
// 	const tree: TResourceTree[] = [];

// 	for (const res of rows) {
// 		resourceMap[res.id] = res.isFolder ? { ...res, children: [], isFolder: true } : { ...res, children: undefined, isFolder: false };
// 	}

// 	for (const res of rows) {
// 		if (res.parentId && resourceMap[res.parentId]) {
// 			if (resourceMap[res.parentId].isFolder) {
// 				resourceMap[res.parentId].children?.push(resourceMap[res.id]);
// 			}
// 		} else {
// 			tree.push(resourceMap[res.id]);
// 		}
// 	}

// 	return tree;
// };

export const generateIdAndPath = async (ownerId: string, parentId?: string) => {
	let storagePath: string;
	const uuid = crypto.randomUUID();

	if (parentId) {
		const parentFolder = await db.query.resources.findFirst({
			columns: { storagePath: true },
			where: (table, fn) => fn.and(fn.eq(table.ownerId, ownerId), fn.eq(table.id, parentId), fn.eq(table.isFolder, true)),
		});

		if (!parentFolder) {
			throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
				cause: "resources.helpers@generateIdAndPath#001",
				message: MESSAGES.RESOURCE.PARENT_NOT_FOUND,
			});
		}

		storagePath = `${parentFolder.storagePath}/${uuid}`;
	} else {
		storagePath = `user_${ownerId}/${uuid}`;
	}

	return { id: uuid, storagePath };
};

export const computeFileHash = async (file: File, maxBytes = 1024 * 1024): Promise<string> => {
	const blob = file.slice(0, maxBytes);
	const buffer = await blob.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const getUniqueFolderName = async (db: Omit<DB, "$client">, ownerId: string, name: string, parentId?: string) => {
	const similarFolders = await db.query.resources.findMany({
		columns: { name: true },
		where: (table, fn) =>
			fn.and(fn.eq(table.ownerId, ownerId), parentId ? fn.eq(table.parentId, parentId) : fn.isNull(table.parentId), fn.like(table.name, `${name}%`), fn.eq(table.isFolder, true)),
	});

	// If no similar folders found, return the name as is
	if (similarFolders.length === 0) {
		return name;
	}

	// If no folder with the same name exists, return the name as is
	if (!similarFolders.find((folder) => folder.name === name)) {
		return name;
	}

	// If folder with the same name exists, find the highest number and increment it
	const namePattern = new RegExp(`^${name} \\((\\d+)\\)$`);
	let maxNumber = 0;

	for (const { name: existingName } of similarFolders) {
		const match = existingName.match(namePattern);

		if (match) {
			const num = Number.parseInt(match[1], 10);
			if (!Number.isNaN(num) && num > maxNumber) {
				maxNumber = num;
			}
		}
	}

	return `${name} (${maxNumber + 1})`;
};

export const generateNewStoragePath = (ownerId: string, resourceId: string, parentStoragePath?: string) => {
	return parentStoragePath ? `${parentStoragePath}/${resourceId}` : `user_${ownerId}/${resourceId}`;
};

export const isExpired = (expiresAt?: Date | null): boolean => {
	return !!expiresAt && isBefore(expiresAt, new Date());
};

export const canAccessResource = async (userId: string, resourceId: string, token?: string) => {
	const resource = await db.query.resources.findFirst({
		columns: {
			createdAt: true,
			id: true,
			isFolder: true,
			mimeType: true,
			name: true,
			ownerId: true,
			storagePath: true,
			updatedAt: true,
		},
		where: (r, { and, eq }) => and(eq(r.id, resourceId), eq(r.status, "active")),
	});

	if (!resource) {
		throw new HTTPException(HTTP_STATUSES.NOT_FOUND.CODE, {
			cause: "resources.helpers@canAccessResource#001",
			message: MESSAGES.RESOURCE.NOT_FOUND,
		});
	}

	if (resource.ownerId === userId) {
		return { isAllowed: true, resource, share: null };
	}

	if (userId) {
		const share = await db.query.resourceShares.findFirst({
			where: (s, { eq, and }) => and(eq(s.resourceId, resourceId), eq(s.grantedTo, userId), eq(s.isPublic, false)),
		});

		if (share && !isExpired(share.expiresAt)) {
			return { isAllowed: true, resource, share };
		}
	}

	if (token) {
		const publicShare = await db.query.resourceShares.findFirst({
			where: (s, { eq, and }) => and(eq(s.resourceId, resourceId), eq(s.publicLinkToken, token), eq(s.isPublic, true)),
		});

		if (publicShare && !isExpired(publicShare.expiresAt)) {
			return { isAllowed: true, resource, share: publicShare };
		}
	}

	return { isAllowed: false, resource, share: null };
};
