import { useContext, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import tw from 'twin.macro';
import type { Filters } from '@/api/admin/nests/getEggs';
import getEggs, { Context as EggsContext } from '@/api/admin/nests/getEggs';
import AdminTable, {
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    Pagination,
    Loading,
    NoItems,
    ContentWrapper,
    useTableHooks,
} from '@elements/AdminTable';
import CopyOnClick from '@elements/CopyOnClick';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';

const EggsTable = () => {
    const params = useParams<'nestId' | 'id'>();

    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(EggsContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { colors } = useStoreState(state => state.theme.data!);
    const { data: eggs, error, isValidating } = getEggs(Number(params.nestId));

    useEffect(() => {
        if (!error) {
            clearFlashes('nests');
            return;
        }

        clearAndAddHttpError({ key: 'nests', error });
    }, [error]);

    const length = eggs?.items?.length || 0;

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
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={eggs} onPageSelect={setPage}>
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
                                <TableHeader name={'Description'} />
                            </TableHead>

                            <TableBody>
                                {eggs !== undefined &&
                                    !error &&
                                    !isValidating &&
                                    length > 0 &&
                                    eggs.items.map(egg => (
                                        <TableRow key={egg.id}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={egg.id.toString()}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {egg.id}
                                                    </code>
                                                </CopyOnClick>
                                            </td>

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <NavLink
                                                    to={`/admin/nests/${params.nestId}/eggs/${egg.id}`}
                                                    style={{ color: colors.primary }}
                                                    className={'hover:brightness-125 duration-300'}
                                                >
                                                    {egg.name}
                                                </NavLink>
                                            </td>

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                {egg.description}
                                            </td>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </table>

                        {eggs === undefined || (error && isValidating) ? <Loading /> : length < 1 ? <NoItems /> : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
};

export default () => {
    const hooks = useTableHooks<Filters>();

    return (
        <EggsContext.Provider value={hooks}>
            <EggsTable />
        </EggsContext.Provider>
    );
};
