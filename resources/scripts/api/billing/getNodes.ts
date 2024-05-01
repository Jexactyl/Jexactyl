import { transform } from '@definitions/helpers';
import http, { FractalResponseData } from '@/api/http';

export interface Node {
    id: string;
    name: string;
    fqdn: string;

    relationships: {
        location: Location | undefined;
    };
}

export interface Location {
    id: number;
    short: string;
}

export const rawDataToLocation = ({ attributes }: FractalResponseData): Location => ({
    id: attributes.id,
    short: attributes.short,
});

export const rawDataToNode = ({ attributes: data }: FractalResponseData): Node => ({
    id: data.id,
    name: data.name,
    fqdn: data.fqdn,
    relationships: {
        location: transform(data.relationships?.location as FractalResponseData, rawDataToLocation),
    },
});

export default (): Promise<Node[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/client/billing/nodes`, { params: { include: 'location' } })
            .then(({ data }) => resolve((data.data || []).map((datum: any) => rawDataToNode(datum))))
            .catch(reject);
    });
};
