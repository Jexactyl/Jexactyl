import http from '@/api/http';
import { Nest, rawDataToNest } from '@/api/routes/admin/nests/getNests';

export default (
    id: number,
    name: string,
    description: string | null,
    author: string,
    include: string[] = [],
): Promise<Nest> => {
    return new Promise((resolve, reject) => {
        http.patch(
            `/api/application/nests/${id}`,
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
