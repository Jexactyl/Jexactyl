import { Suspense, useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { NotFound } from '@/elements/ScreenBlock';
import Spinner from '@/elements/Spinner';
import routes from '@/routers/routes';
import { useStoreState } from '@/state/hooks';
import { usePersistedState } from '@/plugins/usePersistedState';
import Sidebar from '@/elements/Sidebar';
import { CogIcon, DesktopComputerIcon, ExternalLinkIcon, LogoutIcon, PuzzleIcon } from '@heroicons/react/outline';
import Avatar from '@/elements/Avatar';
import MobileSidebar from '@/elements/MobileSidebar';
import { CustomLink } from '@/api/routes/admin/links';
import { getLinks } from '@/api/getLinks';
import http from '@/api/http';
import NavigationBar from '@/elements/NavigationBar';
import DashboardContainer from '@account/DashboardContainer';

function DashboardRouter() {
    const user = useStoreState(s => s.user.data!);
    const { name, logo } = useStoreState(s => s.settings.data!);
    const theme = useStoreState(state => state.theme.data!);
    const [links, setLinks] = useState<CustomLink[] | null>();
    const flags = useStoreState(state => state.everest.data!);
    const [collapsed, setCollapsed] = usePersistedState<boolean>(`sidebar_user_${user.uuid}`, false);

    useEffect(() => {
        getLinks().then(setLinks).catch();
    }, []);

    const onTriggerLogout = () => {
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className={'h-screen flex'}>
            {' '}
            <MobileSidebar>
                <MobileSidebar.Home />
                {routes.account
                    .filter(route => route.name && (!route.condition || route.condition(flags)))
                    .map(route => (
                        <MobileSidebar.Link
                            key={route.route}
                            icon={route.icon ?? PuzzleIcon}
                            text={route.name}
                            linkTo={route.path !== '' ? `/account/${route.path}` : ''}
                            end={route.end}
                        />
                    ))}
                {(user.rootAdmin || user.admin_role_id) && (
                    <MobileSidebar.Link icon={CogIcon} text={'Admin'} linkTo={'/admin'} />
                )}
            </MobileSidebar>
            <Sidebar className={'flex-none'} $collapsed={collapsed} theme={theme}>
                <div
                    className={
                        'h-16 w-full flex flex-col items-center justify-center mt-1 mb-3 select-none cursor-pointer'
                    }
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {!collapsed ? (
                        <h1 className={'text-2xl text-neutral-50 whitespace-nowrap font-medium'}>{name}</h1>
                    ) : (
                        <img
                            src={logo?.toString() || 'https://avatars.githubusercontent.com/u/91636558'}
                            className={'mt-4 w-12'}
                            alt={'Logo'}
                        />
                    )}
                </div>
                <Sidebar.Wrapper theme={theme}>
                    <NavLink to={'/'} end className={'mb-[18px]'}>
                        <DesktopComputerIcon />
                        <span>Dashboard</span>
                    </NavLink>
                    {routes.account
                        .filter(route => route.name && (!route.condition || route.condition(flags)))
                        .map(route => (
                            <NavLink to={`/account/${route.path}`} key={route.path} end={route.end}>
                                <Sidebar.Icon icon={route.icon ?? PuzzleIcon} />
                                <span>{route.name}</span>
                            </NavLink>
                        ))}
                </Sidebar.Wrapper>
                <span className={'mt-auto mb-3 mr-auto'}>
                    {!collapsed && (
                        <>
                            {links?.map(link => (
                                <a key={link.id} href={link.url} target={'_blank'} rel={'noreferrer'}>
                                    <ExternalLinkIcon />
                                    <span>{link.name}</span>
                                </a>
                            ))}
                        </>
                    )}
                    {(user.rootAdmin || user.admin_role_id) && (
                        <NavLink to={'/admin'}>
                            <CogIcon />
                            <span className={collapsed ? 'hidden' : ''}>Settings</span>
                        </NavLink>
                    )}
                    <NavLink to={'/'} onClick={onTriggerLogout}>
                        <LogoutIcon />
                        <span className={collapsed ? 'hidden' : ''}>Logout</span>
                    </NavLink>
                </span>
                <Sidebar.User>
                    <span className="flex items-center">
                        <Avatar.User />
                    </span>
                    <div className={'flex flex-col ml-3'}>
                        <span
                            className={
                                'font-sans font-normal text-xs text-gray-300 whitespace-nowrap leading-tight select-none'
                            }
                        >
                            <div className={'text-gray-400 text-sm'}>Welcome back,</div>
                            {user.email}
                        </span>
                    </div>
                </Sidebar.User>
            </Sidebar>
            <div className={'flex-1 overflow-x-hidden'}>
                <NavigationBar />
                <Suspense fallback={<Spinner centered />}>
                    <Routes>
                        <Route path="" element={<DashboardContainer />} />
                        {routes.account
                            .filter(route => !route.condition || route.condition(flags))
                            .map(({ route, component: Component }) => (
                                <Route
                                    key={route}
                                    path={`/account/${route}`.replace(/\/$/, '')}
                                    element={<Component />}
                                />
                            ))}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
}

export default DashboardRouter;
