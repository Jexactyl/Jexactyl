import { Suspense } from 'react';
import Spinner from '@elements/Spinner';
import { useStoreState } from '@/state/hooks';
import { NotFound } from '@elements/ScreenBlock';
import SubNavigation from '@elements/SubNavigation';
import NavigationBar from '@/components/NavigationBar';
import { NavLink, Route, Routes } from 'react-router-dom';
import getBillingPortal from '@/api/billing/getBillingPortal';
import Cancel from '@/components/billing/order/summary/Cancel';
import Success from '@/components/billing/order/summary/Success';
import PlansContainer from '@/components/billing/PlansContainer';
import ProductsContainer from '@/components/billing/ProductsContainer';
import OverviewContainer from '@/components/billing/OverviewContainer';
import OrderContainer from '@/components/billing/order/OrderContainer';

export default () => {
    const { data: theme } = useStoreState(state => state.theme);

    const redirect = () => {
        getBillingPortal()
            .then(url => {
                // @ts-expect-error this is fine
                window.location = url;
            })
            .catch(error => console.log(error));
    };

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
                    <p className={'mx-4 text-gray-400 text-lg'}>&bull;</p>
                    <NavLink to={'/billing/portal'} onClick={redirect}>
                        Billing Portal
                    </NavLink>
                </div>
            </SubNavigation>
            <Suspense fallback={<Spinner centered />}>
                <Routes>
                    <Route path={'/'} element={<OverviewContainer />} />
                    <Route path={'/order'} element={<ProductsContainer />} />
                    <Route path={'/order/:id'} element={<OrderContainer />} />
                    <Route path={'/plans'} element={<PlansContainer />} />

                    <Route
                        path={'/portal'}
                        element={
                            <p className={'text-center text-lg text-gray-400 mt-10'}>
                                <Spinner className={'inline-flex mr-2'} size={'small'} />
                                You are being redirected...
                            </p>
                        }
                    />

                    <Route path={'/success'} element={<Success />} />
                    <Route path={'/cancel'} element={<Cancel />} />

                    <Route path={'*'} element={<NotFound />} />
                </Routes>
            </Suspense>
        </>
    );
};
