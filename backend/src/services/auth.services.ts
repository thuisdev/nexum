import bcrypt from 'bcrypt'

interface PwCredentials {
    password: string;
    hashedPassword: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async ({
    password,
    hashedPassword,
}: PwCredentials): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};