import http, {
    FractalPaginatedResponse,
    PaginatedResult,
    QueryBuilderParams,
    getPaginationSet,
    withQueryBuilderParams,
} from '@/api/http';
import { Transformers, User } from '@/api/definitions/admin';
import { AxiosError } from 'axios';
import { SWRConfiguration, SWRResponse } from 'swr';
import useSWR from 'swr';
import { createContext } from '@/api/admin';
import { TicketMessage } from '../getTickets';

const filters = ['id'] as const;
export type Filters = (typeof filters)[number];

export interface ContextFilters {
    id: number;
    message: string;
    author: User;
    createdAt: Date;
    updatedAt?: Date | null;
}

export const Context = createContext<ContextFilters>();

const getTicketMessages = (id: number): Promise<TicketMessage> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/tickets/${id}/messages`)
            .then(({ data }) => resolve(Transformers.toTicketMessage(data)))
            .catch(reject);
    });
};

const useGetTicketMessages = (
    id: number,
    config?: SWRConfiguration,
    params?: QueryBuilderParams<Filters>,
): SWRResponse<PaginatedResult<TicketMessage>, AxiosError> => {
    return useSWR<PaginatedResult<TicketMessage>>(
        [`/api/application/tickets/${id}/messages`, JSON.stringify(params)],
        async () => {
            const { data } = await http.get<FractalPaginatedResponse>(`/api/application/tickets/${id}/messages`, {
                params: withQueryBuilderParams(params),
            });

            return {
                items: (data.data || []).map(Transformers.toTicketMessage),
                pagination: getPaginationSet(data.meta.pagination),
            };
        },
        config || { revalidateOnMount: true, revalidateOnFocus: false },
    );
};

export { getTicketMessages, useGetTicketMessages };
