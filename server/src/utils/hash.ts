import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const hashCode = async (code: string): Promise<string> => {
  return await bcrypt.hash(code, 20);
};

export const comparePassword = async (
  password: string,
  hashed: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};

export const compareCode = async (
  code: string,
  hashed: string,
): Promise<boolean> => {
  return await bcrypt.compare(code, hashed);
};
