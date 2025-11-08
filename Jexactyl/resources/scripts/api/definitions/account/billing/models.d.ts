import { Model } from '@definitions';
import { OrderType } from '@/api/routes/account/billing/orders/types';

interface Order extends Model {
    id: number;
    name: string;
    user_id: number;
    description: string;
    total: number;
    product_id: number;
    status: OrderStatus;
    type: OrderType;
    created_at: Date;
}

interface Category extends Model {
    id: string;
    name: string;
    icon?: string;
    description?: string;
}

interface Product extends Model {
    id: number;
    name: string;
    icon?: string;
    price: number;
    description?: string;
    eggId: number;
    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };
}

interface Node extends Model {
    id: string;
    name: string;
    fqdn: string;
}

interface StripeIntent extends Model {
    id: string;
    secret: string;
}
