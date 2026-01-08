import { createContext, createPaginatedHook } from '@/api';
import { ServerPreset, Transformers } from '@definitions/admin';
import { ServerPresetFilters, ServerPresetValues } from '@/api/routes/admin/servers/types';
import http from '@/api/http';

export const Context = createContext<ServerPresetFilters>();

const getServerPresets = createPaginatedHook<ServerPreset, ServerPresetFilters>({
    url: '/api/application/servers/presets',
    swrKey: 'server_presets',
    context: Context,
    transformer: Transformers.toServerPreset,
});

const getServerPreset = (id: number): Promise<ServerPreset> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/servers/presets/${id}`)
            .then(({ data }) => resolve(Transformers.toServerPreset(data)))
            .catch(reject);
    });
};

const createServerPreset = (values: ServerPresetValues): Promise<ServerPreset> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/servers/presets', values)
            .then(({ data }) => resolve(Transformers.toServerPreset(data)))
            .catch(reject);
    });
};

const createServerFromPreset = (preset_id: number, node_id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/servers/preset', { preset_id, node_id })
            .then(() => resolve())
            .catch(reject);
    });
};

const updateServerPreset = (id: number, values: ServerPresetValues): Promise<ServerPreset> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/servers/presets/${id}`, values)
            .then(({ data }) => resolve(Transformers.toServerPreset(data)))
            .catch(reject);
    });
};

const deleteServerPreset = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/servers/presets/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export {
    getServerPresets,
    getServerPreset,
    createServerPreset,
    createServerFromPreset,
    updateServerPreset,
    deleteServerPreset,
};
