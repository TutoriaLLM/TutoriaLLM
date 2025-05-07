import type { AuthSession } from "@/type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/initial";
import BoringAvatar from "boring-avatars";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/toast";
import { ErrorToastContent, SuccessToastContent } from "../../toastContent";
import { uploadImage } from "@/api/image";
import { authClient } from "@/libs/auth-client";
import { useRouter } from "@tanstack/react-router";
import imageCompression from "browser-image-compression";
import { useForm } from "react-hook-form";
import { uploadImageSchema, type UploadImageSchemaType } from "@/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormField,
	FormItem,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { FileInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";

export function EditIcon(props: { session: AuthSession }) {
	const { session } = props;
	const { t } = useTranslation();
	const router = useRouter();

	const form = useForm<UploadImageSchemaType>({
		resolver: zodResolver(uploadImageSchema),
		defaultValues: {
			file: undefined,
		},
	});

	//After uploading image, the image url will be set to the session.user.image, refresh the query to get the updated user image.
	const handleImageUpload = async (data: UploadImageSchemaType) => {
		const file = data.file;
		//limit the file format
		if (!file?.type.startsWith("image/")) {
			toast({
				description: (
					<ErrorToastContent>{t("toast.invalidImageFormat")}</ErrorToastContent>
				),
			});
			return;
		}

		if (!file) return;

		//upload image as buffer and upload to the server
		//compress the image
		const options = {
			maxSizeMB: 1,
			maxWidthOrHeight: 1920,
			useWebWorker: true,
		};
		const compressedFile = await imageCompression(file, options);
		const fileAsFile = new File([compressedFile], file.name, {
			type: compressedFile.type,
		});
		const imageUrl = await uploadImage(fileAsFile);

		//update the user image url in the database(better-auth)
		const result = await authClient.updateUser({
			image: `/image/${imageUrl.fileName}`,
		});
		if (result.error) {
			toast({
				description: (
					<ErrorToastContent>{t("toast.failedToUpdateIcon")}</ErrorToastContent>
				),
			});
		} else {
			toast({
				description: (
					<SuccessToastContent>{t("toast.updatedInfo")}</SuccessToastContent>
				),
			});
		}
		router.invalidate();
	};

	return (
		<Form {...form}>
			<div className="flex flex-col gap-2 w-full justify-center items-center">
				<div className="flex flex-col gap-2 w-full justify-center items-center">
					{session.user.image ? (
						<Avatar className="w-20 h-20 ">
							<AvatarImage
								src={
									session.user.image
										? `${import.meta.env.VITE_BACKEND_URL}${session.user.image}`
										: undefined
								}
							/>
							<AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
						</Avatar>
					) : (
						<BoringAvatar
							size="112px"
							className="w-28 h-28 rounded-full"
							name={session.user.id}
							variant="beam"
							square={true}
						/>
					)}
				</div>
				<form
					onSubmit={form.handleSubmit(handleImageUpload)}
					className="w-full flex gap-2"
				>
					<FormField
						control={form.control}
						name="file"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<FileInput {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" size={"sm"}>
						<UploadIcon className="h-4 w-4" />
						{t("login.update")}
					</Button>
				</form>
			</div>
		</Form>
	);
}
