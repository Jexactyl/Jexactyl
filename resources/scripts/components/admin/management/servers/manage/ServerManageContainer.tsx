import tw from 'twin.macro';
import ReinstallServerBox from '@admin/management/servers/manage/ReinstallServerBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useEffect } from 'react';
import useFlash from '@/plugins/useFlash';
import ToggleInstallStatusBox from '@admin/management/servers/manage/ToggleInstallStatusBox';
import { useServerFromRoute } from '@/api/admin/server';
import SuspendServerBox from './SuspendServerBox';
import UnsuspendServerBox from './UnsuspendServerBox';

export default () => {
    const { data: server } = useServerFromRoute();
    const { clearFlashes } = useFlash();

    if (!server) return null;

    useEffect(() => {
        clearFlashes('server:manage');
    }, []);

    return (
        <div css={tw`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2 gap-y-2`}>
            <FlashMessageRender byKey={'server:manage'} className={'mb-4 md:col-span-2 xl:col-span-3'} />
            <ReinstallServerBox />
            <ToggleInstallStatusBox />
            {server.status === 'suspended' ? <UnsuspendServerBox /> : <SuspendServerBox />}
        </div>
    );
};
