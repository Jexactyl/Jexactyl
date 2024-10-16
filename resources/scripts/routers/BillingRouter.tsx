import { Suspense } from 'react';
import Spinner from '@elements/Spinner';
import { useStoreState } from '@/state/hooks';
import { NotFound } from '@elements/ScreenBlock';
import CollapsedIcon from '@/assets/images/logo.png';
import { NavLink, Route, Routes } from 'react-router-dom';
import Cancel from '@/components/billing/order/summary/Cancel';
import Success from '@/components/billing/order/summary/Success';
import PlansContainer from '@/components/billing/plans/PlansContainer';
import ProductsContainer from '@/components/billing/ProductsContainer';
import OverviewContainer from '@/components/billing/OverviewContainer';
import OrderContainer from '@/components/billing/order/OrderContainer';
import Processing from '@/components/billing/order/summary/Processing';
import ViewPlanContainer from '@/components/billing/plans/ViewPlanContainer';
import Avatar from '@/components/Avatar';
import Sidebar from '@/components/elements/Sidebar';
import { usePersistedState } from '@/plugins/usePersistedState';
import {
    CogIcon,
    DesktopComputerIcon,
    OfficeBuildingIcon,
    ShoppingCartIcon,
    ViewListIcon,
} from '@heroicons/react/outline';

export default () => {
    const user = useStoreState(state => state.user.data!);
    const { data: theme } = useStoreState(state => state.theme);
    const name = useStoreState(state => state.settings.data!.name);
    const enabled = useStoreState(state => state.everest.data!.billing.enabled);
    const [collapsed, setCollapsed] = usePersistedState<boolean>(`sidebar_user_${user.uuid}`, false);

    if (!enabled) {
        return <NotFound />;
    }

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
                    <Sidebar.Section>Billing Module</Sidebar.Section>
                    <NavLink to={'/billing'} end>
                        <OfficeBuildingIcon />
                        <span>Overview</span>
                    </NavLink>
                    <NavLink to={'/billing/order'}>
                        <ShoppingCartIcon />
                        <span>Order</span>
                    </NavLink>
                    <NavLink to={'/billing/plans'}>
                        <ViewListIcon />
                        <span>Active Plans</span>
                    </NavLink>
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
                        <Route path={'/'} element={<OverviewContainer />} />
                        <Route path={'/order'} element={<ProductsContainer />} />
                        <Route path={'/order/:id'} element={<OrderContainer />} />
                        <Route path={'/plans'} element={<PlansContainer />} />
                        <Route path={'/plans/:id'} element={<ViewPlanContainer />} />

                        <Route path={'/process/:session_id'} element={<Processing />} />
                        <Route path={'/success'} element={<Success />} />
                        <Route path={'/cancel'} element={<Cancel />} />

                        <Route path={'*'} element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
};
