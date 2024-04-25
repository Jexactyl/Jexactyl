import { NotFound } from '@elements/ScreenBlock';
import AdminContentBlock from '@elements/AdminContentBlock';
import { useProductFromRoute } from '@/api/admin/billing/products';
import ProductForm from '@admin/modules/billing/products/ProductForm';

export default () => {
    const { data: product } = useProductFromRoute();

    if (!product) return <NotFound />;

    return (
        <AdminContentBlock title={'View Product'}>
            <div className={'w-full flex flex-row items-center m-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>{product.name}</h2>
                    <p className={'text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'}>
                        {product.uuid}
                    </p>
                </div>
            </div>
            <ProductForm product={product} />
        </AdminContentBlock>
    );
};
