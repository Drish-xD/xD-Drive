import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { resourceVersions } from "@/db/schema";
import type { TInsertResourceVersion } from "@/models";

const fakeVersions = faker.helpers.multiple(
	() =>
		({
			contentHash: faker.string.hexadecimal({ length: 32 }),
			createdBy: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			isCurrent: faker.datatype.boolean(),
			resourceId: sql`(SELECT id FROM resources ORDER BY RANDOM() LIMIT 1)`, // 1KB - 10MB
			size: faker.number.int({ max: 10485760, min: 1024 }),
			storagePath: `/uploads/${faker.string.uuid()}/`,
			versionNumber: faker.number.int({ max: 10, min: 1 }),
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
