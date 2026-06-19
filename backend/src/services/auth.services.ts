import bcrypt from 'bcrypt';

interface PasswordCredentials {
  password: string;
  hashedPassword: string;
}

/** Hash plain password for storage (Register). */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/** Compare plain password with stored hash (Login). */
export const comparePassword = async ({
  password,
  hashedPassword,
}: PasswordCredentials): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
