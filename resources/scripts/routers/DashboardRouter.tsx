import { Suspense } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@elements/ScreenBlock';
import Spinner from '@elements/Spinner';
import SubNavigation from '@elements/SubNavigation';
import routes from '@/routers/routes';
import { useStoreState } from '@/state/hooks';

import TicketContainer from '@/components/dashboard/tickets/TicketContainer';
import ViewTicketContainer from '@/components/dashboard/tickets/view/ViewTicketContainer';

function DashboardRouter() {
    const location = useLocation();
    const theme = useStoreState(state => state.theme.data!);
    const { mode } = useStoreState(state => state.settings.data!);
    const ticketsEnabled = useStoreState(state => state.everest.data!.tickets.enabled);

    return (
        <>
            <NavigationBar />

            {location.pathname.startsWith('/account') && (
                <SubNavigation theme={theme}>
                    <div>
                        {routes.account
                            .filter(route => route.path !== undefined)
                            .filter(route => route.mode === mode)
                            .map(({ path, name, end = false }) => (
                                <NavLink key={path} to={`/account/${path ?? ''}`.replace(/\/$/, '')} end={end}>
                                    {name}
                                </NavLink>
                            ))}
                        {ticketsEnabled && mode === 'standard' && <NavLink to={'/account/tickets'}>Tickets</NavLink>}
                    </div>
                </SubNavigation>
            )}

            <Suspense fallback={<Spinner centered />}>
                <Routes>
                    <Route path="" element={<DashboardContainer />} />

                    {routes.account
                        .filter(route => route.mode === mode)
                        .map(({ route, component: Component }) => (
                            <Route key={route} path={`/account/${route}`.replace(/\/$/, '')} element={<Component />} />
                        ))}

                    {ticketsEnabled && mode === 'standard' && (
                        <>
                            <Route path={'/account/tickets'} element={<TicketContainer />} />
                            <Route path={'/account/tickets/:id'} element={<ViewTicketContainer />} />
                        </>
                    )}

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </>
    );
}

export default DashboardRouter;
