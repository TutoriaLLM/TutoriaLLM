import type React from "react";
import { useTranslation } from "react-i18next";

interface QuickReplyProps {
	onReply: (reply: string) => void;
	quickReplies: string[] | null;
}

const QuickReply: React.FC<QuickReplyProps> = ({ onReply, quickReplies }) => {
	return (
		<div className="flex w-full gap-2 mx-4">
			{quickReplies?.map((reply) => (
				<button
					type="button"
					key={reply}
					className="bg-gray-200 text-nowrap text-xs text-gray-700 p-1.5 font-base rounded-full"
					onClick={() => onReply(reply)}
				>
					{reply}
				</button>
			))}
		</div>
	);
};

export default QuickReply;
