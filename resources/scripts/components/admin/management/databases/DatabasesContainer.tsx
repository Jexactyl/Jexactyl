import { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import type { Filters } from '@/api/admin/databases/getDatabases';
import getDatabases, { Context as DatabasesContext } from '@/api/admin/databases/getDatabases';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import AdminContentBlock from '@elements/AdminContentBlock';
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
} from '@elements/AdminTable';
import { Button } from '@elements/button';
import { Size } from '@elements/button/types';
import CopyOnClick from '@elements/CopyOnClick';
import { useStoreState } from '@/state/hooks';

const DatabasesContainer = () => {
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(DatabasesContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: databases, error, isValidating } = getDatabases();

    useEffect(() => {
        if (!error) {
            clearFlashes('databases');
            return;
        }

        clearAndAddHttpError({ key: 'databases', error });
    }, [error]);

    const length = databases?.items?.length || 0;

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
        <AdminContentBlock title={'Databases'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Database Hosts</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Database hosts that servers can have databases created on.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <NavLink to="/admin/databases/new">
                        <Button type="button" size={Size.Large} css={tw`h-10 px-4 py-0 whitespace-nowrap`}>
                            New Database Host
                        </Button>
                    </NavLink>
                </div>
            </div>

            <FlashMessageRender byKey={'databases'} css={tw`mb-4`} />

            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={databases} onPageSelect={setPage}>
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
                                    <TableHeader name={'Address'} />
                                    <TableHeader name={'Username'} />
                                </TableHead>

                                <TableBody>
                                    {databases !== undefined &&
                                        !error &&
                                        !isValidating &&
                                        length > 0 &&
                                        databases.items.map(database => (
                                            <TableRow key={database.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={database.id.toString()}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {database.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`/admin/databases/${database.id}`}
                                                        style={{ color: colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {database.name}
                                                    </NavLink>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={database.getAddress()}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {database.getAddress()}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {database.username}
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {databases === undefined || (error && isValidating) ? (
                                <Loading />
                            ) : length < 1 ? (
                                <NoItems />
                            ) : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </AdminContentBlock>
    );
};

export default () => {
    const hooks = useTableHooks<Filters>();

    return (
        <DatabasesContext.Provider value={hooks}>
            <DatabasesContainer />
        </DatabasesContext.Provider>
    );
};
