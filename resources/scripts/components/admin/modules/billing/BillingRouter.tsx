import Spinner from '@elements/Spinner';
import { useEffect, useState } from 'react';
import { useStoreState } from '@/state/hooks';
import { Route, Routes } from 'react-router-dom';
import { NotFound } from '@elements/ScreenBlock';
import { getSettings } from '@/api/admin/billing/settings';
import AdminContentBlock from '@elements/AdminContentBlock';
import EnableBilling from '@admin/modules/billing/EnableBilling';
import FlashMessageRender from '@/components/FlashMessageRender';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import CategoryTable from '@admin/modules/billing/products/CategoryTable';
import BillingAccountsContainer from './accounts/BillingAccountsContainer';
import ToggleFeatureButton from '@admin/modules/billing/ToggleFeatureButton';
import { DesktopComputerIcon, ShoppingBagIcon, UsersIcon } from '@heroicons/react/outline';

export default () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [enabled, setEnabled] = useState<boolean>(false);
    const theme = useStoreState(state => state.theme.data!);

    useEffect(() => {
        getSettings()
            .then(data => setEnabled(data.enabled))
            .then(() => setLoading(false));
    });

    if (loading) return <Spinner size={'large'} centered />;
    if (!enabled) return <EnableBilling />;

    return (
        <AdminContentBlock title={'Billing'}>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Billing</h2>
                    <p className={'text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'}>
                        Configure the billing settings for this panel.
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <ToggleFeatureButton />
                </div>
            </div>

            <FlashMessageRender byKey={'admin:billing'} className={'mb-4'} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to={'/admin/billing'} name={'Overview'}>
                    <DesktopComputerIcon />
                </SubNavigationLink>
                <SubNavigationLink to={'/admin/billing/categories'} name={'Products'}>
                    <ShoppingBagIcon />
                </SubNavigationLink>
                <SubNavigationLink to={'/admin/billing/accounts'} name={'Accounts'}>
                    <UsersIcon />
                </SubNavigationLink>
            </SubNavigation>
            <Routes>
                <Route path={'/'} element={<>Welcome to the Billing Overview.</>} />
                <Route path={'/categories'} element={<CategoryTable />} />
                <Route path={'/accounts'} element={<BillingAccountsContainer />} />
                <Route path={'/*'} element={<NotFound />} />
            </Routes>
        </AdminContentBlock>
    );
};
