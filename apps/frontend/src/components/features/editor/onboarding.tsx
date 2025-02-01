import type { SessionValue } from "@/type";
import { useTour } from "@reactour/tour";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export function Onboarding({
	currentSession,
}: { currentSession: SessionValue | null }) {
	const { setIsOpen } = useTour();
	const now = new Date();
	const [cookie, setCookie] = useCookies();
	const [hasStartedOnboarding, setHasStartedOnboarding] = useState(false);

	useEffect(() => {
		if (currentSession && !hasStartedOnboarding) {
			const lastOnboardingTime = cookie.lastOnBoarding
				? new Date(cookie.lastOnBoarding)
				: null;
			const timeSinceLastOnboarding = lastOnboardingTime
				? now.getTime() - lastOnboardingTime.getTime()
				: null;
			const oneDayInMs = 1000 * 60 * 60 * 24;

			if (
				!lastOnboardingTime ||
				(timeSinceLastOnboarding !== null &&
					timeSinceLastOnboarding > oneDayInMs)
			) {
				setIsOpen(true);
				setCookie("lastOnBoarding", now);
				setHasStartedOnboarding(true);
			}
		}
	}, [
		currentSession,
		cookie.lastOnBoarding,
		setCookie,
		setIsOpen,
		hasStartedOnboarding,
		now,
	]);

	return null;
}
