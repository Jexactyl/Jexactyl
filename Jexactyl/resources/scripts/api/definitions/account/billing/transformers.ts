/* eslint-disable camelcase */
import { FractalResponseData } from '@/api/http';
import * as Models from '@definitions/account/billing/models';

export default class Transformers {
    static toOrder = ({ attributes: data }: FractalResponseData): Models.Order => ({
        id: data.id,
        name: data.name,
        user_id: data.user_id,
        description: data.description,
        total: data.total,
        status: data.status,
        product_id: data.product_id,
        type: data.type,
        created_at: new Date(data.created_at),
    });

    static toCategory = ({ attributes: data }: FractalResponseData): Models.Category => ({
        id: data.id,
        name: data.name,
        icon: data.icon,
        description: data.description,
    });

    static toProduct = ({ attributes: data }: FractalResponseData): Models.Product => ({
        id: data.id,
        name: data.name,
        icon: data.icon,
        price: data.price,
        description: data.description,
        eggId: data.egg_id,
        limits: {
            cpu: data.limits.cpu,
            memory: data.limits.memory,
            disk: data.limits.disk,
            backup: data.limits.backup,
            database: data.limits.database,
            allocation: data.limits.allocation,
        },
    });

    static toNode = ({ attributes: data }: FractalResponseData): Models.Node => ({
        id: data.id,
        name: data.name,
        fqdn: data.fqdn,
    });
}
