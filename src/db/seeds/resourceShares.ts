import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { accessLevelEnum, resourceShares } from "@/db/schema";
import type { TInsertResourceShare } from "@/models";

const fakeResourceShares = faker.helpers.multiple(
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
		} satisfies PartialUnknown<TInsertResourceShare>;
	},
	{ count: 10 },
);

export const seedResourceShares = async () => {
	console.info("\n*** Seeding Resource Shares ***\n");
	console.info("\nStarting...");

	await db
		.insert(resourceShares)
		.values(fakeResourceShares)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
