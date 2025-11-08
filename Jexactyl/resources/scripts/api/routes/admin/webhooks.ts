import http from '@/api/http';
import { Transformers } from '@definitions/admin';

export interface WebhookEvent {
    id: number;
    key: string;
    description: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
}

const update = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/webhooks`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};

const getEvents = async (): Promise<WebhookEvent[]> => {
    const { data } = await http.get(`/api/application/webhooks`);

    return data.data.map(Transformers.toWebhookEvent);
};

const toggleEventStatus = (enabled: boolean, id?: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/webhooks/toggle`, { id, enabled })
            .then(() => resolve())
            .catch(reject);
    });
};

const sendTestEvent = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/webhooks/test`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { update, getEvents, toggleEventStatus, sendTestEvent };
