import { cn } from "@/libs/utils";
import type { SessionValue } from "@/type";
import * as Switch from "@radix-ui/react-switch";
import { Headphones, Text } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

function SwitchModeUI({
	sessionState,
	setSessionState,
	audio,
}: {
	sessionState: SessionValue | null;
	setSessionState: Dispatch<SetStateAction<SessionValue | null>>;
	audio: boolean | undefined;
}) {
	const { t } = useTranslation();

	function toggleIsEasyMode() {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
			return {
				...prev,
				easyMode: !prev.easyMode,
				dialogue: [
					...(prev.dialogue || []),
					{
						id: (prev.dialogue?.length ?? 0) + 1,
						contentType: "log",
						isuser: false,
						content: t("tutorial.easyModeChanged", {
							status: prev.easyMode ? t("off") : t("on"),
						}),
					},
				],
			};
		});
	}

	function toggleResponseMode() {
		setSessionState((prev) => {
			if (!prev) {
				return null;
			}
			return {
				...prev,
				responseMode: prev.responseMode === "text" ? "audio" : "text",
				dialogue: [
					...(prev.dialogue || []),
					{
						id: (prev.dialogue?.length ?? 0) + 1,
						contentType: "log",
						isuser: false,
						content: t("tutorial.responseModeChanged", {
							mode:
								prev.responseMode === "text"
									? t("generic.audio")
									: t("generic.text"),
						}),
					},
				],
			};
		});
	}

	return (
		<div className="w-full p-2 animate-fade-in switchMode">
			<div className="bg-card border shadow w-full gap-2 sticky top-0 p-2 rounded-2xl flex flex-col ">
				<div className="flex justify-between items-center w-full">
					<span className="shrink">
						<h3 className="font-semibold text-base md:text-lg">
							{t("tutorial.easyMode")}
						</h3>
						<p className="text-xs md:text-sm text-card-foreground">
							{t("tutorial.easyModeDescription")}
						</p>
					</span>
					<Switch.Root
						className="w-14 h-8 md:w-16 md:h-10 flex-shrink-0 rounded-2xl border bg-muted relative data-[state=checked]:bg-green-100 group"
						onCheckedChange={toggleIsEasyMode} // Set function to execute when switch state is changed
						checked={sessionState?.easyMode || false} // Set switch status
					>
						<Switch.Thumb className="shadow block w-6 h-6 md:w-8 md:h-8 rounded-xl transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-7 data-[state=checked]:bg-secondary bg-destructive data-[disabled]:bg-warning" />
					</Switch.Root>
				</div>
				{audio && (
					<>
						<span className="w-full h-0.5 bg-border" />
						<div className="flex justify-between items-center w-full">
							<span className="shrink">
								<h3 className="font-semibold text-base md:text-lg">
									{t("tutorial.responseMode")}
								</h3>
								<p className="text-xs md:text-sm text-card-foreground">
									{t("tutorial.responseModeDescription")}
								</p>
							</span>

							<Switch.Root
								className="w-16 h-8 md:w-20 md:h-10 shrink-0 relative rounded-2xl bg-muted flex items-center"
								onCheckedChange={toggleResponseMode}
								checked={sessionState?.responseMode === "audio"}
							>
								{/* Icon on the left */}
								<div
									className={cn(
										"absolute z-20 left-2 transition-opacity duration-200 text-muted-foreground opacity-50",
										{
											"opacity-100 text-secondary":
												sessionState?.responseMode === "text",
										},
									)}
								>
									<Text className="md:w-6 md:h-6 w-4 h-4" />
								</div>

								{/* Icon on the right */}
								<div
									className={cn(
										"absolute z-20 right-2 transition-opacity duration-200 text-muted-foreground opacity-50",
										{
											"opacity-100 text-secondary":
												sessionState?.responseMode === "audio",
										},
									)}
								>
									<Headphones className="md:w-6 md:h-6 w-4 h-4" />
								</div>

								<Switch.Thumb className="shadow z-10 block w-6 h-6 md:w-8 md:h-8 rounded-xl border bg-muted/60 transition-transform duration-300 transform translate-x-1 md:data-[state=checked]:translate-x-11 data-[state=checked]:translate-x-9" />
							</Switch.Root>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export { SwitchModeUI };
