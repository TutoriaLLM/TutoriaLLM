import { useState, useEffect } from "react";
import { updateConfig } from "@/api/admin/config";
import { useMutation } from "@/hooks/use-mutations";
import JSONField from "../../ui/jsonViewer.js";
import type { adminClient } from "@/api";
import type { InferResponseType } from "backend/hc";

function ConfigManager() {
	const [config, setConfig] = useState<InferResponseType<
		typeof adminClient.admin.config.update.$post
	> | null>(null);

	useEffect(() => {
		fetchConfig();
	}, []);

	const fetchConfig = async () => {
		try {
			const response = await fetch("/api/admin/config/");
			const data = await response.json();
			setConfig(data);
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
			<JSONField obj={config || {}} setObj={setConfig ?? {}} />
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
							json: config,
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
