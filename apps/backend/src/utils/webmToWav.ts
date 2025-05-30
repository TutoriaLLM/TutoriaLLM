import ffmpeg from "fluent-ffmpeg";
/**
 * Converts a webm file to a wav file.
 * @param webmInput The path to the webm file.
 * @returns The path to the wav file.
 */
export async function convertWebMToWav(webmInput: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const wavOutput = `/tmp/${Date.now()}.wav`;
		ffmpeg(webmInput)
			.format("wav")
			.output(wavOutput)
			.on("end", () => resolve(wavOutput))
			.on("error", (err: Error) => reject(err))
			.run();
	});
}
