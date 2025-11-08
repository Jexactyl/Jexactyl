import http from '@/api/http';
import { type AuthResponse, type LoginData } from '@definitions/auth';

const login = ({ username, password, recaptchaData }: LoginData): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        http.get('/sanctum/csrf-cookie')
            .then(() =>
                http.post('/auth/login', {
                    user: username,
                    password,
                    'g-recaptcha-response': recaptchaData,
                }),
            )
            .then(response => {
                if (!(response.data instanceof Object)) {
                    return reject(new Error('An error occurred while processing the login request.'));
                }

                return resolve({
                    complete: response.data.data.complete,
                    intended: response.data.data.intended || undefined,
                    confirmationToken: response.data.data.confirmation_token || undefined,
                });
            })
            .catch(reject);
    });
};

const externalLogin = (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.get('/sanctum/csrf-cookie')
            .then(() => http.post(`/auth/modules/${name}`))
            .then(({ data }) => resolve(data || []))
            .catch(reject);
    });
};

const checkpoint = (token: string, code: string, recoveryToken?: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/login/checkpoint', {
            confirmation_token: token,
            authentication_code: code,
            recovery_token: recoveryToken && recoveryToken.length > 0 ? recoveryToken : undefined,
        })
            .then(response =>
                resolve({
                    complete: response.data.data.complete,
                    intended: response.data.data.intended || undefined,
                }),
            )
            .catch(reject);
    });
};

export { login, externalLogin, checkpoint };
