import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoringAvatar from "boring-avatars";
import { getInitials } from "@/utils/initial";
import { useTranslation } from "react-i18next";
import { cn } from "@/libs/utils";

const UserCard = ({
	image,
	header,
	subheader,
	isAnonymous,
	onClick,
	id,
}: {
	image?: string | null | undefined;
	header: string;
	subheader?: string;
	isAnonymous?: boolean;
	onClick?: () => void;
	id: string;
}) => {
	const { t } = useTranslation();
	return (
		<div
			className={cn(
				`max-w-xs min-w-48 shadow flex items-center gap-3 bg-card px-2 py-3 rounded-2xl overflow-clip ${
					onClick ? "cursor-pointer hover:shadow-lg" : "cursor-default"
				}`,
				isAnonymous && "bg-destructive-foreground",
			)}
			onClick={onClick}
			onKeyUp={(e) => e.key === "Enter" && onClick?.()}
		>
			{image ? (
				<Avatar className="w-10 h-10 flex-shrink-0">
					<AvatarImage src={image} />
					<AvatarFallback>{getInitials(header)}</AvatarFallback>
				</Avatar>
			) : (
				<BoringAvatar
					size="40px"
					className="w-10 h-10 rounded-full flex-shrink-0"
					name={id}
					variant="beam"
				/>
			)}
			<div>
				{isAnonymous ? (
					<p className="font-semibold text-destructive">
						{t("admin.anonymous")}
					</p>
				) : (
					<p className="font-semibold ">{header}</p>
				)}
				{subheader && (
					<p
						className="text-xs text-accent-foreground break-words"
						style={{ wordBreak: "break-word" }}
					>
						{subheader}
					</p>
				)}
			</div>
		</div>
	);
};

export default UserCard;
