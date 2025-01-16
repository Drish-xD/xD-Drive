/**
 * Adapted from https://github.com/w3cj/stoker/blob/main/scripts/update-http-statuses.ts
 * Generates HTTP Staus Code & Phrases.
 */

import { execSync } from "node:child_process";
import { Project, VariableDeclarationKind } from "ts-morph";

interface JsonCodeComment {
	doc: string;
	description: string;
}

interface JsonCode {
	code: number;
	phrase: string;
	constant: string;
	comment: JsonCodeComment;
	isDeprecated?: boolean;
}

const GIST_URL = "https://raw.githubusercontent.com/prettymuchbryce/http-status-codes/refs/heads/master/codes.json";
const FILE_LOCATIONS = "src/constants/http-status-codes.ts";

const run = async () => {
	console.info(`Updating ${FILE_LOCATIONS}`);

	const project = new Project({ tsConfigFilePath: "tsconfig.json" });

	const response = await fetch(GIST_URL);

	if (!response.ok) {
		throw new Error(`Error retrieving codes: ${response.statusText}`);
	}

	const Codes = (await response.json()) as JsonCode[];

	const statusCodeFile = project.createSourceFile(
		FILE_LOCATIONS,
		{},
		{
			overwrite: true,
		},
	);

	statusCodeFile.insertStatements(0, "// Generated file. Do not edit\n");
	statusCodeFile.insertStatements(1, `// Codes retrieved on ${new Date().toUTCString()} from ${GIST_URL}`);

	for (const { code, constant, phrase, comment, isDeprecated } of Codes) {
		statusCodeFile
			.addVariableStatement({
				isExported: true,
				declarationKind: VariableDeclarationKind.Const,
				declarations: [
					{
						name: constant,
						initializer: `{ CODE: ${code}, PHRASE: "${phrase}", KEY: "${constant}" } as const`,
					},
				],
			})
			.addJsDoc({
				description: `${isDeprecated ? "@deprecated\n" : ""}${comment.doc}\n\n${comment.description}`,
			});
	}

	await project.save();
	await execSync(`bun check ${FILE_LOCATIONS}`);
	console.info("Successfully generated");
};

run();
