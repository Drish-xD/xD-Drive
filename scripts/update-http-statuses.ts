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
const LOCATIONS = {
	CODES: "src/constants/http-status-codes.ts",
	PHRASES: "src/constants/http-status-phrases.ts",
};

const run = async () => {
	console.log("Updating %s and %s", LOCATIONS.CODES, LOCATIONS.PHRASES);

	const project = new Project({ tsConfigFilePath: "tsconfig.json" });

	const response = await fetch(GIST_URL);

	if (!response.ok) {
		throw new Error(`Error retrieving codes: ${response.statusText}`);
	}
	const Codes = (await response.json()) as JsonCode[];

	const statusCodeFile = project.createSourceFile(
		LOCATIONS.CODES,
		{},
		{
			overwrite: true,
		},
	);

	statusCodeFile.insertStatements(0, "// Generated file. Do not edit\n");
	statusCodeFile.insertStatements(1, `// Codes retrieved on ${new Date().toUTCString()} from ${GIST_URL}`);

	for (const { code, constant, comment, isDeprecated } of Codes) {
		statusCodeFile
			.addVariableStatement({
				isExported: true,
				declarationKind: VariableDeclarationKind.Const,
				declarations: [
					{
						name: constant,
						initializer: code.toString(),
					},
				],
			})
			.addJsDoc({
				description: `${isDeprecated ? "@deprecated\n" : ""}${comment.doc}\n\n${comment.description}`,
			});
	}

	const phrasesFile = project.createSourceFile(
		LOCATIONS.PHRASES,
		{},
		{
			overwrite: true,
		},
	);

	phrasesFile.insertStatements(0, "// Generated file. Do not edit\n");
	phrasesFile.insertStatements(1, `// Phrases retrieved on ${new Date().toUTCString()} from ${GIST_URL}`);

	for (const { constant, phrase, comment, isDeprecated } of Codes) {
		phrasesFile
			.addVariableStatement({
				isExported: true,
				declarationKind: VariableDeclarationKind.Const,
				declarations: [
					{
						name: constant,
						initializer: `"${phrase}"`,
					},
				],
			})
			.addJsDoc({
				description: `${isDeprecated ? "@deprecated\n" : ""}${comment.doc}\n\n${comment.description}`,
			});
	}

	await project.save();
	await execSync(`bun check ${LOCATIONS.CODES} ${LOCATIONS.PHRASES}`);
	console.log("Successfully generated http-status-codes.ts and http-status-phrases.ts");
};

run();
