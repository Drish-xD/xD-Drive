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
			contentHash: faker.string.hexadecimal({ length: 32 }),
			lastAccessedAt: faker.date.recent(),
			mimeType: mimeType,
			name: fileName,
			ownerId: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
			size: faker.number.int({ max: 10485760, min: 1024 }), // 1KB - 10MB
			status: faker.helpers.arrayElement(resourceStatusEnum.enumValues),
			storagePath: `/uploads/${faker.string.uuid()}/`,
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
