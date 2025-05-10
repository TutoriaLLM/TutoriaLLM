import { createHonoApp } from "@/create-app";
import { deleteFile, getFile, listFiles, uploadFile } from "@/libs/s3";
import {
	deleteAudio,
	getAudio,
	listAudio,
	uploadAudio,
} from "@/modules/audio/routes";
import { errorResponse } from "@/libs/errors";

const bucketName = "audio";
const app = createHonoApp()
	.openapi(uploadAudio, async (c) => {
		const { file } = c.req.valid("form");
		if (!(file instanceof File)) {
			return errorResponse(c, {
				type: "BAD_REQUEST",
				message: "No file provided or invalid file",
			});
		}

		const fileName = await uploadFile(bucketName, file);
		return c.json({ fileName }, 200);
	})
	.openapi(deleteAudio, async (c) => {
		const fileName = c.req.valid("query").fileName;
		await deleteFile(bucketName, fileName);
		return c.json({ message: "Audio deleted" }, 200);
	})
	.openapi(listAudio, async (c) => {
		const files = await listFiles(bucketName);
		return c.json({ files }, 200);
	})
	.openapi(getAudio, async (c) => {
		const fileName = c.req.valid("param").fileName;
		const file = await getFile(bucketName, fileName);
		const byteArray = file.Body ? await file.Body.transformToByteArray() : null;
		if (!byteArray) {
			return errorResponse(c, {
				type: "NOT_FOUND",
				message: "Audio not found",
			});
		}

		const contentType = file.ContentType || "application/octet-stream";
		const cacheControl =
			file.CacheControl || "public, max-age=31536000, immutable";

		c.header("Content-Type", contentType);
		c.header("Cache-Control", cacheControl);
		return c.body(byteArray.buffer as ArrayBuffer, 200);
	});

export default app;
