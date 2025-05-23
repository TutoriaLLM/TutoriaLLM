import { useState } from "react";

// Loading Tour
import CreateSessionCard, {
	type sessionPopupMessageTypes,
} from "@/components/features/editor/sessionOverlay";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/libs/auth-client";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getStatus } from "@/api/health";
import { CheckCircle, CircleAlertIcon, LoaderCircle } from "lucide-react";
import { LangPicker } from "@/components/common/LangPicker";
import { DebugInfo } from "@/components/features/editor/sessionOverlay/debuginfo";
export const Route = createFileRoute("/")({
	beforeLoad: async ({ location }) => ({
		getSession: async () => {
			const session = await authClient.getSession();
			if (!session.data) {
				throw redirect({
					to: "/login",
					search: {
						redirect: location.href,
					},
				});
			}
			return session.data;
		},
	}),
	shouldReload: true,
	loader: async ({ context: { getSession } }) => {
		return await getSession();
	},
	component: Home,
});
export type Message = {
	type: sessionPopupMessageTypes;
	message: string;
};

function Home() {
	const [message, setMessage] = useState<Message>({
		type: "info",
		message: "session.typeCodeMsg",
	});

	const { t, i18n } = useTranslation();

	const { data: isServerOnline } = useQuery({
		queryKey: ["serverStatus"],
		queryFn: getStatus,
		staleTime: 0,
		refetchOnWindowFocus: false,
		retry: false,
	});

	const session = Route.useLoaderData();
	return (
		<div className="min-h-svh overflow-auto flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-background">
			<div className="max-w-2xl w-full my-auto space-y-4 px-2">
				<div className="flex w-full flex-wrap md:flex-nowrap justify-between items-center px-2">
					<div className="space-y-2 w-full">
						<h2 className="text-2xl md:text-3xl font-semibold">
							{t("session.hello")}
							{session.user.name === t("login.guest")
								? ""
								: `, ${session.user.name}`}
						</h2>
						<p className="text-md font-medium text-accent-foreground">
							{t("session.welcome")}
						</p>
					</div>
					<div className="text-xs md:text-nowrap text-foreground justify-center items-center py-0.5">
						{isServerOnline === null ? (
							<span className="flex gap-2 justify-center items-center ">
								{t("session.checkingServer")}
								<LoaderCircle className=" text-primary w-6 h-6 md:w-8 md:h-8 animate-spin" />
							</span>
						) : isServerOnline ? (
							<span className="flex gap-2 justify-center items-center ">
								{t("session.available")}
								<CheckCircle className=" text-secondary w-6 h-6 md:w-8 md:h-8" />
							</span>
						) : (
							<span className="flex gap-2 justify-center items-center ">
								{t("session.serverOffline")}
								<CircleAlertIcon className=" text-destructive w-6 h-6 md:w-8 md:h-8 animate-pulse" />
							</span>
						)}
					</div>
				</div>

				<CreateSessionCard
					message={message}
					setMessage={setMessage}
					session={session}
				/>
				<LangPicker
					language={i18n.language}
					setLanguage={i18n.changeLanguage}
				/>
				<DebugInfo />
			</div>
		</div>
	);
}
