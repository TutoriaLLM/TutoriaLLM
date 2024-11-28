import { getConfig } from "@/api/config";
import type { AppConfig } from "@/type";

export const getAndSetConfig = async (
	setConfig: (config: AppConfig | null) => void,
) => {
	try {
		const config = await getConfig();
		setConfig(config);
		return config;
	} catch {
		setConfig(null);
		return null;
	}
};
