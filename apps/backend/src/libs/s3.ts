import {
	CreateBucketCommand,
	DeleteBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	ListBucketsCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { uuidv7 } from "uuidv7";

const s3Client = new S3Client({
	region: process.env.S3_REGION ?? "ap-northeast-1",
	endpoint: process.env.S3_ENDPOINT,
	forcePathStyle: true,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
	},
});

const createBucket = async (bucketName: string) => {
	const buckets = await s3Client.send(new ListBucketsCommand({}));
	if (!buckets.Buckets?.some((bucket) => bucket.Name === bucketName)) {
		await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
		await waitForBucketToExist(bucketName);
	}
};

const waitForBucketToExist = async (
	bucketName: string,
	retries = 5,
	delay = 1000,
) => {
	for (let i = 0; i < retries; i++) {
		try {
			await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
			return;
		} catch (error) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	throw new Error(`Bucket ${bucketName} did not become available.`);
};

export const deleteBucket = async (bucketName: string) => {
	await createBucket(bucketName);
	await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
};

export const uploadFile = async (bucketName: "audio" | "image", file: File) => {
	const ext = file.name.split(".").pop(); // get file extension
	const fileName = ext ? `${uuidv7()}.${ext}` : uuidv7();
	await createBucket(bucketName);
	// File オブジェクトをバッファ化
	const arrayBuffer = await file.arrayBuffer();
	const fileBuffer = Buffer.from(arrayBuffer);
	// Buffer を Body に渡す
	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: fileName,
			Body: fileBuffer,
			ContentType: file.type, // ファイルのMIMEタイプを設定
			CacheControl: "public, max-age=31536000", // 例: 1年間キャッシュする
		}),
	);
	return fileName;
};

export const getFile = async (bucketName: string, fileName: string) => {
	await createBucket(bucketName);
	const file = await s3Client.send(
		new GetObjectCommand({ Bucket: bucketName, Key: fileName }),
	);
	return file;
};

export const deleteFile = async (bucketName: string, fileName: string) => {
	await createBucket(bucketName);
	await s3Client.send(
		new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }),
	);
};

export const listFiles = async (bucketName: string, maxKeys?: number) => {
	await createBucket(bucketName);
	const files = await s3Client.send(
		new ListObjectsV2Command({ Bucket: bucketName, MaxKeys: maxKeys ?? 100 }),
	);
	return files;
};
