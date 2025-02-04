export function createDBUrl({
	user = process.env.DATABASE_USER,
	password = process.env.DATABASE_PASSWORD,
	host = process.env.DATABASE_HOST,
	port = Number(process.env.DATABASE_PORT),
	db = process.env.DATABASE_DB,
	schema = process.env.DATABASE_SCHEMA,
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
