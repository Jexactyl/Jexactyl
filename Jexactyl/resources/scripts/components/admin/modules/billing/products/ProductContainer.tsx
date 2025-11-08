import Spinner from '@/elements/Spinner';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { useProductFromRoute } from '@/api/routes/admin/billing/products';
import ProductForm from '@admin/modules/billing/products/ProductForm';

export default () => {
    const { data: product } = useProductFromRoute();

    if (!product) return <Spinner centered />;

    return (
        <AdminContentBlock title={'View Product'}>
            <ProductForm product={product} />
        </AdminContentBlock>
    );
};
