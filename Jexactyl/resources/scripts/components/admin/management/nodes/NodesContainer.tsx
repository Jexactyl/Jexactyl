import { useContext, useEffect, useState } from 'react';
import type { Filters } from '@/api/routes/admin/servers/getServers';
import getNodes, { Context as NodesContext } from '@/api/routes/admin/nodes/getNodes';
import FlashMessageRender from '@/elements/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import AdminContentBlock from '@/elements/AdminContentBlock';
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
} from '@/elements/AdminTable';
import { Button } from '@/elements/button';
import CopyOnClick from '@/elements/CopyOnClick';
import { bytesToString, mbToBytes } from '@/lib/formatters';
import { useStoreState } from '@/state/hooks';
import { Dialog } from '@/elements/dialog';
import NewNodeContainer from './NewNodeContainer';

const NodesContainer = () => {
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(NodesContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: nodes, error, isValidating } = getNodes();
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!error) {
            clearFlashes('nodes');
            return;
        }

        clearAndAddHttpError({ key: 'nodes', error });
    }, [error]);

    const length = nodes?.items?.length || 0;

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
        <AdminContentBlock title={'Nodes'}>
            <Dialog title={'Create a New Node'} open={open} onClose={() => setOpen(false)} size={'xl'}>
                <NewNodeContainer />
            </Dialog>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Nodes</h2>
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        All nodes available on the system.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <Button type={'button'} css={tw`h-10 px-4 py-0 whitespace-nowrap`} onClick={() => setOpen(true)}>
                        New Node
                    </Button>
                </div>
            </div>

            <FlashMessageRender byKey={'nodes'} css={tw`mb-4`} />

            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={nodes} onPageSelect={setPage}>
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
                                        name={'FQDN'}
                                        direction={sort === 'fqdn' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('fqdn')}
                                    />
                                    <TableHeader
                                        name={'Total Memory'}
                                        direction={sort === 'memory' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('memory')}
                                    />
                                    <TableHeader
                                        name={'Total Disk'}
                                        direction={sort === 'disk' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('disk')}
                                    />
                                    <TableHeader />
                                </TableHead>

                                <TableBody>
                                    {nodes !== undefined &&
                                        !error &&
                                        !isValidating &&
                                        length > 0 &&
                                        nodes.items.map(node => (
                                            <TableRow key={node.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={node.id.toString()}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {node.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`/admin/nodes/${node.id}`}
                                                        style={{ color: colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {node.name}
                                                    </NavLink>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={node.fqdn}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {node.fqdn}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {bytesToString(mbToBytes(node.memory))}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {bytesToString(mbToBytes(node.disk))}
                                                </td>

                                                <td css={tw`px-6 whitespace-nowrap`}>
                                                    {node.scheme === 'https' ? (
                                                        <span
                                                            css={tw`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800`}
                                                        >
                                                            Secure
                                                        </span>
                                                    ) : (
                                                        <span
                                                            css={tw`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-red-200 text-red-800`}
                                                        >
                                                            Non-Secure
                                                        </span>
                                                    )}
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {nodes === undefined || (error && isValidating) ? (
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
        <NodesContext.Provider value={hooks}>
            <NodesContainer />
        </NodesContext.Provider>
    );
};
