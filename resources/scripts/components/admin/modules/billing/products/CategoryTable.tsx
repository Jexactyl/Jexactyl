import { useGetCategories, Context as CategoryContext } from '@/api/admin/billing/categories';
import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/elements/AdminTable';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { Link, NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import { useStoreState } from '@/state/hooks';
import { useContext } from 'react';
import { Button } from '@/components/elements/button';
import classNames from 'classnames';

export default () => {
    const { data: categories } = useGetCategories();
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(CategoryContext);

    if (!categories) return null;

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
        <>
            <div className={'w-full flex flex-row items-center my-8 px-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Product Categories</h2>
                    <p className={'text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'}>
                        These categories are used to contain your products.
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Link to={'/admin/billing/categories/new'}>
                        <Button>Add Category</Button>
                    </Link>
                </div>
            </div>
            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={categories} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
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
                                        name={'Description'}
                                        direction={sort === 'description' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('description')}
                                    />
                                    <TableHeader
                                        name={'Created At'}
                                        direction={sort === 'created_at' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('created_at')}
                                    />
                                    <TableHeader />
                                </TableHead>
                                <TableBody>
                                    {categories !== undefined &&
                                        categories.items.length > 0 &&
                                        categories.items.map(category => (
                                            <TableRow key={category.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={category.id}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {category.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`/admin/billing/categories/${category.id}`}
                                                        style={{ color: colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {category.name}
                                                    </NavLink>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {category.description}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {Math.abs(differenceInHours(category.createdAt, new Date())) > 48
                                                        ? format(category.createdAt, 'MMM do, yyyy h:mma')
                                                        : formatDistanceToNow(category.createdAt, { addSuffix: true })}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <span
                                                        className={classNames(
                                                            'px-2 rounded-full inline-flex text-xs leading-5 font-medium',
                                                            category.visible
                                                                ? 'bg-green-200 text-green-800'
                                                                : 'bg-red-200 text-red-800',
                                                        )}
                                                    >
                                                        {category.visible ? 'Visible' : 'Hidden'}
                                                    </span>
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {categories === undefined ? <Loading /> : categories.items.length < 1 ? <NoItems /> : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </>
    );
};
