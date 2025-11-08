import http from '@/api/http';
import { CustomLink, rawDataToLink } from './routes/admin/links';

export const getLinks = (): Promise<CustomLink[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/links`)
            .then(({ data }) => resolve((data.data || []).map((datum: any) => rawDataToLink(datum))))
            .catch(reject);
    });
};
