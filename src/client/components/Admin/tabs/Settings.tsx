import React, { useState, useEffect } from "react";
import JSONField from "../../jsonViewer.js";

function ConfigManager() {
	const [config, setConfig] = useState({});

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

	const updateConfig = async () => {
		try {
			const response = await fetch("/api/admin/config/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(config),
			});
			console.log(response);
			if (response.ok) {
				alert("Config updated successfully");
			} else {
				alert("Failed to update config");
			}
		} catch (error) {
			console.error("Failed to update config:", error);
		}
	};

	return (
		<div className="p-4 flex flex-col gap-2">
			<JSONField obj={config} setObj={setConfig} />
			<div>
				<button
					type="button"
					className="flex bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full"
					onClick={updateConfig}
				>
					Save Configuration
				</button>
			</div>
		</div>
	);
}

export default ConfigManager;
