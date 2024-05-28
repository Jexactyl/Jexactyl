import { Suspense } from 'react';
import Spinner from '@elements/Spinner';
import { useStoreState } from '@/state/hooks';
import { NotFound } from '@elements/ScreenBlock';
import SubNavigation from '@elements/SubNavigation';
import NavigationBar from '@/components/NavigationBar';
import { NavLink, Route, Routes } from 'react-router-dom';
import Cancel from '@/components/billing/order/summary/Cancel';
import Success from '@/components/billing/order/summary/Success';
import PlansContainer from '@/components/billing/plans/PlansContainer';
import ProductsContainer from '@/components/billing/ProductsContainer';
import OverviewContainer from '@/components/billing/OverviewContainer';
import OrderContainer from '@/components/billing/order/OrderContainer';
import ViewPlanContainer from '@/components/billing/plans/ViewPlanContainer';
import Processing from '@/components/billing/order/summary/Processing';

export default () => {
    const { data: theme } = useStoreState(state => state.theme);

    return (
        <>
            <NavigationBar />
            <SubNavigation theme={theme}>
                <div>
                    <NavLink to={'/billing'} end>
                        Overview
                    </NavLink>
                    <NavLink to={'/billing/order'}>Order</NavLink>
                    <NavLink to={'/billing/plans'}>Active Plans</NavLink>
                </div>
            </SubNavigation>
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
        </>
    );
};
