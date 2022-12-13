import http from '@/api/http';

type TicketStatus = 'pending' | 'resolved' | 'unresolved' | 'in-progress';

export interface Ticket {
    id: number;
    staffEmail: string;
    title: string;
    status: TicketStatus;
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

export const getTickets = (): Promise<Ticket[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/tickets')
            .then(({ data }) => resolve((data.data || []).map((d: any) => rawDataToTicket(d.attributes))))
            .catch(reject);
    });
};
