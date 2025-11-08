import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    useTableHooks,
} from '@/elements/AdminTable';
import CopyOnClick from '@/elements/CopyOnClick';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { NavLink, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import { useStoreState } from '@/state/hooks';
import { useContext, useEffect } from 'react';
import useFlash from '@/plugins/useFlash';
import { ShoppingBagIcon } from '@heroicons/react/outline';
import { getProducts, Context as ProductContext } from '@/api/routes/admin/billing/products';
import { ProductFilters } from '@/api/routes/admin/billing/types';

function ProductTable() {
    const params = useParams<'id'>();
    const { data: products, error } = getProducts(Number(params.id));
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(ProductContext);

    useEffect(() => {
        if (!error) {
            clearFlashes('admin:billing:products');
            return;
        }

        clearAndAddHttpError({ key: 'admin:billing:products', error });
    }, [error]);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ name: query });
            }
            return resolve();
        });
    };

    return (
        <AdminTable className={'mb-12'}>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={products} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader />
                                <TableHeader
                                    name={'ID'}
                                    direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('id')}
                                />
                                <TableHeader
                                    name={'Name'}
                                    direction={sort === 'name' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('name')}
                                />
                                <TableHeader
                                    name={'Price'}
                                    direction={sort === 'price' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('price')}
                                />
                                <TableHeader name={'Description'} />
                                <TableHeader name={'Created At'} />
                            </TableHead>
                            <TableBody>
                                {products !== undefined &&
                                    products.items.length > 0 &&
                                    products.items.map(product => (
                                        <TableRow key={product.id}>
                                            <td css={tw`pl-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                {product.icon ? (
                                                    <img src={product.icon} className={'w-6 h-6 rounded-full'} />
                                                ) : (
                                                    <ShoppingBagIcon className={'w-6 h-6'} />
                                                )}
                                            </td>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={product.id}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {product.id}
                                                    </code>
                                                </CopyOnClick>
                                            </td>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <NavLink
                                                    to={`/admin/billing/categories/${Number(params.id)}/products/${
                                                        product.id
                                                    }`}
                                                    style={{ color: colors.primary }}
                                                    className={'hover:brightness-125 duration-300'}
                                                >
                                                    {product.name}
                                                </NavLink>
                                            </td>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                    ${product.price.toFixed(2)} / monthly
                                                </code>
                                            </td>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                {product.description}
                                            </td>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                {Math.abs(differenceInHours(product.createdAt, new Date())) > 48
                                                    ? format(product.createdAt, 'MMM do, yyyy h:mma')
                                                    : formatDistanceToNow(product.createdAt, { addSuffix: true })}
                                            </td>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </table>

                        {products === undefined ? <Loading /> : products.items.length < 1 ? <NoItems /> : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
}

export default () => {
    const hooks = useTableHooks<ProductFilters>();

    return (
        <ProductContext.Provider value={hooks}>
            <ProductTable />
        </ProductContext.Provider>
    );
};
