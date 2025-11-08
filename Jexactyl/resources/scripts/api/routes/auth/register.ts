import http from '@/api/http';

export interface LoginData {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
    recaptchaData?: string | null;
}

export default ({ username, email, password, confirm_password, recaptchaData }: LoginData): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.get('/sanctum/csrf-cookie')
            .then(() =>
                http.post('/auth/register', {
                    username,
                    email,
                    password,
                    confirm_password,
                    'g-recaptcha-response': recaptchaData,
                }),
            )
            .then(() => resolve())
            .catch(reject);
    });
};
