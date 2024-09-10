import http from '@/api/http';

export default (
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
