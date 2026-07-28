import http from '@/api/http';
import { Ticket, TicketMessage, Transformers, User } from '@definitions/admin';
import { SWRResponse } from 'swr';
import { AxiosError } from 'axios';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { createPaginatedHook, createContext } from '@/api';

export type TicketStatus = 'resolved' | 'unresolved' | 'in-progress' | 'pending';

export interface Values {
    title?: string;
    user_id?: number;
    assigned_to?: number | null;
    status?: TicketStatus;
}

export interface TicketFilters {
    id?: number;
    title?: string;
    user?: User;
    assigned_to?: User;
    status?: TicketStatus;
    created_at?: Date;
    updated_at?: Date | null;
}

export interface TicketMessageFilters {
    id?: number;
}

export interface CreateTicketMessageValues {
    ticket_id: number;
    message: string;
}

export const TicketsContext = createContext<TicketFilters>();

export const getTickets = createPaginatedHook<Ticket, TicketFilters>({
    url: '/api/application/tickets',
    swrKey: 'tickets',
    context: TicketsContext,
    transformer: Transformers.toTicket,
});

export const useTicketFromRoute = (): SWRResponse<Ticket, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/tickets/${params.id}`, async () => {
        const { data } = await http.get(`/api/application/tickets/${params.id}`);

        return Transformers.toTicket(data);
    });
};

export const deleteTicket = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/tickets/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateTicket = (id: number, values: Values): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/tickets/${id}`, values)
            .then(({ data }) => resolve(Transformers.toTicket(data)))
            .catch(reject);
    });
};

export const updateTicketSettings = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/tickets/settings`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};

export const createTicket = (values: Values): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/tickets', values)
            .then(({ data }) => resolve(Transformers.toTicket(data)))
            .catch(reject);
    });
};

export const TicketMessagesContext = createContext<TicketMessageFilters>();

export const getTicketMessages = (id: number) =>
    createPaginatedHook<TicketMessage, TicketMessageFilters>({
        url: `/api/application/tickets/${id}/messages`,
        swrKey: `ticket_messages:${id}`,
        context: TicketMessagesContext,
        transformer: Transformers.toTicketMessage,
    })();

export const createMessage = (values: CreateTicketMessageValues): Promise<TicketMessage> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/tickets/message`, values)
            .then(({ data }) => resolve(Transformers.toTicketMessage(data)))
            .catch(reject);
    });
};
