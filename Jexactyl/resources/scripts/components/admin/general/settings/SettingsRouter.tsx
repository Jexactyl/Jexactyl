import { AdjustmentsIcon, ChipIcon } from '@heroicons/react/outline';
import { Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import AdminContentBlock from '@/elements/AdminContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import GeneralSettings from '@admin/general/settings/GeneralSettings';
import { useStoreState } from '@/state/hooks';
import ModeSettings from './ModeSettings';

const SettingsRouter = () => {
    const theme = useStoreState(state => state.theme.data!);
    const appName = useStoreState(state => state.settings.data!.name);

    return (
        <AdminContentBlock title={'Settings'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Settings</h2>
                    <p
                        css={tw`hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        Configure and manage settings for {appName}.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'admin:settings'} css={tw`mb-4`} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to="/admin/settings" name="Core" base>
                    <ChipIcon />
                </SubNavigationLink>
                <SubNavigationLink to="/admin/settings/mode" name="Modes">
                    <AdjustmentsIcon />
                </SubNavigationLink>
            </SubNavigation>

            <Routes>
                <Route path="/" element={<GeneralSettings />} />
                <Route path="/mode" element={<ModeSettings />} />
            </Routes>
        </AdminContentBlock>
    );
};

export default SettingsRouter;
