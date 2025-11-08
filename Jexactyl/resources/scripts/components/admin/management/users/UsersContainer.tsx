import tw from 'twin.macro';
import { Link, NavLink } from 'react-router-dom';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { Button } from '@/elements/button';
import { RealFilters, useGetUsers, Context as UsersContext } from '@/api/routes/admin/users';
import {
    faIdBadge,
    faLock,
    faLockOpen,
    faPlus,
    faUser,
    faUserCheck,
    faUserGear,
    faUserSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';
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
} from '@/elements/AdminTable';
import { useStoreState } from '@/state/hooks';
import Pill from '@/elements/Pill';

function UsersContainer() {
    const { data: users, error, isValidating } = useGetUsers();
    const { colors } = useStoreState(state => state.theme.data!);
    const { setPage, sort, sortDirection, setSort, setFilters } = useContext(UsersContext);

    const length = users?.items?.length || 0;

    const onSearch = (query: string): Promise<void> => {
        return new Promise(resolve => {
            if (query.length < 2) {
                setFilters(null);
            } else {
                setPage(1);
                setFilters({
                    username: query,
                });
            }
            return resolve();
        });
    };

    return (
        <AdminContentBlock title={'User Accounts'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>User Accounts</h2>
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        All users that have access to the system.
                    </p>
                </div>

                <div css={tw`flex ml-auto pl-4`}>
                    <Link to={'/admin/users/new'}>
                        <Button>
                            <FontAwesomeIcon icon={faPlus} className={'mr-2 my-auto'} /> New User
                        </Button>
                    </Link>
                </div>
            </div>
            <AdminTable>
                <ContentWrapper onSearch={onSearch}>
                    <Pagination data={users} onPageSelect={setPage}>
                        <div css={tw`overflow-x-auto`}>
                            <table css={tw`w-full table-auto`}>
                                <TableHead>
                                    <TableHeader
                                        name={'ID'}
                                        direction={sort === 'id' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('id')}
                                    />
                                    <TableHeader
                                        name={'Username'}
                                        direction={sort === 'username' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('username')}
                                    />
                                    <TableHeader
                                        name={'Email Address'}
                                        direction={sort === 'email' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('email')}
                                    />
                                    <TableHeader
                                        name={'2FA Enabled'}
                                        direction={sort === 'use_totp' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('use_totp')}
                                    />
                                    <TableHeader
                                        name={'State'}
                                        direction={sort === 'state' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('state')}
                                    />
                                    <TableHeader
                                        name={'permissions'}
                                        direction={sort === 'root_admin' ? (sortDirection ? 1 : 2) : null}
                                        onClick={() => setSort('root_admin')}
                                    />
                                </TableHead>

                                <TableBody>
                                    {users !== undefined &&
                                        !error &&
                                        !isValidating &&
                                        length > 0 &&
                                        users.items.map(user => (
                                            <TableRow key={user.id}>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    <code css={tw`font-mono bg-neutral-900 rounded py-1 px-2`}>
                                                        {user.id}
                                                    </code>
                                                </td>
                                                <td
                                                    css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap hover:brightness-125`}
                                                    style={{ color: colors.primary }}
                                                >
                                                    <NavLink to={`/admin/users/${user.id}`}>{user.username}</NavLink>
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {user.email}
                                                </td>
                                                <td css={tw`px-6 text-sm text-neutral-200 text-left whitespace-nowrap`}>
                                                    {user.isUsingTwoFactor ? (
                                                        <Pill type={'success'}>
                                                            <FontAwesomeIcon
                                                                icon={faLock}
                                                                className={'my-auto mr-1'}
                                                                size={'sm'}
                                                            />{' '}
                                                            Enabled
                                                        </Pill>
                                                    ) : (
                                                        <Pill type={'danger'}>
                                                            <FontAwesomeIcon
                                                                icon={faLockOpen}
                                                                className={'my-auto mr-1'}
                                                                size={'sm'}
                                                            />{' '}
                                                            Disabled
                                                        </Pill>
                                                    )}
                                                </td>
                                                <td className={'px-6 py-4 whitespace-nowrap text-sm text-neutral-50'}>
                                                    {user.state === 'suspended' ? (
                                                        <Pill type={'warn'}>
                                                            <FontAwesomeIcon
                                                                icon={faUserSlash}
                                                                className={'my-auto mr-1'}
                                                                size={'sm'}
                                                            />{' '}
                                                            Suspended
                                                        </Pill>
                                                    ) : (
                                                        <Pill type={'success'}>
                                                            <FontAwesomeIcon
                                                                icon={faUserCheck}
                                                                className={'my-auto mr-1'}
                                                                size={'sm'}
                                                            />{' '}
                                                            Active
                                                        </Pill>
                                                    )}
                                                </td>
                                                <td className={'px-6 py-4 whitespace-nowrap text-sm text-neutral-50'}>
                                                    {user.isRootAdmin || user.admin_role_id ? (
                                                        <>
                                                            <Pill type={'success'}>
                                                                <FontAwesomeIcon
                                                                    icon={faUserGear}
                                                                    className={'my-auto mr-1'}
                                                                    size={'sm'}
                                                                />{' '}
                                                                Admin
                                                            </Pill>
                                                            {user.admin_role_id ? (
                                                                <Pill type={'info'}>
                                                                    <FontAwesomeIcon
                                                                        icon={faIdBadge}
                                                                        className={'my-auto mr-1'}
                                                                        size={'sm'}
                                                                    />{' '}
                                                                    {user.roleName}
                                                                </Pill>
                                                            ) : (
                                                                <Pill type={'warn'}>
                                                                    <FontAwesomeIcon
                                                                        icon={faIdBadge}
                                                                        className={'my-auto mr-1'}
                                                                        size={'sm'}
                                                                    />{' '}
                                                                    Full Access
                                                                </Pill>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Pill type={'unknown'}>
                                                            <FontAwesomeIcon
                                                                icon={faUser}
                                                                className={'my-auto mr-1'}
                                                                size={'sm'}
                                                            />{' '}
                                                            Standard
                                                        </Pill>
                                                    )}
                                                </td>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </table>

                            {users === undefined || (error && isValidating) ? (
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
    const hooks = useTableHooks<RealFilters>();

    return (
        <UsersContext.Provider value={hooks}>
            <UsersContainer />
        </UsersContext.Provider>
    );
};
