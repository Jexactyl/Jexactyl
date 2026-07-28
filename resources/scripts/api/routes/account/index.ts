import http from '@/api/http';

const updateAccountAvatarUrl = (avatarUrl: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/avatar', { avatar_url: avatarUrl })
            .then(({ data }) => resolve(data.attributes.avatar_url))
            .catch(reject);
    });
};

const uploadAccountAvatar = (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('avatar', file);

    return new Promise((resolve, reject) => {
        http.post('/api/client/account/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
            .then(({ data }) => resolve(data.attributes.avatar_url))
            .catch(reject);
    });
};

const removeAccountAvatar = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete('/api/client/account/avatar')
            .then(() => resolve())
            .catch(reject);
    });
};

const updateAccountEmail = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put('/api/client/account/email', { email, password })
            .then(() => resolve())
            .catch(reject);
    });
};

const updateAccountPassword = ({
    current,
    password,
    confirmPassword,
}: {
    current: string;
    password: string;
    confirmPassword: string;
}): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put('/api/client/account/password', {
            current_password: current,
            password: password,
            password_confirmation: confirmPassword,
        })
            .then(() => resolve())
            .catch(reject);
    });
};

const setupAccount = (values: { username: string; password: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/setup', values)
            .then(() => resolve())
            .catch(reject);
    });
};

export {
    updateAccountPassword,
    updateAccountEmail,
    setupAccount,
    updateAccountAvatarUrl,
    uploadAccountAvatar,
    removeAccountAvatar,
};
