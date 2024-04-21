import Spinner from '@elements/Spinner';
import { useEffect, useState } from 'react';
import { useStoreState } from '@/state/hooks';
import { Route, Routes } from 'react-router-dom';
import { NotFound } from '@elements/ScreenBlock';
import { getSettings } from '@/api/admin/billing/settings';
import AdminContentBlock from '@elements/AdminContentBlock';
import EnableBilling from '@admin/modules/billing/EnableBilling';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ShoppingBagIcon, UsersIcon } from '@heroicons/react/outline';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import ToggleFeatureButton from '@admin/modules/billing/ToggleFeatureButton';

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
        <AdminContentBlock title={'Settings'}>
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

            <FlashMessageRender byKey={'admin:settings'} className={'mb-4'} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to={'/admin/billing/products'} name={'Products'}>
                    <ShoppingBagIcon />
                </SubNavigationLink>
                <SubNavigationLink to={'/admin/billing/accounts'} name={'Accounts'}>
                    <UsersIcon />
                </SubNavigationLink>
            </SubNavigation>
            <Routes>
                <Route path={'/products'} element={<>products</>} />
                <Route path={'/accounts'} element={<>accounts</>} />
                <Route path={'/*'} element={<NotFound />} />
            </Routes>
        </AdminContentBlock>
    );
};
