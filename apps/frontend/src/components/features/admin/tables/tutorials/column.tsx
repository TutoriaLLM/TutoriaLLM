import { deleteTutorial } from "@/api/admin/tutorials";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast";
import { useMutation } from "@/hooks/useMutations";
import type { Tutorial } from "@/type";
import { useRouter } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";

export function tutorialsColumns() {
	const { toast } = useToast();
	const router = useRouter();
	const { mutate: del } = useMutation({
		mutationFn: deleteTutorial,
		onSuccess: () => {
			console.info("Tutorial deleted successfully");
			toast({
				description: "Tutorial deleted successfully",
				variant: "default",
			});
		},
		onError: (error) => {
			console.error("Failed to delete tutorial:", error);
			toast({
				description: `An error occurred: ${error}`,
				variant: "destructive",
			});
		},
	});

	const handleDeleteTutorial = (id: number) => {
		del({ id });
	};

	const handleEditTutorial = (id: number) => {
		router.navigate({ to: "/admin/tutorials/edit", search: { id } });
	};

	//content and serializednodes are not fetched from tutorial list api
	type TutorialColumn = Omit<Tutorial, "content" | "serializednodes">;
	const tutorialColumns: ColumnDef<TutorialColumn>[] = [
		{
			header: "ID",
			accessorKey: "id",
			cell: ({ row }) => {
				return row.original.id;
			},
		},
		{
			header: "Title",
			accessorKey: "metadata.title",
			cell: ({ row }) => {
				return row.original.metadata.title;
			},
		},
		{
			header: "Description",
			accessorKey: "metadata.description",
			cell: ({ row }) => {
				return row.original.metadata.description;
			},
		},
		{
			header: "Language",
			accessorKey: "language",
			cell: ({ row }) => {
				return row.original.language;
			},
		},
		{
			header: "Tags",
			accessorKey: "metadata.tags",
			cell: ({ row }) => {
				return row.original.tags.join(", ");
			},
		},
		{
			header: "Select Count",
			accessorKey: "metadata.selectCount",
			cell: ({ row }) => {
				return row.original.metadata.selectCount;
			},
		},
		{
			header: "Actions",
			cell: ({ row }) => {
				return (
					<div className="flex gap-2">
						<Button
							onClick={() => handleEditTutorial(row.original.id)}
							variant={"orange"}
						>
							Edit
						</Button>
						<Button
							onClick={() => handleDeleteTutorial(row.original.id)}
							variant={"red"}
						>
							Delete
						</Button>
					</div>
				);
			},
		},
	];
	return tutorialColumns;
}
