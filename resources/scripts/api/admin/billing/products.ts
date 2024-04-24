import { FractalResponseData } from '@/api/http';
import { Category, rawDataToCategory } from '@/api/admin/billing/categories';

export interface Product {
    id: number;
    uuid: string;
    categoryId: number;

    name: string;
    icon?: string;
    description: string;

    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };

    createdAt: Date;
    updatedAt?: Date | null;

    relationships: {
        category?: Category;
    };
}

export const rawDataToProduct = ({ attributes }: FractalResponseData): Product => ({
    id: attributes.id,
    uuid: attributes.uuid,
    categoryId: attributes.category_id,
    name: attributes.name,
    icon: attributes.icon,
    description: attributes.description,

    limits: {
        cpu: attributes.limits.cpu,
        memory: attributes.limits.memory,
        disk: attributes.limits.disk,
        backup: attributes.limits.backup,
        database: attributes.limits.database,
        allocation: attributes.limits.allocation,
    },

    createdAt: new Date(attributes.created_at),
    updatedAt: new Date(attributes.updated_at),

    relationships: {
        category:
            attributes.relationships?.category?.object === 'category'
                ? rawDataToCategory(attributes.relationships.category as FractalResponseData)
                : undefined,
    },
});
