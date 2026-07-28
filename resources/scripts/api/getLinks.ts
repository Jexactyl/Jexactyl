import http from '@/api/http';
import { CustomLink, Transformers } from '@definitions/admin';

export const getLinks = (): Promise<CustomLink[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/links`)
            .then(({ data }) => resolve((data.data || []).map((datum: any) => Transformers.toCustomLink(datum))))
            .catch(reject);
    });
};
