import { Model } from '@definitions';

interface LoginData extends Model {
    username: string;
    password: string;
    recaptchaData?: string | null;
}

interface RegisterData extends LoginData {
    email: string;
    confirm_password: string;
}

interface AuthResponse extends Model {
    complete: boolean;
    intended?: string;
    confirmationToken?: string;
}

interface PasswordResetResponse extends Model {
    redirectTo?: string | null;
    sendToLogin: boolean;
}
