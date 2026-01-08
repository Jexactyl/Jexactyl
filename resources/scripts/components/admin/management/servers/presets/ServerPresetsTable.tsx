import { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import { getServerPresets, Context as ServerPresetsContext } from '@/api/routes/admin/servers/presets';
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
import { ServerPresetFilters } from '@/api/routes/admin/servers/types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';

interface Props {
    filters?: ServerPresetFilters;
}

function ServerPresetsTable({ filters }: Props) {
    const { colors } = useStoreState(state => state.theme.data!);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(ServerPresetsContext);
    const { data: presets, error, isValidating } = getServerPresets();

    const length = presets?.items?.length || 0;

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
            clearFlashes('presets');
            return;
        }

        clearAndAddHttpError({ key: 'presets', error });
    }, [error]);

    return (
        <AdminTable>
            <ContentWrapper onSearch={onSearch}>
                <Pagination data={presets} onPageSelect={setPage}>
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
                                <TableHeader
                                    name={'CPU'}
                                    direction={sort === 'cpu' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('cpu')}
                                />
                                <TableHeader
                                    name={'Memory'}
                                    direction={sort === 'memory' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('memory')}
                                />
                                <TableHeader
                                    name={'Disk'}
                                    direction={sort === 'disk' ? (sortDirection ? 1 : 2) : null}
                                    onClick={() => setSort('disk')}
                                />
                                <TableHeader name={'Has Egg?'} />
                            </TableHead>

                            <TableBody>
                                {presets !== undefined &&
                                    !error &&
                                    !isValidating &&
                                    length > 0 &&
                                    presets.items.map(preset => (
                                        <tr key={preset.id} css={tw`h-14 hover:bg-neutral-600`}>
                                            <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                <CopyOnClick text={preset.id}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {preset.id}
                                                    </code>
                                                </CopyOnClick>
                                            </td>

                                            {<>{console.log(preset)}</>}

                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                <NavLink
                                                    to={`/admin/servers/presets/${preset.id}`}
                                                    style={{ color: colors.primary }}
                                                    className={'hover:brightness-125 duration-300'}
                                                >
                                                    {preset.name}
                                                </NavLink>
                                            </td>

                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                {preset.description}
                                            </td>

                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>{preset.cpu}%</td>
                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                {preset.memory} MiB
                                            </td>
                                            <td css={tw`px-6 text-sm text-left whitespace-nowrap`}>
                                                {preset.disk} MiB
                                            </td>
                                            <td css={tw`px-6 text-sm text-center whitespace-nowrap`}>
                                                {preset.egg_id ? (
                                                    <CheckCircleIcon className={'w-4 h-4 text-green-400'} />
                                                ) : (
                                                    <XCircleIcon className={'w-4 h-4 text-red-400'} />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </TableBody>
                        </table>

                        {presets === undefined || (error && isValidating) ? (
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
    const hooks = useTableHooks<ServerPresetFilters>(filters);

    return (
        <ServerPresetsContext.Provider value={hooks}>
            <ServerPresetsTable />
        </ServerPresetsContext.Provider>
    );
};
