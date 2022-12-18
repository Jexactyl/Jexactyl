import http from '@/api/http';

export type TicketStatus = 'pending' | 'resolved' | 'unresolved' | 'in-progress';

export interface Ticket {
    id: number;
    staffEmail: string;
    title: string;
    status: TicketStatus;
    content: string[];
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface TicketMessage {
    id: number;
    userEmail: string;
    content: string[];
    createdAt: Date | null;
    updatedAt: Date | null;
}

export const rawDataToTicket = (data: any): Ticket => ({
    id: data.id,
    staffEmail: data.staff_email,
    title: data.title,
    status: data.status,
    content: data.content,
    createdAt: data.created_at ? new Date(data.created_at) : null,
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
});

export const rawDataToTicketMessage = (data: any): TicketMessage => ({
    id: data.id,
    userEmail: data.user_email,
    content: data.content,
    createdAt: data.created_at ? new Date(data.created_at) : null,
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
});

// API actions for ticket handling.

export const getTickets = (): Promise<Ticket[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/tickets')
            .then(({ data }) => resolve((data.data || []).map((d: any) => rawDataToTicket(d.attributes))))
            .catch(reject);
    });
};

export const getTicket = (id: number): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/account/tickets/${id}`)
            .then(({ data }) => resolve(rawDataToTicket(data.attributes)))
            .catch(reject);
    });
};

export const deleteTicket = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/account/tickets/${id}`)
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};

export const createTicket = (title: string, description: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/tickets', { title, description })
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};

// API actions for ticket messages.

export const createMessage = (id: number, description: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/account/tickets/${id}/messages`, { description })
            .then((data) => resolve(data.data))
            .catch(reject);
    });
};

export const getMessages = (id: number): Promise<TicketMessage[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/account/tickets/${id}/messages`)
            .then(({ data }) => resolve((data.data || []).map((d: any) => rawDataToTicketMessage(d.attributes))))
            .catch(reject);
    });
};
