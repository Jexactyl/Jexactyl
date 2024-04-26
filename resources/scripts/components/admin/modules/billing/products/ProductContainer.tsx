import AdminContentBlock from '@elements/AdminContentBlock';
import { useProductFromRoute } from '@/api/admin/billing/products';
import ProductForm from '@admin/modules/billing/products/ProductForm';
import { Button } from '@elements/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link, useParams } from 'react-router-dom';
import Spinner from '@elements/Spinner';
import { ShoppingBagIcon } from '@heroicons/react/outline';

export default () => {
    const params = useParams<'id'>();
    const { data: product } = useProductFromRoute();

    if (!product) return <Spinner centered />;

    return (
        <AdminContentBlock title={'View Product'}>
            <div className={'w-full flex flex-row items-center p-8'}>
                {product.icon ? (
                    <img src={product.icon} className={'ww-8 h-8 mr-4'} />
                ) : (
                    <ShoppingBagIcon className={'w-8 h-8 mr-4'} />
                )}
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>{product.name}</h2>
                    <p className={'text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'}>
                        {product.uuid}
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Link to={`/admin/billing/categories/${params.id}`}>
                        <Button>
                            <FontAwesomeIcon icon={faArrowLeft} className={'mr-2'} />
                            Return to Category
                        </Button>
                    </Link>
                </div>
            </div>
            <ProductForm product={product} />
        </AdminContentBlock>
    );
};
