import { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';

import type { Filters } from '@/api/routes/admin/nodes/allocations/getAllocations';
import getAllocations, { Context as AllocationsContext } from '@/api/routes/admin/nodes/allocations/getAllocations';
import AdminTable, {
    ContentWrapper,
    Loading,
    NoItems,
    Pagination,
    TableBody,
    TableHead,
    TableHeader,
    useTableHooks,
} from '@/elements/AdminTable';
import DeleteAllocationButton from '@admin/management/nodes/allocations/DeleteAllocationButton';
import CopyOnClick from '@/elements/CopyOnClick';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';

interface Props {
    nodeId: number;
    filters?: Filters;
}

function AllocationsTable({ nodeId, filters }: Props) {
    const { colors } = useStoreState(state => state.theme.data!);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(AllocationsContext);
    const { data: allocations, error, isValidating, mutate } = getAllocations(nodeId, ['server']);

    const length = allocations?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(filters || null);
            } else {
                setFilters({ ...filters, ip: query });
            }
            return resolve();
        });
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('allocations');
            return;
        }

        clearAndAddHttpError({ key: 'allocations', error });
    }, [error]);

    return (
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={allocations} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader
                                    name={'IP Address'}
                                    direction={sort === 'ip' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('ip')}
                                />
                                <TableHeader name={'Alias'} />
                                <TableHeader
                                    name={'Port'}
                                    direction={sort === 'port' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('port')}
                                />
                                <TableHeader name={'Assigned To'} />
                                <TableHeader />
                            </TableHead>

                            <TableBody>
                                {allocations !== undefined &&
                                    !error &&
                                    !isValidating &&
                                    length > 0 &&
                                    allocations.items.map(allocation => (
                                        <tr key={allocation.id} css={tw`h-10 hover:bg-neutral-600`}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={allocation.ip}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {allocation.ip}
                                                    </code>
                                                </CopyOnClick>
                                            </td>

                                            {allocation.alias !== null ? (
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={allocation.alias}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {allocation.alias}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>
                                            ) : (
                                                <td />
                                            )}

                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={allocation.port}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {allocation.port}
                                                    </code>
                                                </CopyOnClick>
                                            </td>

                                            {allocation.relations.server !== undefined ? (
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`/admin/servers/${allocation.serverId}`}
                                                        style={{ color: colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {allocation.relations.server.name}
                                                    </NavLink>
                                                </td>
                                            ) : (
                                                <td />
                                            )}

                                            <td>
                                                {!allocation.relations.server && (
                                                    <DeleteAllocationButton
                                                        nodeId={nodeId}
                                                        allocationId={allocation.id}
                                                        onDeleted={async () => {
                                                            await mutate(allocations => ({
                                                                pagination: allocations!.pagination,
                                                                items: allocations!.items.filter(
                                                                    a => a.id === allocation.id,
                                                                ),
                                                            }));

                                                            // Go back a page if no more items will exist on the current page.
                                                            if (allocations?.items.length - (1 % 10) === 0) {
                                                                setPage(p => p - 1);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </TableBody>
                        </table>

                        {allocations === undefined || (error && isValidating) ? (
                            <Loading />
                        ) : length < 1 ? (
                            <NoItems />
                        ) : null}
                    </div>
                </Pagination>
            </ContentWrapper>
        </AdminTable>
    );
}

export default (props: Props) => {
    const hooks = useTableHooks<Filters>(props.filters);

    return (
        <AllocationsContext.Provider value={hooks}>
            <AllocationsTable {...props} />
        </AllocationsContext.Provider>
    );
};
