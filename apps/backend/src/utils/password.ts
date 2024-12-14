import bcrypt from "bcrypt";

export async function saltAndHashPassword(password: string) {
	try {
		// generate hashed password
		const hashedPassword = await bcrypt.hash(password, 12);
		return hashedPassword;
	} catch (error: any) {
		throw new Error(`Error salting and hashing password: ${error.message}`);
	}
}

export async function comparePasswordToHash(password: string, hash: string) {
	const match = await bcrypt.compare(password, hash);
	return match;
}

export default { saltAndHashPassword, comparePasswordToHash };
