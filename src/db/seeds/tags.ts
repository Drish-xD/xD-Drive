import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { tags } from "@/db/schema";
import type { TInsertTag } from "@/models";

const fakeTags = faker.helpers.multiple(
	() =>
		({
			createdBy: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			isAiGenerated: faker.datatype.boolean(),
			name: faker.system.commonFileType(),
		}) satisfies PartialUnknown<TInsertTag>,
	{ count: 5 },
);

export const seedTags = async () => {
	console.info("\n*** Seeding Tags ***\n");
	console.info("\nStarting...");

	await db
		.insert(tags)
		.values(fakeTags)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
