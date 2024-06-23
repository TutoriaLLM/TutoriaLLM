const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time)); //timeはミリ秒

export default sleep;
