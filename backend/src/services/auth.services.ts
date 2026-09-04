import bcrypt from 'bcrypt';

interface PasswordCredentials {
  password: string;
  hashedPassword: string;
}

/** Valid bcrypt hash used when no user exists so login timing stays even. */
export const DUMMY_PASSWORD_HASH =
  '$2b$10$sbjJiXpZhAwRzivoeucCFezvfmw1wsJNDHgGR1uKjH56h5URUBOIi';

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