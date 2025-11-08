import Spinner from '@/elements/Spinner';
import { Link } from 'react-router-dom';
import { Button } from '@/elements/button';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { useCategoryFromRoute } from '@/api/routes/admin/billing/categories';
import CategoryForm from '@admin/modules/billing/products/CategoryForm';
import ProductTable from '@admin/modules/billing/products/ProductTable';

export default () => {
    const { data } = useCategoryFromRoute();

    if (!data) return <Spinner size={'large'} centered />;

    return (
        <AdminContentBlock title={data.name || 'View Category'}>
            <CategoryForm category={data} />
            <div className={'h-px border-2 border-gray-700 rounded-full w-full mt-12 mb-4'} />
            <div className={'w-full flex flex-row items-center p-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Products</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        A list of the available products in the {data.name} category.
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Link to={`/admin/billing/categories/${data.id}/products/new`}>
                        <Button>Create Product</Button>
                    </Link>
                </div>
            </div>
            <ProductTable />
        </AdminContentBlock>
    );
};
