import { Button } from "@/components/ui/button";
import type React from "react";
import { useTranslation } from "react-i18next";

interface QuickReplyProps {
	onReply: (reply: string) => void;
	quickReplies: string[] | null;
}

const QuickReply: React.FC<QuickReplyProps> = ({ onReply, quickReplies }) => {
	const { t } = useTranslation();

	const handleReply = (reply: string) => {
		const value = t(reply);
		onReply(value);
	};

	return (
		<div className="flex w-full gap-2 mx-4">
			{quickReplies?.map((reply) => (
				<Button
					type="button"
					variant="outline"
					size="sm"
					key={reply}
					className="text-nowrap text-xs md:text-md"
					onClick={() => handleReply(reply)}
				>
					{t(reply)}
				</Button>
			))}
		</div>
	);
};

export default QuickReply;
