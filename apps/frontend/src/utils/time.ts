export const timeAgo = (time: string | Date) => {
	// If date is a string, convert to a Date object
	function toDate(date: string | Date): Date {
		if (typeof date === "string") {
			return new Date(date);
		}
		return date;
	}
	const date = toDate(time);

	const now = new Date();
	const secondsPast = (now.getTime() - date.getTime()) / 1000;

	if (secondsPast < 60) {
		return `${Math.floor(secondsPast)} seconds ago`;
	}
	if (secondsPast < 3600) {
		return `${Math.floor(secondsPast / 60)} minutes ago`;
	}
	if (secondsPast < 86400) {
		return `${Math.floor(secondsPast / 3600)} hours ago`;
	}
	if (secondsPast < 2592000) {
		return `${Math.floor(secondsPast / 86400)} days ago`;
	}
	if (secondsPast < 31104000) {
		return `${Math.floor(secondsPast / 2592000)} months ago`;
	}
	return `${Math.floor(secondsPast / 31104000)} years ago`;
};

export const msToTime = (duration: number) => {
	//hours , minutes and seconds
	const seconds = Math.floor((duration / 1000) % 60);
	const minutes = Math.floor((duration / (1000 * 60)) % 60);
	const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
	return `${hours}h${minutes}m${seconds}s`;
};
