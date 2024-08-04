let html;

console.log(`your website is online: api/vm/${code}/web/`);

// vmExpressはコンテキストとして利用可能
workerExpress.get("/web", async (req, res) => {
	const latestHtml = html;
	res.send(latestHtml);
});
