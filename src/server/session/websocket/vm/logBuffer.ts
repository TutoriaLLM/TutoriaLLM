import type { ContentType, Dialogue, SessionValue } from "../../../../type.js";
import { getConfig } from "../../../getConfig.js";

const config = getConfig();
export default class LogBuffer {
	private buffer: string[] = [];
	private interval: NodeJS.Timeout | null = null;
	private readonly maxBufferSize: number;

	constructor(
		private dbUpdater: (code: string, logs: Dialogue) => Promise<void>,
		private code: string,
		private getSessionValue: () => Promise<SessionValue | null>,
		maxBufferSize = config.Code_Execution_Limits.Max_Num_Message_Queue,
	) {
		this.maxBufferSize = maxBufferSize;
	}

	start() {
		if (this.interval) return;
		this.interval = setInterval(() => this.flush(), 1000);
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	add(log: string) {
		if (this.buffer.length >= this.maxBufferSize) {
			// バッファサイズが上限に達した場合、古いログから削除
			this.buffer.shift();
		}
		this.buffer.push(log);
	}

	error(error: string) {
		this.add(`Error: ${error}`);
		this.flush();
	}

	async flush() {
		if (this.buffer.length === 0) return;
		const sessionValue = await this.getSessionValue();
		if (!sessionValue) return;

		const logsToSave: Dialogue = {
			id: sessionValue.dialogue.length + 1,
			contentType: "group_log",
			isuser: false,
			content: this.buffer.map((log, index) => ({
				id: index + 1,
				contentType: log.startsWith("Error:")
					? ("error" as ContentType)
					: ("log" as ContentType),
				isuser: false,
				content: log,
			})),
		};
		this.buffer = [];
		try {
			await this.dbUpdater(this.code, logsToSave);
		} catch (e) {
			console.error("Error updating DB with logs:", e);
		}
	}
}
