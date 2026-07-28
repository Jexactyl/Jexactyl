import type { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import type { SWRResponse } from 'swr';
import useSWR from 'swr';

import type { WithRelationships } from '@/api/routes/admin';
import { withRelationships } from '@/api/routes/admin';
import type { QueryBuilderParams } from '@/api/http';
import http, { withQueryBuilderParams } from '@/api/http';
import { Egg, EggEntry, EggVariable, Transformers } from '@definitions/admin';

/**
 * A standard API response with the minimum viable details for the frontend
 * to correctly render a egg.
 */
export type LoadedEgg = WithRelationships<Egg, 'nest' | 'variables'>;

/**
 * Gets a single egg from the database and returns it.
 */
export const getEgg = async (id: number | string): Promise<LoadedEgg> => {
    const { data } = await http.get(`/api/application/eggs/${id}`, {
        params: {
            include: ['nest', 'variables'],
        },
    });

    return withRelationships(Transformers.toEgg(data), 'nest', 'variables');
};

export const searchEggs = async (
    nestId: number,
    params: QueryBuilderParams<'name'>,
): Promise<WithRelationships<Egg, 'variables'>[]> => {
    const { data } = await http.get(`/api/application/nests/${nestId}/eggs`, {
        params: {
            ...withQueryBuilderParams(params),
            include: ['variables'],
        },
    });

    return data.data.map(Transformers.toEgg);
};

export const exportEgg = async (eggId: number): Promise<string> => {
    const { data } = await http.get(`/api/application/eggs/${eggId}/export`);
    return data;
};

/**
 * Returns an SWR instance by automatically loading in the server for the currently
 * loaded route match in the admin area.
 */
export const useEggFromRoute = (): SWRResponse<LoadedEgg, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/eggs/${params.id}`, async () => getEgg(Number(params.id)), {
        revalidateOnMount: false,
        revalidateOnFocus: false,
    });
};

export const getEggEntry = async (id: number): Promise<EggEntry> => {
    const { data } = await http.get(`/api/application/eggs/${id}`, { params: { include: ['variables'] } });

    return Transformers.toEggEntry(data);
};

export const useEggEntry = (id: number) => {
    return useSWR<EggEntry>(`egg:${id}`, async () => {
        const { data } = await http.get(`/api/application/eggs/${id}`, { params: { include: ['variables'] } });

        return Transformers.toEggEntry(data);
    });
};

type EggEntry2 = Omit<Omit<Partial<EggEntry>, 'configFiles'>, 'configStartup'> & {
    configFiles: string;
    configStartup: string;
};

export const createEggEntry = (egg: Partial<EggEntry2>): Promise<EggEntry> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/eggs', {
            nest_id: egg.nestId,
            name: egg.name,
            description: egg.description,
            features: egg.features,
            docker_images: egg.dockerImages,
            config_files: egg.configFiles,
            config_startup: egg.configStartup,
            config_stop: egg.configStop,
            startup: egg.startup,
            script_container: egg.scriptContainer,
            script_entry: egg.scriptEntry,
            script_install: egg.scriptInstall,
        })
            .then(({ data }) => resolve(Transformers.toEggEntry(data)))
            .catch(reject);
    });
};

type EggEntry3 = Omit<Omit<Partial<EggEntry>, 'configFiles'>, 'configStartup'> & {
    configFiles?: string;
    configStartup?: string;
};

export const updateEggEntry = (id: number, egg: Partial<EggEntry3>): Promise<EggEntry> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/eggs/${id}`, {
            nest_id: egg.nestId,
            name: egg.name,
            description: egg.description,
            features: egg.features,
            docker_images: egg.dockerImages,
            config_files: egg.configFiles,
            config_startup: egg.configStartup,
            config_stop: egg.configStop,
            config_from: egg.configFrom,
            startup: egg.startup,
            script_container: egg.scriptContainer,
            copy_script_from: egg.copyScriptFrom,
            script_entry: egg.scriptEntry,
            script_is_privileged: egg.scriptIsPrivileged,
            script_install: egg.scriptInstall,
        })
            .then(({ data }) => resolve(Transformers.toEggEntry(data)))
            .catch(reject);
    });
};

export const deleteEggEntry = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/eggs/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export type CreateEggVariable = Omit<EggVariable, 'id' | 'eggId' | 'createdAt' | 'updatedAt' | 'relationships'>;

export const createEggVariable = async (eggId: number, variable: CreateEggVariable): Promise<EggVariable> => {
    const { data } = await http.post(`/api/application/eggs/${eggId}/variables`, {
        name: variable.name,
        description: variable.description,
        env_variable: variable.environmentVariable,
        default_value: variable.defaultValue,
        user_viewable: variable.isUserViewable,
        user_editable: variable.isUserEditable,
        rules: variable.rules,
    });

    return Transformers.toEggVariable(data);
};

export const updateEggVariables = async (
    eggId: number,
    variables: Omit<EggVariable, 'eggId' | 'createdAt' | 'updatedAt'>[],
): Promise<EggVariable[]> => {
    const { data } = await http.patch(
        `/api/application/eggs/${eggId}/variables`,
        variables.map(variable => ({
            id: variable.id,
            name: variable.name,
            description: variable.description,
            env_variable: variable.environmentVariable,
            default_value: variable.defaultValue,
            user_viewable: variable.isUserViewable,
            user_editable: variable.isUserEditable,
            rules: variable.rules,
        })),
    );

    return data.data.map(Transformers.toEggVariable);
};

export const deleteEggVariable = (eggId: number, variableId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/eggs/${eggId}/variables/${variableId}`)
            .then(() => resolve())
            .catch(reject);
    });
};
