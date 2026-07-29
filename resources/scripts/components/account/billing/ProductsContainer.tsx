import classNames from 'classnames';
import Spinner from '@/elements/Spinner';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import ContentBox from '@/elements/ContentBox';
import { useEffect, useState } from 'react';
import PageContentBlock from '@/elements/PageContentBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArchive,
    faDatabase,
    faEthernet,
    faExclamationTriangle,
    faHdd,
    faMemory,
    faMicrochip,
    faShoppingBag,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Alert } from '@/elements/alert';
import { getProducts } from '@/api/routes/account/billing/products';
import { getCategories } from '@/api/routes/account/billing/categories';
import { Category, Product } from '@definitions/account/billing';
import LimitBox from '@/elements/billing/LimitBox';
import Money from '@/elements/billing/Money';
import { hexToRgba } from '@/lib/helpers';

export default () => {
    const [category, setCategory] = useState<number>();
    const [products, setProducts] = useState<Product[] | undefined>();
    const [categories, setCategories] = useState<Category[] | undefined>();

    const settings = useStoreState(s => s.everest.data!.billing);
    const { colors } = useStoreState(state => state.theme.data!);

    useEffect(() => {
        (async function () {
            await getCategories().then(data => {
                setCategories(data);
                setCategory(Number(data[0]!.id));
            });
        })();
    }, []);

    useEffect(() => {
        if (products || !category) return;

        getProducts(category).then(data => {
            setProducts(data);
        });
    }, [category]);

    if (!settings.keys.secret) {
        return (
            <Alert type={'danger'}>
                Due to a configuration error, the store is currently unavailable. Please try again later, or refresh the
                page.
            </Alert>
        );
    }

    return (
        <PageContentBlock title={'Available Products'}>
            <div className={'text-3xl lg:text-5xl font-bold mt-8 mb-12'}>
                Order a Product
                <p className={'text-gray-400 font-normal text-sm mt-1'}>
                    Choose and configure any of the products below to your liking.
                </p>
            </div>
            <div className={'grid lg:grid-cols-4 gap-4 lg:gap-12'}>
                <div>
                    <p className={'text-2xl text-gray-300 mb-6 mt-4 font-bold'}>Categories</p>
                    {(!categories || categories.length < 1) && (
                        <div className={'font-semibold my-4 text-gray-400'}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className={'w-5 h-5 mr-2 text-yellow-400'} />
                            No categories found.
                        </div>
                    )}
                    <div className={'flex flex-col gap-1'}>
                        {categories?.map(cat => {
                            const active = Number(cat.id) === category;

                            return (
                                <button
                                    className={classNames(
                                        'flex items-center font-semibold w-full text-left rounded-lg py-3 px-4 duration-200 cursor-pointer line-clamp-1 border-l-4',
                                        active
                                            ? 'text-neutral-100'
                                            : 'text-gray-400 hover:text-gray-200 border-transparent',
                                    )}
                                    style={
                                        active
                                            ? {
                                                  borderColor: colors.primary,
                                                  backgroundColor: hexToRgba(colors.primary, 0.08),
                                              }
                                            : undefined
                                    }
                                    disabled={active}
                                    onClick={() => {
                                        setCategory(Number(cat.id));
                                        setProducts(undefined);
                                    }}
                                    key={cat.id}
                                >
                                    {cat.icon && (
                                        <img src={cat.icon} className={'w-6 h-6 inline-flex rounded-full mr-3'} />
                                    )}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className={'lg:col-span-3'}>
                    {!products ? (
                        <Spinner centered />
                    ) : (
                        <>
                            {products?.length < 1 && (
                                <div className={'font-semibold my-4 text-gray-400'}>
                                    <FontAwesomeIcon
                                        icon={faExclamationTriangle}
                                        className={'w-5 h-5 mr-2 text-yellow-400'}
                                    />
                                    No products could be found in this category.
                                </div>
                            )}
                            <div className={'grid grid-cols-1 xl:grid-cols-3 gap-4'}>
                                {products?.map(product => (
                                    <ContentBox
                                        key={product.id}
                                        className={
                                            'transition duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col'
                                        }
                                    >
                                        <div className={'p-3 lg:p-6 flex flex-col flex-1'}>
                                            <div className={'flex justify-center'}>
                                                <div
                                                    className={
                                                        'w-16 h-16 rounded-full flex items-center justify-center'
                                                    }
                                                    style={{ backgroundColor: hexToRgba(colors.primary, 0.1) }}
                                                >
                                                    {product.icon ? (
                                                        <img src={product.icon} className={'w-9 h-9'} />
                                                    ) : (
                                                        <FontAwesomeIcon
                                                            icon={faShoppingBag}
                                                            className={'w-7 h-7'}
                                                            style={{ color: colors.primary }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <p className={'text-2xl font-bold text-center mt-4 font-header'}>
                                                {product.name}
                                            </p>
                                            <p className={'text-center mt-1 mb-6'}>
                                                <Money
                                                    value={product.price}
                                                    suffix={' / mo'}
                                                    accent
                                                    className={'text-2xl font-bold'}
                                                />
                                            </p>
                                            <div className={'grid grid-cols-2 gap-x-4 gap-y-1'}>
                                                <LimitBox icon={faMicrochip} limit={<>{product.limits.cpu}% CPU</>} />
                                                <LimitBox
                                                    icon={faMemory}
                                                    limit={<>{product.limits.memory / 1024} GiB RAM</>}
                                                />
                                                <LimitBox
                                                    icon={faHdd}
                                                    limit={<>{product.limits.disk / 1024} GiB Disk</>}
                                                />
                                                <LimitBox
                                                    icon={faEthernet}
                                                    limit={
                                                        <>
                                                            {product.limits.allocation} port
                                                            {product.limits.allocation > 1 && 's'}
                                                        </>
                                                    }
                                                />
                                                {!!product.limits.backup && (
                                                    <LimitBox
                                                        icon={faArchive}
                                                        limit={<>{product.limits.backup} backups</>}
                                                    />
                                                )}
                                                {!!product.limits.database && (
                                                    <LimitBox
                                                        icon={faDatabase}
                                                        limit={<>{product.limits.database} databases</>}
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    'text-center pt-4 mt-auto border-t border-dashed border-gray-700'
                                                }
                                            >
                                                <Link to={`/account/billing/order/${product.id}`}>
                                                    <Button size={Button.Sizes.Large} className={'w-full'}>
                                                        Configure
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </ContentBox>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageContentBlock>
    );
};
