export function createDBUrl({
	user = process.env.POSTGRES_USER,
	password = process.env.POSTGRES_PASSWORD,
	host = process.env.DB_HOST,
	port = Number(process.env.DB_PORT),
	db = process.env.POSTGRES_DB,
	schema = process.env.DATABASE_SCHEMA || "public",
}: {
	user?: string;
	password?: string;
	host?: string;
	port?: number;
	db?: string;
	schema?: string;
}) {
	return `postgresql://${user}:${password}@${host}:${port}/${db}?schema=${schema}`;
}
