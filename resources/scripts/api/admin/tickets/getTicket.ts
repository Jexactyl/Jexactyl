import http from '@/api/http';
import { AxiosError } from 'axios';
import useSWR, { SWRResponse } from 'swr';
import { useParams } from 'react-router-dom';
import { Transformers } from '@/api/definitions/admin';
import { Ticket } from '@/api/admin/tickets/getTickets';

export const getTicket = async (id: number): Promise<Ticket> => {
    const { data } = await http.get(`/api/application/tickets/${id}`, {
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
export const useTicketFromRoute = (): SWRResponse<Ticket, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/tickets/${params.id}`, async () => getTicket(Number(params.id)));
};
