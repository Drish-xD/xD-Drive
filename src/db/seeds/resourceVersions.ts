import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { resourceVersions } from "@/db/schema";
import type { TInsertResourceVersion } from "@/models";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";

const fakeVersions = faker.helpers.multiple(
	() =>
		({
			createdBy: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			resourceId: sql`(SELECT id FROM resources ORDER BY RANDOM() LIMIT 1)`,
			storagePath: `/uploads/${faker.string.uuid()}/`,
			size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB - 10MB
			contentHash: faker.string.hexadecimal({ length: 32 }),
			versionNumber: faker.number.int({ min: 1, max: 10 }),
			isCurrent: faker.datatype.boolean(),
		}) satisfies PartialUnknown<TInsertResourceVersion>,
	{ count: 10 },
);

export const seedResourceVersions = async () => {
	console.info("\n*** Seeding ResourceVersions ***\n");
	console.info("\nStarting...");

	await db
		.insert(resourceVersions)
		.values(fakeVersions)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
