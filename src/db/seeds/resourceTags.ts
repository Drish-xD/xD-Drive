import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { resourceTags } from "@/db/schema";
import type { TInsertResourceTag } from "@/models";

const fakeTags = faker.helpers.multiple(
	() =>
		({
			confidenceScore: faker.number.int({ max: 10, min: 1 }),
			createdBy: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			isAiGenerated: faker.datatype.boolean(),
			resourceId: sql`(SELECT id FROM resources ORDER BY RANDOM() LIMIT 1)`,
			tagId: sql`(SELECT id FROM tags ORDER BY RANDOM() LIMIT 1)`,
		}) satisfies PartialUnknown<TInsertResourceTag>,
	{ count: 10 },
);

export const seedResourceTags = async () => {
	console.info("\n*** Seeding ResourceTags ***\n");
	console.info("\nStarting...");

	await db
		.insert(resourceTags)
		.values(fakeTags)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
