import tw from 'twin.macro';
import AdminBox from '@elements/AdminBox';
import { Button } from '@elements/button';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@elements/dialog';
import { useState } from 'react';
import { useServerFromRoute } from '@/api/admin/server';
import useFlash from '@/plugins/useFlash';
import toggleInstallStatus from '@/api/admin/servers/manage/toggleInstallStatus';

export default () => {
    const { data: server } = useServerFromRoute();
    const [visible, setVisible] = useState<boolean>(false);
    const { addFlash, clearAndAddHttpError } = useFlash();

    if (!server) return null;

    const submit = () => {
        toggleInstallStatus(server.id)
            .then(() => {
                addFlash({
                    key: 'server:manage',
                    type: 'success',
                    message: "This server's install state has been toggled.",
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'server:manage',
                    error: `Failed to change server install state: ${error.message}`,
                });
            });

        setVisible(false);
    };

    return (
        <>
            <Dialog.Confirm
                title={'Confirm install status change'}
                onConfirmed={submit}
                open={visible}
                onClose={() => setVisible(false)}
                confirm={'I understand, proceed'}
            >
                Are you sure you wish to change the install status of this server?
            </Dialog.Confirm>
            <div css={tw`h-auto flex flex-col`}>
                <AdminBox icon={faDownload} title={'Install Status'} css={tw`relative w-full`}>
                    <Button.Info size={Button.Sizes.Large} css={tw`w-full`} onClick={() => setVisible(true)}>
                        Set Server as {server.status === 'installing' ? 'Active' : 'Installing'}
                    </Button.Info>
                    <p css={tw`text-xs text-neutral-400 mt-2`}>
                        Change the server from being in an installed state to uninstalled, or vice versa. Your server is
                        currently marked as&nbsp;
                        <span className={'text-blue-400'}>
                            {server.status === 'installing' ? 'installing' : 'active'}
                        </span>
                        .
                    </p>
                </AdminBox>
            </div>
        </>
    );
};
