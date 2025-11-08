import tw from 'twin.macro';
import AdminTable, {
    ContentWrapper,
    Pagination,
    TableHead,
    TableHeader,
    TableBody,
    TableRow,
    Loading,
    NoItems,
    useTableHooks,
} from '@/elements/AdminTable';
import { useContext } from 'react';
import CopyOnClick from '@/elements/CopyOnClick';
import { Link } from 'react-router-dom';
import { Button } from '@/elements/button';
import { useGetApiKeys, Context as ApiContext, ContextFilters } from '@/api/routes/admin/api/getApiKeys';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import DeleteApiKeyButton from './DeleteApiKeyButton';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { useStoreState } from '@/state/hooks';
import { PlusIcon } from '@heroicons/react/outline';

function ApiContainer() {
    const { data: apiKeys } = useGetApiKeys();
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(ApiContext);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ identifier: query });
            }
            return resolve();
        });
    };

    return (
        <>
            <div css={tw`flex ml-auto pl-4 mb-2`}>
                <Link to={'/admin/api/new'}>
                    <Button icon={PlusIcon}>New API Key</Button>
                </Link>
            </div>
            <FlashMessageRender byKey={'api'} className={'my-4'} />
            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={apiKeys} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader
                                        name={'Key Identifier'}
                                        direction={sort === 'identifier' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('identifier')}
                                    />
                                    <TableHeader
                                        name={'Last Used'}
                                        direction={sort === 'last_used_at' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('last_used_at')}
                                    />
                                    <TableHeader name={'Created At'} />
                                    <TableHeader />
                                </TableHead>
                                <TableBody>
                                    {apiKeys !== undefined &&
                                        apiKeys.items.length > 0 &&
                                        apiKeys.items.map(key => (
                                            <TableRow key={key.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={key.id}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {key.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <div
                                                        style={{ color: colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {key.identifier}
                                                    </div>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {key.last_used_at && new Date(key.last_used_at).getTime() > 0
                                                        ? format(key.last_used_at, 'MMM do, yyyy h:mma')
                                                        : 'Not Used'}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {Math.abs(differenceInHours(key.created_at!, new Date())) > 48
                                                        ? format(key.created_at!, 'MMM do, yyyy h:mma')
                                                        : formatDistanceToNow(key.created_at!, { addSuffix: true })}
                                                </td>
                                                <DeleteApiKeyButton id={key.id!} />
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {apiKeys === undefined ? <Loading /> : apiKeys.items.length < 1 ? <NoItems /> : null}
                        </div>
                    </Pagination>
                </ContentWrapper>
            </AdminTable>
        </>
    );
}

export default () => {
    const hooks = useTableHooks<ContextFilters>();

    return (
        <ApiContext.Provider value={hooks}>
            <ApiContainer />
        </ApiContext.Provider>
    );
};
