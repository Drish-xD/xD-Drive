import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { resourceStatusEnum, resources } from "@/db/schema";

const fakeResources = faker.helpers.multiple(
	() => {
		const mimeType = faker.system.mimeType();
		const fileExt = faker.system.fileExt(mimeType);
		const fileName = faker.system.commonFileName(fileExt);

		return {
			ownerId: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			name: fileName,
			mimeType: mimeType,
			status: faker.helpers.arrayElement(resourceStatusEnum.enumValues),
			storagePath: `/uploads/${faker.string.uuid()}/`,
			size: faker.number.int({ min: 1024, max: 10485760 }), // 1KB - 10MB
			contentHash: faker.string.hexadecimal({ length: 32 }),
			lastAccessedAt: faker.date.recent(),
		};
	},
	{ count: 5 },
);

export const seedResources = async () => {
	console.info("\n*** Seeding Resources ***\n");
	console.info("\nStarting...");

	await db
		.insert(resources)
		.values(fakeResources)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
