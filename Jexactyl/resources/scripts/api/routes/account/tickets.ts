import { AxiosError } from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useUserSWRKey } from '@/plugins/useSWRKey';
import http, { FractalResponseList } from '@/api/http';
import { Transformers, Ticket } from '@definitions/account';
import { useParams } from 'react-router-dom';

const useTickets = (config?: SWRConfiguration<Ticket[], AxiosError>) => {
    const key = useUserSWRKey(['account', 'tickets']);

    return useSWR(
        key,
        async () => {
            const { data } = await http.get('/api/client/account/tickets');

            return (data as FractalResponseList).data.map((datum: any) => {
                return Transformers.toTicket(datum);
            });
        },
        { revalidateOnMount: false, ...(config || {}) },
    );
};

const getTickets = (): Promise<Ticket[]> => {
    return new Promise((resolve, reject) => {
        http.get('/api/client/account/tickets')
            .then(({ data }) => resolve((data.data || []).map(Transformers.toTicket)))
            .catch(reject);
    });
};

const createTicket = async (title: string, message: string): Promise<Ticket> => {
    const { data } = await http.post('/api/client/account/tickets', { title, message });

    return Transformers.toTicket(data);
};

const createMessage = async (ticketId: number, message: string): Promise<Ticket> => {
    const { data } = await http.post(`/api/client/account/tickets/${ticketId}/messages`, {
        message,
        params: {
            include: ['messages'],
        },
    });

    return Transformers.toTicket(data);
};

const getTicket = async (id: number): Promise<Ticket> => {
    const { data } = await http.get(`/api/client/account/tickets/${id}`, {
        params: {
            include: ['messages'],
        },
    });

    return Transformers.toTicket(data);
};

/**
 * Returns an SWR instance by automatically loading in the ticket for the currently
 * loaded route match in the admin area.
 */
const useTicketFromRoute = (): SWRResponse<Ticket, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/client/account/tickets/${params.id}`, async () => getTicket(Number(params.id)));
};

const deleteTicket = async (id: number): Promise<void> => await http.delete(`/api/client/account/tickets/${id}`);

export { useTickets, getTickets, createTicket, getTicket, useTicketFromRoute, createMessage, deleteTicket };
