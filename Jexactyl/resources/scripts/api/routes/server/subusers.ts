import http from '@/api/http';
import { Subuser, Transformers } from '@definitions/server';

const getSubusers = (uuid: string): Promise<Subuser[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/servers/${uuid}/users`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toSubuser)))
            .catch(reject);
    });
};

const modifySubuser = (
    uuid: string,
    params: { email: string; permissions: string[] },
    subuser?: Subuser,
): Promise<Subuser> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/users${subuser ? `/${subuser.uuid}` : ''}`, {
            ...params,
        })
            .then(data => resolve(Transformers.toSubuser(data.data)))
            .catch(reject);
    });
};

const deleteSubuser = (uuid: string, userId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/client/servers/${uuid}/users/${userId}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export { getSubusers, modifySubuser, deleteSubuser };
