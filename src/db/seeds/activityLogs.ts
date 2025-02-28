import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { activityLogs, activityTypeEnum } from "@/db/schema";
import type { TInsertActivityLog } from "@/db/zod";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";

const fakeActivityLogs = faker.helpers.multiple(
	() =>
		({
			activityType: faker.helpers.arrayElement(activityTypeEnum.enumValues),
			ipAddress: faker.internet.ipv4(),
			userAgent: faker.internet.userAgent(),
			resourceId: sql`(SELECT id FROM resources ORDER BY RANDOM() LIMIT 1)`,
			userId: sql`(SELECT id FROM users ORDER BY RANDOM() LIMIT 1)`,
		}) satisfies PartialUnknown<TInsertActivityLog>,
	{ count: 10 },
);

export const seedActivityLogs = async () => {
	console.info("\n*** Seeding ActivityLogs ***\n");
	console.info("\nStarting...");

	await db
		.insert(activityLogs)
		.values(fakeActivityLogs)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
