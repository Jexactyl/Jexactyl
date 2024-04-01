import http from '@/api/http';
import { Transformers } from '@/api/definitions/admin';
import { TicketMessage } from '@/api/admin/tickets/getTickets';

export interface Values {
    message: string;
}

export default (id: number, values: Values): Promise<TicketMessage> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/tickets/${id}/messages`, values)
            .then(({ data }) => resolve(Transformers.toTicketMessage(data)))
            .catch(reject);
    });
};
