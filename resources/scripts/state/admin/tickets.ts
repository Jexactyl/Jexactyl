import type { Action } from 'easy-peasy';
import { action } from 'easy-peasy';

interface AdminTicketStore {
    selectedTickets: number[];

    setSelectedTickets: Action<AdminTicketStore, number[]>;
    appendSelectedTicket: Action<AdminTicketStore, number>;
    removeSelectedTicket: Action<AdminTicketStore, number>;
}

const tickets: AdminTicketStore = {
    selectedTickets: [],

    setSelectedTickets: action((state, payload) => {
        state.selectedTickets = payload;
    }),

    appendSelectedTicket: action((state, payload) => {
        state.selectedTickets = state.selectedTickets.filter(id => id !== payload).concat(payload);
    }),

    removeSelectedTicket: action((state, payload) => {
        state.selectedTickets = state.selectedTickets.filter(id => id !== payload);
    }),
};

export type { AdminTicketStore };
export default tickets;
