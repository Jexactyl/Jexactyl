import http from '@/api/http';
import { Nest, rawDataToNest } from '@/api/routes/admin/nests/getNests';

export default (name: string, description: string | null, author: string, include: string[] = []): Promise<Nest> => {
    return new Promise((resolve, reject) => {
        http.post(
            '/api/application/nests',
            {
                name,
                description,
                author,
            },
            { params: { include: include.join(',') } },
        )
            .then(({ data }) => resolve(rawDataToNest(data)))
            .catch(reject);
    });
};
