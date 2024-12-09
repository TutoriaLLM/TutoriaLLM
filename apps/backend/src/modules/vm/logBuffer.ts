import { getConfig } from "@/modules/config";
import type {
	ContentType,
	Dialogue,
	SessionValue,
} from "@/modules/session/schema";

const config = getConfig();
export default class LogBuffer {
	private buffer: [string, "error" | "info" | "log"][] = [];
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

	add(log: string, type: "error" | "info" | "log" = "log") {
		if (this.buffer.length - 1 >= this.maxBufferSize) {
			this.buffer.shift();
		}
		this.buffer.push([log, type]);
	}

	error(error: string) {
		this.add(error, "error");
		this.flush();
	}

	info(info: string) {
		this.add(info, "info");
		this.flush();
	}

	async flush() {
		if (this.buffer.length === 0) return;
		const sessionValue = await this.getSessionValue();
		if (!sessionValue) return;

		if (!sessionValue.dialogue) return;

		const logsToSave: Dialogue = {
			id: sessionValue.dialogue.length + 1,
			contentType: "group_log",
			isuser: false,
			content: this.buffer.map((log, index) => ({
				id: index + 1,
				contentType: log[1] as ContentType,
				isuser: false,
				content: log[0],
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
