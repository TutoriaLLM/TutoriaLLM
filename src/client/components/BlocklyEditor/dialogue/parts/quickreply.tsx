import type React from "react";
import { useTranslation } from "react-i18next";

interface QuickReplyProps {
	onReply: (reply: string) => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ onReply }) => {
	const { t } = useTranslation();
	const quickReplies = [
		t("quickReply.done"),
		t("quickReply.iDontKnow"),
		t("quickReply.explainThis"),
		t("quickReply.whatToDo"),
	];

	return (
		<div className="flex w-full gap-2 mx-4">
			{quickReplies.map((reply) => (
				<button
					type="button"
					key={reply}
					className="bg-gray-200 text-nowrap text-gray-700 p-2 font-semibold rounded-full"
					onClick={() => onReply(reply)}
				>
					{reply}
				</button>
			))}
		</div>
	);
};

export default QuickReply;
