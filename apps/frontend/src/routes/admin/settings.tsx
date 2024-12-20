import { updateConfig } from "@/api/admin/config";
import { getConfig } from "@/api/config.js";
import JSONField from "@/components/features/admin/jsonViewer.js";
import { useMutation } from "@/hooks/useMutations.js";
import type { AppConfig } from "@/type.js";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/settings")({
	component: ConfigManager, // This is the main
});

function ConfigManager() {
	const [config, setConfig] = useState<AppConfig | undefined>(undefined);

	useEffect(() => {
		fetchConfig();
	}, []);

	const fetchConfig = async () => {
		try {
			const response = await getConfig();
			setConfig(response);
		} catch (error) {
			console.error("Failed to fetch config:", error);
		}
	};

	const { mutate } = useMutation({
		mutationFn: updateConfig,
		onSuccess: (data) => {
			console.log(data);

			alert("Config updated successfully");
		},
		onError: (error) => {
			alert("Failed to update config");

			console.error("Failed to update config:", error);
		},
	});

	return (
		<div className="flex flex-col gap-2">
			<JSONField
				obj={config ?? {}}
				setObj={(newObj) => setConfig(newObj as AppConfig)}
			/>
			<p>config: {JSON.stringify(config)}</p>
			<div>
				<button
					type="button"
					className="flex bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full"
					onClick={() => {
						if (!config) {
							alert("No config to save");
							return;
						}

						mutate({
							...config,
						});
					}}
				>
					Save Configuration
				</button>
			</div>
		</div>
	);
}

export default ConfigManager;
