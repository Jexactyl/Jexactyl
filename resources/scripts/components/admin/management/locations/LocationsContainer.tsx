import { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import tw from 'twin.macro';
import type { Filters } from '@/api/admin/locations/getLocations';
import getLocations, { Context as LocationsContext } from '@/api/admin/locations/getLocations';
import AdminContentBlock from '@elements/AdminContentBlock';
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
import NewLocationButton from '@admin/management/locations/NewLocationButton';
import CopyOnClick from '@elements/CopyOnClick';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';

function LocationsContainer() {
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, setFilters, sort, setSort, sortDirection } = useContext(LocationsContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: locations, error, isValidating } = getLocations();

    useEffect(() => {
        if (!error) {
            clearFlashes('locations');
            return;
        }

        clearAndAddHttpError({ key: 'locations', error });
    }, [error]);

    const length = locations?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setFilters({ short: query });
            }
            return resolve();
        });
    };
    return (
        <AdminContentBlock title={'Locations'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Locations</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        All locations that nodes can be assigned to for easier categorization.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <NewLocationButton />
                </div>
            </div>

            <FlashMessageRender byKey={'locations'} css={tw`mb-4`} />

            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={locations} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader
                                        name={'Short Name'}
                                        direction={sort === 'short' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('short')}
                                    />
                                    <TableHeader
                                        name={'Long Name'}
                                        direction={sort === 'long' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('long')}
                                    />
                                </TableHead>

                                <TableBody>
                                    {locations !== undefined &&
                                        !error &&
                                        !isValidating &&
                                        length > 0 &&
                                        locations.items.map(location => (
                                            <TableRow key={location.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={location.id.toString()}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {location.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`/admin/locations/${location.id}`}
                                                        style={{ color: colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {location.short}
                                                    </NavLink>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {location.long}
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {locations === undefined || (error && isValidating) ? (
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
}

export default () => {
    const hooks = useTableHooks<Filters>();

    return (
        <LocationsContext.Provider value={hooks}>
            <LocationsContainer />
        </LocationsContext.Provider>
    );
};
