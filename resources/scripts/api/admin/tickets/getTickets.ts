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

export type TicketStatus = 'resolved' | 'unresolved' | 'in-progress' | 'pending';

const filters = ['id'] as const;
export type Filters = (typeof filters)[number];

export interface Ticket {
    id: number;
    title: string;
    user: User;
    assignedTo?: User;
    status: TicketStatus;
    createdAt: Date;
    updatedAt?: Date | null;
    relationships: {
        messages?: TicketMessage[];
    };
}

export interface TicketMessage {
    id: number;
    message: string;
    author: User;
    createdAt: Date;
    updatedAt?: Date | null;
}

export interface ContextFilters {
    id: number;
    title: string;
    user: User;
    assignedTo?: User;
    status: TicketStatus;
    createdAt: Date;
    updatedAt?: Date | null;
}

export const Context = createContext<ContextFilters>();

const getTickets = (): Promise<Ticket> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/tickets`)
            .then(({ data }) => resolve(Transformers.toTicket(data)))
            .catch(reject);
    });
};

const useGetTickets = (
    params?: QueryBuilderParams<Filters>,
    config?: SWRConfiguration,
): SWRResponse<PaginatedResult<Ticket>, AxiosError> => {
    return useSWR<PaginatedResult<Ticket>>(
        ['/api/application/tickets', JSON.stringify(params)],
        async () => {
            const { data } = await http.get<FractalPaginatedResponse>('/api/application/tickets', {
                params: withQueryBuilderParams(params),
            });

            return {
                items: (data.data || []).map(Transformers.toTicket),
                pagination: getPaginationSet(data.meta.pagination),
            };
        },
        config || { revalidateOnMount: true, revalidateOnFocus: false },
    );
};

export { getTickets, useGetTickets };
