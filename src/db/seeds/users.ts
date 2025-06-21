import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { CONFIG } from "@/config";
import { db } from "@/db";
import type { PartialUnknown } from "@/db/lib";
import { users } from "@/db/schema";
import type { TInsertUser } from "@/models";

const fakeUsers = faker.helpers.multiple(
	() => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();

		return {
			fullName: faker.person.fullName({ firstName, lastName }),
			displayName: faker.internet.displayName({ firstName, lastName }),
			email: faker.internet.email({ firstName, lastName }).toLowerCase(),
			passwordHash: bcrypt.hashSync("password", CONFIG.SALT_ROUNDS),
		} satisfies PartialUnknown<TInsertUser & { passwordHash: string }>;
	},
	{ count: 5 },
);

export const seedUsers = async () => {
	console.info("\n*** Seeding Users ***\n");
	console.info("\nStarting...");
	await db
		.insert(users)
		.values(fakeUsers)
		.then(() => console.info("Completed! ✅"))
		.catch((e) => console.error("Error ❌ :", e));
};
