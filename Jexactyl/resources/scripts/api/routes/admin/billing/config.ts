import http from '@/api/http';

export const importBillingConfiguration = (
    uploadedJson: object,
    override: boolean,
    ignoreDuplicates: boolean,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/billing/config/import', {
            data: uploadedJson,
            override,
            ignore_duplicates: ignoreDuplicates,
        })
            .then(() => resolve())
            .catch(error => reject(error));
    });
};

export const exportBillingConfiguration = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/config/export`, { responseType: 'blob' })
            .then(({ data }) => {
                const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                });

                const url = window.URL.createObjectURL(jsonBlob);

                const link = document.createElement('a');
                link.href = url;
                link.download = 'data.json';
                link.click();

                window.URL.revokeObjectURL(url);

                resolve();
            })
            .catch(reject);
    });
};
