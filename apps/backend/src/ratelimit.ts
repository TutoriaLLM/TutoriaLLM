import rateLimit from "express-rate-limit";

function apiLimiter(windowMs?: number, limit?: number) {
	return rateLimit({
		windowMs: windowMs || 15 * 60 * 1000, // 15 minutes
		limit: limit || 100, // limit each IP to 100 requests per windowMs
		standardHeaders: true, // Rate Limitヘッダーに関する情報を返す
		legacyHeaders: false, // 無効化されたRate Limitヘッダーを削除する
	});
}

export default apiLimiter;
