import { useStoreState } from '@/state/hooks';
import { Route, Routes } from 'react-router-dom';
import AdminContentBlock from '@/elements/AdminContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { EyeIcon, ShieldExclamationIcon } from '@heroicons/react/outline';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import AlertSettings from './AlertSettings';
import AlertAppearance from './AlertAppearance';
import { NotFound } from '@/elements/ScreenBlock';

export default () => {
    const theme = useStoreState(state => state.theme.data!);

    return (
        <AdminContentBlock title={'Alerts'}>
            <FlashMessageRender byKey={'admin:alert'} className={'mb-4'} />
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Panel Alerts</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        Send warning and information alerts to your users.
                    </p>
                </div>
            </div>
            <SubNavigation theme={theme}>
                <SubNavigationLink to={'/admin/alerts'} name={'General'} base>
                    <ShieldExclamationIcon />
                </SubNavigationLink>
                <SubNavigationLink to={'/admin/alerts/view'} name={'Appearance'}>
                    <EyeIcon />
                </SubNavigationLink>
            </SubNavigation>
            <Routes>
                <Route path={'/'} element={<AlertSettings />} />
                <Route path={'/view'} element={<AlertAppearance />} />

                <Route path={'/*'} element={<NotFound />} />
            </Routes>
        </AdminContentBlock>
    );
};
