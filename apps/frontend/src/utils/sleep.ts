const sleep = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time)); // time is milliseconds.

export default sleep;
