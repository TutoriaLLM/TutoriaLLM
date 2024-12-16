import argon2 from "argon2";
export async function saltAndHashPassword(password: string) {
	try {
		// generate hashed password
		const hashedPassword = await argon2.hash(password);
		return hashedPassword;
	} catch (error: any) {
		throw new Error(`Error salting and hashing password: ${error.message}`);
	}
}

export async function comparePasswordToHash(password: string, hash: string) {
	const match = await argon2.verify(hash, password);
	return match;
}

export default { saltAndHashPassword, comparePasswordToHash };
