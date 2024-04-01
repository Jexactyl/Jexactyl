import http from '@/api/http';
import { Transformers } from '@/api/definitions/admin';
import { Ticket, TicketStatus } from '@/api/admin/tickets/getTickets';

export interface Values {
    user_id: number;
    assigned_to: number;
    status: TicketStatus;
}

export default (id: number, values: Values): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/tickets/${id}`, values)
            .then(({ data }) => resolve(Transformers.toTicket(data)))
            .catch(reject);
    });
};
