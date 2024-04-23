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
} from '@elements/AdminTable';
import { useContext } from 'react';
import CopyOnClick from '@elements/CopyOnClick';
import { Link } from 'react-router-dom';
import AdminContentBlock from '@elements/AdminContentBlock';
import { Button } from '@elements/button';
import { useGetApiKeys, Context as ApiContext, ContextFilters } from '@/api/admin/api/getApiKeys';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import DeleteApiKeyButton from './DeleteApiKeyButton';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from '@/state/hooks';

function ApiContainer() {
    const { data: apiKeys } = useGetApiKeys();
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(ApiContext);

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                // setFilters({ identifier: query });
            }
            return resolve();
        });
    };

    return (
        <AdminContentBlock title={'API Keys'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Application API</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Create, update and delete administrative API keys for this Panel.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <Link to={'/admin/api/new'}>
                        <Button>New API Key</Button>
                    </Link>
                </div>
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
                                    <TableHeader name={'Last Used'} />
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
                                                    {key.lastUsedAt && new Date(key.lastUsedAt).getTime() > 0
                                                        ? format(key.lastUsedAt, 'MMM do, yyyy h:mma')
                                                        : 'Not Used'}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {Math.abs(differenceInHours(key.createdAt!, new Date())) > 48
                                                        ? format(key.createdAt!, 'MMM do, yyyy h:mma')
                                                        : formatDistanceToNow(key.createdAt!, { addSuffix: true })}
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
        </AdminContentBlock>
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
