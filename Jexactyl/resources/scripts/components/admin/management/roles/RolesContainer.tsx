import { useContext, useEffect } from 'react';
import { getRoles, Context as RolesContext, Filters } from '@/api/routes/admin/roles';
import { AdminContext } from '@/state/admin';
import NewRoleButton from '@/components/admin/management/roles/NewRoleButton';
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
import CopyOnClick from '@/elements/CopyOnClick';
import { useStoreState } from '@/state/hooks';

const RolesContainer = () => {
    const { page, setPage, setFilters, sort, setSort, sortDirection } = useContext(RolesContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: roles, error, isValidating } = getRoles();

    const { colors } = useStoreState(state => state.theme.data!);

    useEffect(() => {
        if (!error) {
            clearFlashes('roles');
            return;
        }

        clearAndAddHttpError({ key: 'roles', error });
    }, [error]);

    const length = roles?.items?.length || 0;

    const setSelectedRoles = AdminContext.useStoreActions(actions => actions.roles.setSelectedRoles);

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

    useEffect(() => {
        setSelectedRoles([]);
    }, [page]);

    return (
        <AdminContentBlock title={'Roles'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Administrator Roles</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Roles are sets of permissions that you can assign to your panel administrators.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <NewRoleButton />
                </div>
            </div>

            <FlashMessageRender byKey={'roles'} css={tw`mb-4`} />

            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={roles} onPageSelect={setPage}>
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
                                    <TableHeader name={'Permission Count'} />
                                </TableHead>

                                <TableBody>
                                    {roles !== undefined &&
                                        !error &&
                                        !isValidating &&
                                        length > 0 &&
                                        roles.items.map(role => (
                                            <TableRow key={role.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <CopyOnClick text={role.id.toString()}>
                                                        <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                            {role.id}
                                                        </code>
                                                    </CopyOnClick>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <NavLink
                                                        to={`${window.location.pathname}/${role.id}`}
                                                        style={{ color: role.color ?? colors.primary }}
                                                        className={'hover:brightness-125 duration-300'}
                                                    >
                                                        {role.name}
                                                    </NavLink>
                                                </td>

                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {role.description}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {role.permissions.length}
                                                    </code>
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {roles === undefined || (error && isValidating) ? (
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
        <RolesContext.Provider value={hooks}>
            <RolesContainer />
        </RolesContext.Provider>
    );
};
