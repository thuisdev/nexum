export interface RegisterCredentials {
    email: string;
    password: string;
    role?: 'CLIENT' | 'FREELANCER';
    name?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}