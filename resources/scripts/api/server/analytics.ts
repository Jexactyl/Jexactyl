import http from '@/api/http';

export interface Analytics {
    id: number;
    cpu: number;
    memory: number;
    disk: number;
}

export interface Message {
    id: number;
    title: string;
    content: string;
    type: 'success' | 'info' | 'warning' | 'danger';
    createdAt: string;
}

export const rawDataToAnalytics = (data: any): Analytics => ({
    id: data.id,
    cpu: data.cpu,
    memory: data.memory,
    disk: data.disk,
});

export const rawDataToMessage = (data: any): Message => ({
    id: data.id,
    title: data.title,
    content: data.content,
    type: data.type,
    createdAt: data.created_at,
});

export const getAnalytics = (uuid: string): Promise<Analytics> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/analytics`)
            .then(({ data }) => resolve(rawDataToAnalytics(data.attributes)))
            .catch(reject);
    });
};

export const getMessages = (uuid: string): Promise<Message[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/analytics/messages`)
            .then(({ data }) => resolve((data.data || []).map((d: any) => rawDataToMessage(d.attributes))))
            .catch(reject);
    });
};
