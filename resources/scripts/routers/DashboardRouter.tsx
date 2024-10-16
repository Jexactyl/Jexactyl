import { Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@elements/ScreenBlock';
import Spinner from '@elements/Spinner';
import routes from '@/routers/routes';
import { useStoreState } from '@/state/hooks';
import CollapsedIcon from '@/assets/images/logo.png';
import TicketContainer from '@/components/dashboard/tickets/TicketContainer';
import ViewTicketContainer from '@/components/dashboard/tickets/view/ViewTicketContainer';
import { usePersistedState } from '@/plugins/usePersistedState';
import Sidebar from '@/components/elements/Sidebar';
import {
    CodeIcon,
    CogIcon,
    DesktopComputerIcon,
    ShoppingCartIcon,
    TerminalIcon,
    TicketIcon,
} from '@heroicons/react/outline';
import Avatar from '@/components/Avatar';

function DashboardRouter() {
    const user = useStoreState(s => s.user.data!);
    const { name } = useStoreState(s => s.settings.data!);
    const theme = useStoreState(state => state.theme.data!);
    const { tickets, billing } = useStoreState(state => state.everest.data!);
    const [collapsed, setCollapsed] = usePersistedState<boolean>(`sidebar_user_${user.uuid}`, false);

    return (
        <div className={'h-screen flex'}>
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
                        <img src={CollapsedIcon} className={'mt-4 w-12'} alt={'Everest Icon'} />
                    )}
                </div>
                <Sidebar.Wrapper theme={theme}>
                    <NavLink to={'/'} end className={'mb-[18px]'}>
                        <DesktopComputerIcon />
                        <span>Dashboard</span>
                    </NavLink>
                    <Sidebar.Section>Account</Sidebar.Section>
                    <NavLink to={'/account'} end>
                        <Avatar.User />
                        <span>Account</span>
                    </NavLink>
                    <NavLink to={'/account/api'}>
                        <CodeIcon />
                        <span>API Keys</span>
                    </NavLink>
                    <NavLink to={'/account/ssh'}>
                        <TerminalIcon />
                        <span>SSH Keys</span>
                    </NavLink>
                    <Sidebar.Section>Modules</Sidebar.Section>
                    {tickets.enabled && (
                        <NavLink to={'/account/tickets'}>
                            <TicketIcon />
                            <span>Tickets</span>
                        </NavLink>
                    )}
                    {billing.enabled && (
                        <NavLink to={'/billing'}>
                            <ShoppingCartIcon />
                            <span>Billing</span>
                        </NavLink>
                    )}
                </Sidebar.Wrapper>
                <span className={'mt-auto mb-3 mr-auto'}>
                    {user.rootAdmin && (
                        <NavLink to={'/admin'}>
                            <CogIcon />
                            <span className={collapsed ? 'hidden' : ''}>Settings</span>
                        </NavLink>
                    )}
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
            <div className={'flex-1 overflow-x-hidden p-4 lg:p-8'}>
                <Suspense fallback={<Spinner centered />}>
                    <Routes>
                        <Route path="" element={<DashboardContainer />} />

                        {routes.account.map(({ route, component: Component }) => (
                            <Route key={route} path={`/account/${route}`.replace(/\/$/, '')} element={<Component />} />
                        ))}

                        {tickets.enabled && (
                            <>
                                <Route path={'/account/tickets'} element={<TicketContainer />} />
                                <Route path={'/account/tickets/:id'} element={<ViewTicketContainer />} />
                            </>
                        )}

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
}

export default DashboardRouter;
