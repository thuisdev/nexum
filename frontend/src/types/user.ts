export interface User {
    id: string;
    email: string | null;
    name: string;
    role: 'CLIENT' | 'FREELANCER' | 'ARBITER' | 'ADMIN';
    createdAt: string;
}