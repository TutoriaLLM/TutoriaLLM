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
					className="bg-gray-200 text-nowrap text-md text-gray-700 hover:bg-sky-200 transition-all p-2 font-medium rounded-full"
					onClick={() => onReply(reply)}
				>
					{reply}
				</button>
			))}
		</div>
	);
};

export default QuickReply;
