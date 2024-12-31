import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoringAvatar from "boring-avatars";
import { getInitials } from "@/utils/initial";

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
	return (
		<div
			className={`max-w-xs min-w-48 shadow flex items-center gap-3 bg-gray-200 px-2 py-3 rounded-2xl overflow-clip ${
				onClick ? "cursor-pointer hover:shadow-lg" : "cursor-default"
			}`}
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
					<p className="font-semibold text-orange-700">Anonymous</p>
				) : (
					<p className="font-semibold text-gray-800">{header}</p>
				)}
				{subheader && (
					<p
						className="text-xs text-gray-500 break-words"
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
