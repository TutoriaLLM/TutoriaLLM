// utils/password.js

import bcrypt from "bcrypt";

// Define the number of salt rounds
const saltRounds = 10;

export async function saltAndHashPassword(password: string) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error: any) {
    throw new Error("Error salting and hashing password: " + error.message);
  }
}

export default saltAndHashPassword;
