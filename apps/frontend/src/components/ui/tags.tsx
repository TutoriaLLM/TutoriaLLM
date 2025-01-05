import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Tags = {
	value: string;
	label: string;
};

export function FancyMultiSelect({
	inputRef,
	inputValue,
	setInputValue,
	setSelectedTagsString,
	selectedTagsString,
	tags,
	setTags,
	open,
	setOpen,
	selected,
	setSelected,
}: {
	inputRef: React.RefObject<HTMLInputElement>;
	inputValue: string;
	setInputValue: React.Dispatch<React.SetStateAction<string>>;
	setSelectedTagsString: React.Dispatch<React.SetStateAction<string>>;
	selectedTagsString: string;
	tags: Tags[];
	setTags: React.Dispatch<React.SetStateAction<Tags[]>>;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selected: Tags[];
	setSelected: React.Dispatch<React.SetStateAction<Tags[]>>;
}) {
	const updateParentInput = React.useCallback(
		(newSelected: Tags[]) => {
			const joinedLabels = newSelected.map((t) => t.label).join(", ");
			setSelectedTagsString(joinedLabels);
		},
		[selectedTagsString],
	);

	const handleUnselect = React.useCallback(
		(tag: Tags) => {
			setSelected((prev) => {
				const newSelected = prev.filter((s) => s.value !== tag.value);
				// 親の state を更新
				updateParentInput(newSelected);
				return newSelected;
			});
		},
		[updateParentInput],
	);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current;
			if (input) {
				if (e.key === "Delete" || e.key === "Backspace") {
					if (inputValue === "") {
						setSelected((prev) => {
							const newSelected = [...prev];
							newSelected.pop();
							updateParentInput(newSelected);
							return newSelected;
						});
					}
				}
				if (e.key === "Escape") {
					input.blur();
				}
			}
		},
		[inputValue, inputRef, updateParentInput],
	);

	const selectables = React.useMemo(() => {
		return tags.filter((tag) => !selected.some((s) => s.value === tag.value));
	}, [tags, selected]);

	const handleCreateNewTag = React.useCallback(() => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;

		const newTag: Tags = {
			value: trimmed.toLowerCase(),
			label: trimmed,
		};

		if (!tags.some((tag) => tag.value === newTag.value)) {
			setTags((prev) => [...prev, newTag]);
			setSelected((prev) => {
				const newSelected = [...prev, newTag];
				updateParentInput(newSelected);
				return newSelected;
			});
		}
		setInputValue("");
	}, [inputValue, tags, updateParentInput]);
	const handleSelectExistingTag = React.useCallback(
		(framework: Tags) => {
			setSelected((prev) => {
				const newSelected = [...prev, framework];
				updateParentInput(newSelected);
				return newSelected;
			});
			setInputValue("");
		},
		[updateParentInput],
	);

	return (
		<Command
			onKeyDown={handleKeyDown}
			className="overflow-visible bg-transparent"
		>
			<div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
				<div className="flex flex-wrap gap-1">
					{/* 選択されているタグのバッジ */}
					{selected.map((tag) => {
						return (
							<Badge key={tag.value} variant="secondary">
								{tag.label}
								<button
									type="button"
									className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleUnselect(tag);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onClick={() => handleUnselect(tag)}
								>
									<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
								</button>
							</Badge>
						);
					})}

					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={setInputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						placeholder="Select or create a tag"
						className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
					/>
				</div>
			</div>

			{open && (
				<div className="relative mt-2">
					<CommandList>
						<div className="absolute top-0 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
							<CommandGroup className="h-full overflow-auto max-h-20">
								{selectables.map((framework) => {
									return (
										<CommandItem
											key={framework.value}
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onSelect={() => handleSelectExistingTag(framework)}
											className="cursor-pointer"
										>
											{framework.label}
										</CommandItem>
									);
								})}
								{inputValue &&
									!tags.some((tag) => tag.label === inputValue) && (
										<CommandItem
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											onSelect={handleCreateNewTag}
											className="cursor-pointer"
										>
											Create new tag:{" "}
											<span className="font-semibold">{inputValue}</span>
										</CommandItem>
									)}
							</CommandGroup>
						</div>
					</CommandList>
				</div>
			)}
		</Command>
	);
}
