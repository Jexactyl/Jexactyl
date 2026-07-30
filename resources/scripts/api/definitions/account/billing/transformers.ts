/* eslint-disable camelcase */
import { FractalResponseData } from '@/api/http';
import { Transformers as ServerTransformers } from '../../server';
import * as Models from '@definitions/account/billing/models';
import { transform } from '@definitions/helpers';

export default class Transformers {
    static toOrder = ({ attributes: data }: FractalResponseData): Models.Order => {
        const { server } = data.relationships || {};

        return {
            id: data.id,
            name: data.name,
            user_id: data.user_id,
            description: data.description,
            total: data.total,
            status: data.status,
            product_id: data.product_id,
            type: data.type,
            server_id: data.server_id ?? null,
            metadata: data.metadata ?? null,
            created_at: new Date(data.created_at),

            relationships: {
                server: transform(server as FractalResponseData, ServerTransformers.toServer, null),
            },
        };
    };

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
        deployable: data.deployable ?? false,
        deployableFree: data.deployable_free ?? false,
        deploymentFee: data.deployment_fee ?? 0,
    });

    static toEgg = ({ attributes: data }: FractalResponseData): Models.Egg => ({
        id: data.id,
        uuid: data.uuid,
        name: data.name,
    });

    static toDiscountCode = ({ attributes: data }: FractalResponseData): Models.DiscountCode => ({
        code: data.code,
        description: data.description,
        type: data.type,
        value: data.value,
    });
}
