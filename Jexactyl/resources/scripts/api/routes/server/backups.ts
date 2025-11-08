import useSWR from 'swr';
import { ServerContext } from '@/state/server';
import { createContext, useContext } from 'react';
import type { PaginatedResult } from '@/api/http';
import { Transformers, type Backup } from '@definitions/server';
import http, { getPaginationSet } from '@/api/http';

interface ctx {
    page: number;
    setPage: (value: number | ((s: number) => number)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

type BackupResponse = PaginatedResult<Backup> & { backupCount: number };

const getBackups = () => {
    const { page } = useContext(Context);
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);

    return useSWR<BackupResponse>(['server:backups', uuid, page], async () => {
        const { data } = await http.get(`/api/client/servers/${uuid}/backups`, { params: { page } });

        return {
            items: (data.data || []).map(Transformers.toBackup),
            pagination: getPaginationSet(data.meta.pagination),
            backupCount: data.meta.backup_count,
        };
    });
};

const createBackup = async (
    uuid: string,
    params: { name?: string; ignored?: string; isLocked: boolean },
): Promise<Backup> => {
    const { data } = await http.post(`/api/client/servers/${uuid}/backups`, {
        name: params.name,
        ignored: params.ignored,
        is_locked: params.isLocked,
    });

    return Transformers.toBackup(data);
};

const getBackupUrl = (uuid: string, backup: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/backups/${backup}/download`)
            .then(({ data }) => resolve(data.attributes.url))
            .catch(reject);
    });
};

const restoreBackup = async (uuid: string, backup: string, truncate?: boolean): Promise<void> => {
    await http.post(`/api/client/servers/${uuid}/backups/${backup}/restore`, {
        truncate,
    });
};

const deleteBackup = (uuid: string, backup: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/backups/${backup}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { getBackups, createBackup, getBackupUrl, restoreBackup, deleteBackup };
