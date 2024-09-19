import express from "express";
import OpenAI from "openai";

import { type TrainingData, trainingData } from "../../db/schema.js";
import { db } from "../../db/index.js";
import { asc, eq } from "drizzle-orm";
import { getConfig } from "../../getConfig.js";
import { z } from "zod";

//トレーニングデータを生成し、保存するAPI。内部でも使用される。
export default async function generateTrainingData(
	question: string,
	metadata: TrainingData["metadata"],
	knowledge: string,
) {
	const config = getConfig();
	try {
		//１００件以上のデータがある場合、最も古いデータを削除
		await db
			.delete(trainingData)
			.where(
				eq(
					trainingData.id,
					db
						.select({ id: trainingData.id })
						.from(trainingData)
						.orderBy(asc(trainingData.id))
						.limit(1),
				),
			);
		//トレーニングデータを生成
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const zodSchema = z.object({
			answer: z.string(),
		});
		const systemTemplate = `
        Answer based on the following question with using your knowledge: ${question}
        This is the knowledge that I have: ${knowledge}
        The answer must be provided in the following JSON format:
        {
            "answer": "string" (required)
        }
        `;

		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: systemTemplate,
				},
			],
			model: config.AI_Settings.Chat_AI_Model,
			temperature: config.AI_Settings.Chat_AI_Temperature,
			response_format: { type: "json_object" },
		});

		const response = completion.choices[0].message.content;
		if (!response) {
			throw new Error("Failed to generate response from the AI model.");
		}
		const parsedContent = zodSchema.parse(JSON.parse(response));

		await db.insert(trainingData).values({
			metadata: metadata,
			question: question,
			answer: parsedContent.answer,
		});
	} catch (e) {
		console.error(e);
	}
}
