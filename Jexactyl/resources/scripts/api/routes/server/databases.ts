import http from '@/api/http';
import { Database, Transformers } from '@definitions/server';

const getDatabases = (uuid: string, includePassword = true): Promise<Database[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/databases`, {
            params: includePassword ? { include: 'password' } : undefined,
        })
            .then(response => resolve((response.data.data || []).map(Transformers.toDatabase)))
            .catch(reject);
    });
};

const createDatabase = (uuid: string, data: { connectionsFrom: string; databaseName: string }): Promise<Database> => {
    return new Promise((resolve, reject) => {
        http.post(
            `/api/client/servers/${uuid}/databases`,
            {
                database: data.databaseName,
                remote: data.connectionsFrom,
            },
            {
                params: { include: 'password' },
            },
        )
            .then(response => resolve(Transformers.toDatabase(response.data)))
            .catch(reject);
    });
};

const rotateDatabasePassword = (uuid: string, database: string): Promise<Database> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/databases/${database}/rotate-password`)
            .then(response => resolve(Transformers.toDatabase(response.data)))
            .catch(reject);
    });
};

const deleteDatabase = (uuid: string, database: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/databases/${database}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { getDatabases, createDatabase, rotateDatabasePassword, deleteDatabase };
