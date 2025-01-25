export function getInitials(name: string): string {
	const trimmedName = name.trim();

	if (trimmedName === "") {
		return "";
	}

	const nameParts = trimmedName.split(/\s+/);

	if (nameParts.length > 1) {
		return nameParts[0][0].toUpperCase() + nameParts[1][0].toUpperCase();
	}
	return trimmedName.slice(0, 2).toUpperCase();
}
