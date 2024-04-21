import { AdjustmentsIcon, ChipIcon, CodeIcon, MailIcon, ShieldCheckIcon } from '@heroicons/react/outline';
import { Route, Routes } from 'react-router-dom';
import tw from 'twin.macro';

import AdminContentBlock from '@/components/elements/AdminContentBlock';
import MailSettings from '@admin/general/settings/MailSettings';
import FlashMessageRender from '@/components/FlashMessageRender';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import GeneralSettings from '@admin/general/settings/GeneralSettings';
import { useStoreState } from '@/state/hooks';

const SettingsRouter = () => {
    const theme = useStoreState(state => state.theme.data!);
    const appName = useStoreState(state => state.settings.data!.name);

    return (
        <AdminContentBlock title={'Settings'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Settings</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Configure and manage settings for {appName}.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'admin:settings'} css={tw`mb-4`} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to="/admin/settings" name="Core">
                    <ChipIcon />
                </SubNavigationLink>
                <SubNavigationLink to="/admin/settings/mail" name="Mail">
                    <MailIcon />
                </SubNavigationLink>
                <SubNavigationLink to="/admin/settings/security" name="Security">
                    <ShieldCheckIcon />
                </SubNavigationLink>
                <SubNavigationLink to="/admin/settings/features" name="Features">
                    <AdjustmentsIcon />
                </SubNavigationLink>
                <SubNavigationLink to="/admin/settings/advanced" name="Advanced">
                    <CodeIcon />
                </SubNavigationLink>
            </SubNavigation>

            <Routes>
                <Route path="/" element={<GeneralSettings />} />
                <Route path="/mail" element={<MailSettings />} />
                <Route path="/security" element={<p>Coming soon...</p>} />
                <Route path="/features" element={<p>Coming soon...</p>} />
                <Route path="/advanced" element={<p>Coming soon...</p>} />
            </Routes>
        </AdminContentBlock>
    );
};

export default SettingsRouter;
