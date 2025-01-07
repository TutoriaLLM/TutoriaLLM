import { updateConfig } from "@/api/admin/config";
import { getConfig } from "@/api/config.js";
import JSONField from "@/components/features/admin/jsonViewer.js";
import { AdminBodyWrapper } from "@/components/layout/adminBody";
import { Button } from "@/components/ui/button";
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
		onSuccess: () => {
			alert("Config updated successfully");
		},
		onError: (error) => {
			alert("Failed to update config");

			console.error("Failed to update config:", error);
		},
	});

	return (
		<AdminBodyWrapper title="Settings">
			<div className="p-2 md:p-4">
				<JSONField
					obj={config ?? {}}
					setObj={(newObj) => setConfig(newObj as AppConfig)}
				/>
				<div>
					<Button
						type="button"
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
					</Button>
				</div>
			</div>
		</AdminBodyWrapper>
	);
}

export default ConfigManager;
