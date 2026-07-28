import { AxiosError } from 'axios';
import useSWR, { SWRResponse } from 'swr';
import { withRelationships } from '@/api/routes/admin';
import { useParams } from 'react-router-dom';
import http from '@/api/http';
import {
    BillingAnalytics,
    BillingException,
    Category,
    DiscountCode,
    DiscountCodeType,
    Order,
    Product,
    Transformers,
} from '@definitions/admin';
import { createContext, createPaginatedHook } from '@/api';

export type OrderStatus = 'pending' | 'expired' | 'failed' | 'processed';

export interface ProductValues {
    categoryUuid: string;

    name: string;
    icon: string | undefined;
    price: number;
    description: string;

    limits: {
        cpu: number;
        memory: number;
        disk: number;
        backup: number;
        database: number;
        allocation: number;
    };
}

export interface CategoryValues {
    name: string;
    icon: string;
    description: string;
    visible: boolean;
    eggId: number;
}

export interface ProductFilters {
    id?: string;
    name?: string;
    price?: number;
}

export interface CategoryFilters {
    id?: number;
    name?: string;
}

export interface OrderFilters {
    id?: number;
    name?: string;
    description?: string;
    total?: number;
}

export interface BillingExceptionFilters {
    id?: number;
    title?: string;
}

export interface DiscountCodeFilters {
    id?: number;
    code?: string;
}

export interface DiscountCodeValues {
    code: string;
    description: string;
    type: DiscountCodeType;
    value: number;
    uses?: number | null;
    active: boolean;
    expires_at?: Date | undefined;
}

export const getBillingAnalytics = (): Promise<BillingAnalytics> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/analytics`)
            .then(({ data }) => resolve(data || []))
            .catch(reject);
    });
};

export const deleteStripeKeys = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/keys`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const updateSettings = (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.put(`/api/application/billing/settings`, { key, value })
            .then(() => resolve())
            .catch(reject);
    });
};

export const CategoryContext = createContext<CategoryFilters>();

export const useGetCategories = createPaginatedHook<Category, CategoryFilters>({
    url: '/api/application/billing/categories',
    swrKey: 'categories',
    context: CategoryContext,
    transformer: Transformers.toCategory,
});

export const getCategories = (): Promise<Category[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/categories`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toCategory)))
            .catch(reject);
    });
};

export const getCategory = async (id: number): Promise<Category> => {
    const { data } = await http.get(`/api/application/billing/categories/${id}`, {
        params: {
            include: 'products',
        },
    });

    return withRelationships(Transformers.toCategory(data), 'products');
};

export const createCategory = (values: CategoryValues): Promise<Category> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/categories`, values)
            .then(({ data }) => resolve(Transformers.toCategory(data)))
            .catch(reject);
    });
};

export const updateCategory = (id: number, values: CategoryValues): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/billing/categories/${id}`, values)
            .then(() => resolve())
            .catch(reject);
    });
};

export const deleteCategory = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/categories/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

/**
 * Returns an SWR instance by automatically loading in the category for the currently
 * loaded route match in the admin area.
 */
export const useCategoryFromRoute = (): SWRResponse<Category, AxiosError> => {
    const params = useParams<'id'>();

    return useSWR(`/api/application/billing/categories/${params.id}`, async () => getCategory(Number(params.id)));
};

export const ProductContext = createContext<ProductFilters>();

export const useGetProducts = (id: number) =>
    createPaginatedHook<Product, ProductFilters>({
        url: `/api/application/billing/categories/${id}/products`,
        swrKey: `category:${id}:products`,
        context: ProductContext,
        transformer: Transformers.toProduct,
    })();

export const getProducts = (id: number): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
        http.get(`/api/application/billing/categories/${id}/products`)
            .then(({ data }) => resolve((data.data || []).map(Transformers.toProduct)))
            .catch(reject);
    });
};

export const createProduct = (id: number, values: ProductValues): Promise<Product> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/categories/${id}/products`, values)
            .then(({ data }) => resolve(Transformers.toProduct(data)))
            .catch(reject);
    });
};

export const getProduct = async (id: number): Promise<Product> => {
    const { data } = await http.get(`/api/application/billing/products/${id}`);

    return Transformers.toProduct(data);
};

export const updateProduct = (id: number, productId: number, values: ProductValues): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/billing/categories/${id}/products/${productId}`, values)
            .then(() => resolve())
            .catch(reject);
    });
};

export const deleteProduct = (id: number, productId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/categories/${id}/products/${productId}`)
            .then(() => resolve())
            .catch(reject);
    });
};

/**
 * Returns an SWR instance by automatically loading in the product for the currently
 * loaded route match in the admin area.
 */
export const useProductFromRoute = (): SWRResponse<Product, AxiosError> => {
    const params = useParams<'id' | 'productId'>();

    return useSWR(`/api/application/billing/categories/${params.id}/products/${params.productId}`, async () =>
        getProduct(Number(params.productId)),
    );
};

export const OrderContext = createContext<OrderFilters>();

export const useGetOrders = createPaginatedHook<Order, OrderFilters>({
    url: '/api/application/billing/orders',
    swrKey: 'orders',
    context: OrderContext,
    transformer: Transformers.toOrder,
});

export const DiscountCodeContext = createContext<DiscountCodeFilters>();

export const useGetDiscountCodes = createPaginatedHook<DiscountCode, DiscountCodeFilters>({
    url: '/api/application/billing/discount-codes',
    swrKey: 'discount-codes',
    context: DiscountCodeContext,
    transformer: Transformers.toDiscountCode,
});

export const createDiscountCode = (values: DiscountCodeValues): Promise<DiscountCode> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/discount-codes`, values)
            .then(({ data }) => resolve(Transformers.toDiscountCode(data)))
            .catch(reject);
    });
};

export const updateDiscountCode = (id: number, values: DiscountCodeValues): Promise<DiscountCode> => {
    return new Promise((resolve, reject) => {
        http.patch(`/api/application/billing/discount-codes/${id}`, values)
            .then(({ data }) => resolve(Transformers.toDiscountCode(data)))
            .catch(reject);
    });
};

export const deleteDiscountCode = (id: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/discount-codes/${id}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const BillingExceptionContext = createContext<BillingExceptionFilters>();

export const useGetBillingExceptions = createPaginatedHook<BillingException, BillingExceptionFilters>({
    url: '/api/application/billing/exceptions',
    swrKey: 'exceptions',
    context: BillingExceptionContext,
    transformer: Transformers.toBillingException,
});

export const resolveBillingException = (uuid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/exceptions/${uuid}`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const resolveAllBillingExceptions = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.delete(`/api/application/billing/exceptions`)
            .then(() => resolve())
            .catch(reject);
    });
};

export const importBillingConfiguration = (
    uploadedJson: object,
    override: boolean,
    ignoreDuplicates: boolean,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/application/billing/config/import', {
            data: uploadedJson,
            override,
            ignore_duplicates: ignoreDuplicates,
        })
            .then(() => resolve())
            .catch(error => reject(error));
    });
};

export const exportBillingConfiguration = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/application/billing/config/export`, { responseType: 'blob' })
            .then(({ data }) => {
                const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                });

                const url = window.URL.createObjectURL(jsonBlob);

                const link = document.createElement('a');
                link.href = url;
                link.download = 'data.json';
                link.click();

                window.URL.revokeObjectURL(url);

                resolve();
            })
            .catch(reject);
    });
};
