import { createInsertSchema, createSelectSchema, createUpdateSchema, type inferType, omitTimestamps, z } from "@/db/lib";
import { accessLevelEnum, resourceShares } from "@/db/schema";

/**
 * Resource Shares Schema
 */
export const selectResourceShareSchema = createSelectSchema(resourceShares).meta({ id: "ResourceShare" });

export const insertResourceShareSchema = createInsertSchema(resourceShares).omit({ id: true, ...omitTimestamps });

export const updateResourceShareSchema = createUpdateSchema(resourceShares)
	.omit({ id: true, ...omitTimestamps })
	.partial();

export type TResourceShare = inferType<typeof selectResourceShareSchema>;
export type TInsertResourceShare = inferType<typeof insertResourceShareSchema>;
export type TUpdateResourceShare = inferType<typeof updateResourceShareSchema>;

export const shareLinkBodySchema = insertResourceShareSchema.pick({
	accessLevel: true,
	expiresAt: true,
});

export const shareEmailBodySchema = insertResourceShareSchema
	.pick({
		accessLevel: true,
		expiresAt: true,
	})
	.extend({
		userId: z.uuid(),
	});

export const shareTokenParamSchema = z.object({ token: z.uuid().meta({ description: "Share token" }) });

export const userIdParamSchema = z.object({ userId: z.uuid().meta({ description: "User ID" }) });

export const deleteShareEmailParamSchema = z.object({
	id: z.uuid().meta({ description: "Resource ID" }),
	userId: z.uuid().meta({ description: "User ID" }),
});

export const resourcePermissionsSchema = z.object({
	public: z
		.object({
			accessLevel: z.enum(accessLevelEnum.enumValues),
			expiresAt: z.date().nullable(),
			publicLinkToken: z.uuid().nullable(),
		})
		.optional(),
	users: z
		.array(
			z.object({
				accessLevel: z.enum(accessLevelEnum.enumValues),
				expiresAt: z.date().nullable(),
				grantedTo: z.uuid().nullable(),
			}),
		)
		.optional(),
});
