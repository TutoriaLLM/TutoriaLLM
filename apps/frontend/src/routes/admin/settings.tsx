import { updateConfig } from "@/api/admin/config";
import { getConfig } from "@/api/config.js";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import JSONField from "@/components/features/admin/jsonViewer.js";
import { AdminBodyWrapper } from "@/components/layout/adminBody";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations.js";
import type { AppConfig } from "@/type.js";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/admin/settings")({
	component: ConfigManager, // This is the main
});

function ConfigManager() {
	const { t } = useTranslation();
	const { toast } = useToast();
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
			toast({
				description: (
					<SuccessToastContent> {t("toast.configUpdated")}</SuccessToastContent>
				),
			});
		},
		onError: (error) => {
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToUpdateConfig")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});

			console.error("Failed to update config:", error);
		},
	});

	return (
		<AdminBodyWrapper title={t("admin.settings")}>
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
								toast({
									description: (
										<ErrorToastContent>
											{t("toast.noConfigToSave")}
										</ErrorToastContent>
									),
									variant: "destructive",
								});

								return;
							}

							mutate({
								...config,
							});
						}}
					>
						{t("general.save")}
					</Button>
				</div>
			</div>
		</AdminBodyWrapper>
	);
}

export default ConfigManager;
