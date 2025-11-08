import http from '@/api/http';
import { type PasswordResetResponse } from '@definitions/auth';

const performPasswordReset = (
    email: string,
    data: { token: string; password: string; passwordConfirmation: string },
): Promise<PasswordResetResponse> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/password/reset', {
            email,
            token: data.token,
            password: data.password,
            password_confirmation: data.passwordConfirmation,
        })
            .then(response =>
                resolve({
                    redirectTo: response.data.redirect_to,
                    sendToLogin: response.data.send_to_login,
                }),
            )
            .catch(reject);
    });
};

const requestPasswordReset = (
    email: string,
    code: string,
    password: string,
    password_confirm: string,
    recaptchaData?: string,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/password', { email, code, 'g-recaptcha-response': recaptchaData, password, password_confirm })
            .then(response => resolve(response.data.status || ''))
            .catch(reject);
    });
};

export { performPasswordReset, requestPasswordReset };
