import { action, Action } from 'easy-peasy';
import { Database } from '@definitions/server';

export interface ServerDatabaseStore {
    data: Database[];
    setDatabases: Action<ServerDatabaseStore, Database[]>;
    appendDatabase: Action<ServerDatabaseStore, Database>;
    removeDatabase: Action<ServerDatabaseStore, string>;
}

const databases: ServerDatabaseStore = {
    data: [],

    setDatabases: action((state, payload) => {
        state.data = payload;
    }),

    appendDatabase: action((state, payload) => {
        if (state.data.find(database => database.id === payload.id)) {
            state.data = state.data.map(database => (database.id === payload.id ? payload : database));
        } else {
            state.data = [...state.data, payload];
        }
    }),

    removeDatabase: action((state, payload) => {
        state.data = [...state.data.filter(database => database.id !== payload)];
    }),
};

export default databases;
