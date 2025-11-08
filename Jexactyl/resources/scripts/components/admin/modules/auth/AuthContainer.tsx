import tw from 'twin.macro';
import AdminContentBlock from '@/elements/AdminContentBlock';
import Registration from '@admin/modules/auth/Registration';
import Security from './Security';
import { Button } from '@/elements/button';
import { useState } from 'react';
import { Dialog } from '@/elements/dialog';
import AuthModules from '@/components/admin/modules/auth/Modules';
import { useStoreState } from '@/state/hooks';
import DiscordSSO from './modules/DiscordSSO';
import Onboarding from '@admin/modules/auth/modules/Onboarding';
import GoogleSSO from './modules/GoogleSSO';
import JGuard from './modules/JGuard';
import Unfinished from '@/elements/Unfinished';

export default () => {
    const [visible, setVisible] = useState<boolean>(false);
    const modules = useStoreState(state => state.everest.data!.auth.modules);

    return (
        <AdminContentBlock title={'Authentication'}>
            {visible && (
                <Dialog title={'Add Modules'} open={visible} onClose={() => setVisible(false)}>
                    <div className={'space-y-3'}>
                        <AuthModules />
                    </div>
                </Dialog>
            )}
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Authentication</h2>
                    <p
                        css={tw`hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        Configure and manage the authentication flow for users.
                    </p>
                </div>
                <div css={tw`flex ml-auto pl-4`}>
                    <Button
                        type={'button'}
                        size={Button.Sizes.Large}
                        onClick={() => setVisible(true)}
                        css={tw`h-10 px-4 py-0 whitespace-nowrap`}
                    >
                        Add Module
                    </Button>
                </div>
            </div>
            <Unfinished untested />
            <div className={'grid md:grid-cols-2 xl:grid-cols-3 gap-4'}>
                <Registration />
                <Security />
                {modules.onboarding.enabled && <Onboarding />}
                {modules.jguard.enabled && <JGuard />}
                {modules.discord.enabled && <DiscordSSO />}
                {modules.google.enabled && <GoogleSSO />}
            </div>
        </AdminContentBlock>
    );
};
