import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import Registration from '@/components/admin/auth/modules/Registration';
import Security from './modules/Security';
import DiscordSSO from './modules/DiscordSSO';

export default () => {
    return (
        <AdminContentBlock title={'API Keys'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Authentication</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Configure and manage the authentication flow for users.
                    </p>
                </div>
            </div>
            <div className={'grid md:grid-cols-2 xl:grid-cols-3 gap-4'}>
                <Registration />
                <Security />
                <DiscordSSO />
            </div>
        </AdminContentBlock>
    );
};
