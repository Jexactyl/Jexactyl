import { useStoreState } from '@/state/hooks';
import { Route, Routes } from 'react-router-dom';
import { CogIcon, SparklesIcon } from '@heroicons/react/outline';
import AdminContentBlock from '@/elements/AdminContentBlock';
import { NotFound } from '@/elements/ScreenBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import EnableAI from '@admin/modules/ai/EnableAI';
import OverviewContainer from '@admin/modules/ai/OverviewContainer';
import ConfigureAI from '@admin/modules/ai/ConfigureAI';
import SettingsContainer from './SettingsContainer';

export default () => {
    const theme = useStoreState(state => state.theme.data!);
    const settings = useStoreState(state => state.everest.data!.ai);

    if (!settings.enabled) return <EnableAI />;
    if (settings.enabled && !settings.key) return <ConfigureAI />;

    return (
        <AdminContentBlock title={'Jexactyl AI'}>
            <FlashMessageRender byKey={'admin:ai'} className={'mb-4'} />
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Jexactyl AI</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        Use Artificial Intelligence to add more power to Jexactyl.
                    </p>
                </div>
            </div>
            <SubNavigation theme={theme}>
                <SubNavigationLink to={'/admin/ai'} name={'General'} base>
                    <SparklesIcon />
                </SubNavigationLink>
                <SubNavigationLink to={'/admin/ai/settings'} name={'Options'}>
                    <CogIcon />
                </SubNavigationLink>
            </SubNavigation>
            <Routes>
                <Route path={'/'} element={<OverviewContainer />} />
                <Route path={'/settings'} element={<SettingsContainer />} />

                <Route path={'/*'} element={<NotFound />} />
            </Routes>
        </AdminContentBlock>
    );
};
