import type { SessionValue } from "@/type.js";
import { timeAgo } from "@/utils/time";
import { Clock, History } from "lucide-react";

export default function Time(props: { session: SessionValue }) {
	const { session } = props;
	return (
		<div className="flex gap-2 w-full">
			<div className="bg-card rounded-2xl p-2 w-full">
				<span className="font-semibold text-md text-card-foreground flex gap-1">
					<History />
					<h3>Last Updated Time</h3>
				</span>

				<p>{timeAgo(session.updatedAt)}</p>
				<p>{new Date(session.updatedAt).toLocaleString()}</p>
			</div>
			<div className="bg-card rounded-2xl p-2 w-full">
				<span className="font-semibold text-md text-card-foreground flex gap-1">
					<Clock />

					<h3>Created Time</h3>
				</span>
				<p>{timeAgo(session.createdAt)}</p>
				<p>{new Date(session.createdAt).toLocaleString()}</p>
			</div>
		</div>
	);
}
