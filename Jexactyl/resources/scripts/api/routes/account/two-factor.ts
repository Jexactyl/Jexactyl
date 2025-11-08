import http from '@/api/http';

const getTwoFactorTokenData = (): Promise<{ image_url_data: string; secret: string }> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/two-factor')
            .then(({ data }) => resolve(data.data))
            .catch(reject);
    });
};

const disableTwoFactor = (password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/two-factor/disable', { password })
            .then(() => resolve())
            .catch(reject);
    });
};

const enableTwoFactor = async (code: string, password: string): Promise<string[]> => {
    const { data } = await http.post('/api/client/account/two-factor', { code, password });

    return data.attributes.tokens;
};

export { getTwoFactorTokenData, disableTwoFactor, enableTwoFactor };
