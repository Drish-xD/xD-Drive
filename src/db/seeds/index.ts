import { reset, seed } from "drizzle-seed";
import { db } from "..";
import * as schema from "../schema";

const seedDb = async () => {
	await seed(db, { users: schema.users }).refine((f) => ({
		users: {
			columns: {},
			count: 20,
			with: {},
		},
	}));
};

const main = async () => {
	try {
		const action = prompt("Do you want to (r)eset or (s)eed the database? [r/s]: ");

		if (!action) {
			throw new Error("Please choose 'r' for reset or 's' for seed.");
		}

		switch (action.toLowerCase()) {
			case "r":
				console.log("Starting reset...");
				await reset(db, schema);
				console.log("Database reset complete!");
				break;

			case "s":
				console.log("Starting seeding...");
				await seedDb();
				console.log("Database seeding complete!");
				break;

			default:
				console.log("Invalid option. Please choose 'r' for reset or 's' for seed.");
		}
	} catch (error) {
		console.error("An error occurred : ", error);
		process.exit(1);
	}

	process.exit(0);
};

main();
