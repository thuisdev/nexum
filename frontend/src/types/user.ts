export interface User {
    id: string;
    email: string;
    name: string | null;
    role: 'CLIENT' | 'FREELANCER' | 'ARBITER' | 'ADMIN';
    createdAt: string;
    displayName: string | null;
}