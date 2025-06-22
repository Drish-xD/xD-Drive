import { reset } from "drizzle-seed";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { seedActivityLogs } from "./activityLogs";
import { seedResourceShares } from "./resourceShares";
import { seedResources } from "./resources";
import { seedResourceTags } from "./resourceTags";
import { seedResourceVersions } from "./resourceVersions";
import { seedTags } from "./tags";
import { seedUsers } from "./users";

const seedDb = async () => {
	await seedUsers();
	await seedTags();
	await seedResources();
	await seedResourceTags();
	await seedResourceVersions();
	await seedResourceShares();
	await seedActivityLogs();
};

const main = async () => {
	try {
		const action = prompt("Do you want to (r)eset or (s)eed the database? [r/s]: ");

		if (!action) {
			throw new Error("Please choose 'r' for reset or 's' for seed.");
		}

		switch (action.toLowerCase()) {
			case "r":
				console.info("🗑️ Starting reset...");
				await reset(db, schema);
				console.info("✅ Database reset complete!");
				break;

			case "s":
				console.info("🌱 Starting seeding...");
				await seedDb();
				console.info("✅ Database seeding complete!");
				break;

			default:
				console.info("❌ Invalid option. Please choose 'r' for reset or 's' for seed.");
		}
	} catch (error) {
		console.error("❌ An error occurred : ", error);
		process.exit(1);
	}

	process.exit(0);
};

main();
