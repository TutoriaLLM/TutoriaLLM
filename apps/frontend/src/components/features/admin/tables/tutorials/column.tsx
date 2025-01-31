import { deleteTutorial } from "@/api/admin/tutorials";
import {
	ErrorToastContent,
	SuccessToastContent,
} from "@/components/common/toastContent";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import type { Tutorial } from "@/type";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

export function tutorialsColumns() {
	const { toast } = useToast();
	const router = useRouter();
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { mutate: del } = useMutation({
		mutationFn: deleteTutorial,
		onSuccess: () => {
			toast({
				description: (
					<SuccessToastContent>
						{t("toast.deletedTutorial")}
					</SuccessToastContent>
				),
			});
			queryClient.invalidateQueries({
				queryKey: ["tutorials"],
				refetchType: "active",
			});
		},
		onError: () => {
			toast({
				description: (
					<ErrorToastContent>
						{t("toast.failedToDeleteTutorial")}
					</ErrorToastContent>
				),
				variant: "destructive",
			});
		},
	});

	const handleDeleteTutorial = (id: number) => {
		del({ id });
	};

	const handleEditTutorial = (id: number) => {
		router.navigate({
			to: "/admin/tutorials/$id/edit",
			params: { id: id.toString() },
		});
	};

	//content and serializednodes are not fetched from tutorial list api
	type TutorialColumn = Omit<Tutorial, "content" | "serializednodes">;
	const tutorialColumns: ColumnDef<TutorialColumn>[] = [
		{
			header: t("admin.tutorialId"),
			accessorKey: "id",
			cell: ({ row }) => {
				return row.original.id;
			},
		},
		{
			header: t("admin.tutorialTitle"),
			accessorKey: "metadata.title",
			cell: ({ row }) => {
				return row.original.metadata.title;
			},
		},
		{
			header: t("admin.tutorialDescription"),
			accessorKey: "metadata.description",
			cell: ({ row }) => {
				return row.original.metadata.description;
			},
		},
		{
			header: t("admin.tutorialLanguage"),
			accessorKey: "language",
			cell: ({ row }) => {
				return row.original.language;
			},
		},
		{
			header: t("admin.tutorialTags"),
			accessorKey: "metadata.tags",
			cell: ({ row }) => {
				console.log(row.original.tags);
				return row.original.tags.map((tag) => tag.name).join(", ");
			},
		},
		{
			header: t("admin.tutorialSelectCount"),
			accessorKey: "metadata.selectCount",
			cell: ({ row }) => {
				return row.original.metadata.selectCount;
			},
		},
		{
			header: t("admin.actions"),
			enableSorting: false,

			cell: ({ row }) => {
				return (
					<div className="flex gap-2">
						<Button
							onClick={() => handleEditTutorial(row.original.id)}
							variant="secondary"
						>
							{t("general.edit")}
						</Button>
						<Button
							onClick={() => handleDeleteTutorial(row.original.id)}
							variant="destructive"
						>
							{t("general.delete")}
						</Button>
					</div>
				);
			},
		},
	];
	return tutorialColumns;
}
