import { Suspense } from 'react';
import Spinner from '@elements/Spinner';
import { NotFound } from '@elements/ScreenBlock';
import SubNavigation from '@elements/SubNavigation';
import NavigationBar from '@/components/NavigationBar';
import { NavLink, Route, Routes } from 'react-router-dom';
import ProductsContainer from '@/components/billing/ProductsContainer';
import { useStoreState } from '@/state/hooks';
import OverviewContainer from '@/components/billing/OverviewContainer';

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
                    <NavLink to={'/billing/payments'}>Payments</NavLink>
                    <NavLink to={'/billing/support'}>Support</NavLink>
                </div>
            </SubNavigation>
            <Suspense fallback={<Spinner centered />}>
                <Routes>
                    <Route path={'/'} element={<OverviewContainer />} />
                    <Route path={'/order'} element={<ProductsContainer />} />
                    <Route path={'*'} element={<NotFound />} />
                </Routes>
            </Suspense>
        </>
    );
};
