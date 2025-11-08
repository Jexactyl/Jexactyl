import { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import type { Filters } from '@/api/routes/admin/servers/getServers';
import getServers, { Context as ServersContext } from '@/api/routes/admin/servers/getServers';
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
import CopyOnClick from '@/elements/CopyOnClick';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';

interface Props {
    filters?: Filters;
}

function ServersTable({ filters }: Props) {
    const { colors } = useStoreState(state => state.theme.data!);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(ServersContext);
    const { data: servers, error, isValidating } = getServers(['node', 'user']);

    const length = servers?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(filters || null);
            } else {
                setFilters({ ...filters, name: query });
            }
            return resolve();
        });
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('servers');
            return;
        }

        clearAndAddHttpError({ key: 'servers', error });
    }, [error]);

    return (
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={servers} onPageSelect={setPage}>
                    <div css={tw`overflow-x-auto`}>
                        <table css={tw`w-full table-auto`}>
                            <TableHead>
                                <TableHeader
                                    name={'Identifier'}
                                    direction={sort === 'uuidShort' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('uuidShort')}
                                />
                                <TableHeader
                                    name={'Name'}
                                    direction={sort === 'name' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('name')}
                                />
                                <TableHeader
                                    name={'Owner'}
                                    direction={sort === 'owner_id' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('owner_id')}
                                />
                                <TableHeader
                                    name={'Node'}
                                    direction={sort === 'node_id' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('node_id')}
                                />
                                <TableHeader
                                    name={'Status'}
                                    direction={sort === 'status' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('status')}
                                />
                            </TableHead>

                            <TableBody>
                                {servers !== undefined &&
                                    !error &&
                                    !isValidating &&
                                    length > 0 &&
                                    servers.items.map(server => (
                                        <tr key={server.id} css={tw`h-14 hover:bg-neutral-600`}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={server.identifier}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {server.identifier}
                                                    </code>
                                                </CopyOnClick>
                                            </td>

                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                <NavLink
                                                    to={`/admin/servers/${server.id}`}
                                                    style={{ color: colors.primary }}
                                                    className={'hover:brightness-125 duration-300'}
                                                >
                                                    {server.name}
                                                </NavLink>
                                            </td>

                                            {/* TODO: Have permission check for displaying user information. */}
                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                <NavLink
                                                    to={`/admin/users/${server.relations.user?.id}`}
                                                    css={tw`text-primary-400 hover:text-primary-300`}
                                                >
                                                    <div css={tw`text-sm text-neutral-200`}>
                                                        {server.relations.user?.email}
                                                    </div>

                                                    <div css={tw`text-sm text-neutral-400`}>
                                                        {server.relations.user?.uuid.split('-')[0]}
                                                    </div>
                                                </NavLink>
                                            </td>

                                            {/* TODO: Have permission check for displaying node information. */}
                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                <NavLink to={`/admin/nodes/${server.relations.node?.id}`}>
                                                    <div css={tw`text-sm text-neutral-200`}>
                                                        {server.relations.node?.name}
                                                    </div>

                                                    <div css={tw`text-sm text-neutral-400`}>
                                                        {server.relations.node?.fqdn}
                                                    </div>
                                                </NavLink>
                                            </td>

                                            <td css={tw`px-6 whitespace-nowrap`}>
                                                {server.status === 'installing' ? (
                                                    <span
                                                        css={tw`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-200 text-yellow-800`}
                                                    >
                                                        Installing
                                                    </span>
                                                ) : server.status === 'transferring' ? (
                                                    <span
                                                        css={tw`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-200 text-yellow-800`}
                                                    >
                                                        Transferring
                                                    </span>
                                                ) : server.status === 'suspended' ? (
                                                    <span
                                                        css={tw`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-red-200 text-red-800`}
                                                    >
                                                        Suspended
                                                    </span>
                                                ) : (
                                                    <span
                                                        css={tw`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800`}
                                                    >
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </TableBody>
                        </table>

                        {servers === undefined || (error && isValidating) ? (
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

export default ({ filters }: Props) => {
    const hooks = useTableHooks<Filters>(filters);

    return (
        <ServersContext.Provider value={hooks}>
            <ServersTable />
        </ServersContext.Provider>
    );
};
