import fs from "node:fs";
import path from "node:path";
import Bun from "bun";

// NodeJS Build
const NODE_FIX = 'import { createRequire as createImportMetaRequire } from "module"; import.meta.require ||= (id) => createImportMetaRequire(import.meta.url)(id);\n';
const BUILD_DIR = "../dist";

try {
	console.info("Building...");
	const nodeBuild = await Bun.build({
		entrypoints: ["./src/index.ts"],
		target: "node",
		minify: true,
	});

	// Write output files
	for (const result of nodeBuild.outputs) {
		const fileContent = NODE_FIX + (await result.text());
		const destDir = path.join(import.meta.dir, BUILD_DIR);
		const dest = path.join(destDir, result.path);
		fs.existsSync(destDir) || fs.mkdirSync(destDir);
		Bun.write(dest, fileContent);
		console.info(`Wrote ${dest}`);
	}

	console.info("Build successful");
} catch (error) {
	console.error("Build failed : ", error);
	process.exit(1);
}
