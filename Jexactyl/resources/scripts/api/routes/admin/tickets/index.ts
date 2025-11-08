import http from '@/api/http';
import { TicketFilters, Values } from '@/api/routes/admin/tickets/types';
import { Ticket, Transformers } from '@definitions/admin';
import { SWRResponse } from 'swr';
import { AxiosError } from 'axios';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { createPaginatedHook, createContext } from '@/api';

export const Context = createContext<TicketFilters>();

export const getTickets = createPaginatedHook<Ticket, TicketFilters>({
    url: '/api/application/tickets',
    swrKey: 'tickets',
    context: Context,
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
