import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { accessLevelEnum, permissions } from "@/db/schema";
import type { TInsertPermission } from "@/db/zod";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";

const fakePermissions = faker.helpers.multiple(
	() => {
		const isPublic = faker.datatype.boolean();

		return {
			accessLevel: faker.helpers.arrayElement(accessLevelEnum.enumValues),
			isPublic,
			publicLinkToken: faker.string.uuid(),
			expiresAt: faker.date.soon({ days: 10 }),
			grantedTo: isPublic ? sql`NULL` : sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			createdBy: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			resourceId: sql`(SELECT id FROM resources ORDER BY RANDOM() LIMIT 1)`,
		} satisfies PartialUnknown<TInsertPermission>;
	},
	{ count: 10 },
);

export const seedPermissions = async () => {
	console.info("\n*** Seeding Permissions ***\n");
	console.info("\nStarting...");

	await db
		.insert(permissions)
		.values(fakePermissions)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
