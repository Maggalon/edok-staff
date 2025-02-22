export interface TelegramUser {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
}

export interface Company {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface CompanyUser {
    id: string;
    company_id: string;
    telegram_id: number;
    role: 'admin' | 'user';
    created_at: string;
}