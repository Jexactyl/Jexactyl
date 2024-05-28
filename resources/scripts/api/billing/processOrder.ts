import http from '@/api/http';

export default (sessionId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/billing/process`, { session_id: sessionId })
            .then(() => resolve())
            .catch(reject);
    });
};
