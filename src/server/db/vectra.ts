import path from "node:path";
import { LocalIndex } from "vectra";
import { getVector } from "../../utils/vector.js";

async function createIndexIfNeeded() {
	const index = new LocalIndex(path.join(__dirname, "dist/users.db"));

	if (!(await index.isIndexCreated())) {
		await index.createIndex();
	}

	return index;
}

const index = await createIndexIfNeeded();

//dbにアイテムを追加する
export async function addItem(text: string) {
	await index.insertItem({
		vector: await getVector(text),
		metadata: { text },
	});
}

//dbからアイテムをクエリする
export async function query(text: string) {
	const vector = await getVector(text);
	const results = await index.queryItems(vector, 3);
	if (results.length > 0) {
		for (const result of results) {
			console.log(`[${result.score}] ${result.item.metadata.text}`);
		}
		return results;
	}
	console.log("No results found.");
	return null;
}
