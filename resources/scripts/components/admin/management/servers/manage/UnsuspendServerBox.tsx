import tw from 'twin.macro';
import AdminBox from '@elements/AdminBox';
import { Button } from '@elements/button';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@elements/dialog';
import { useState } from 'react';
import { useServerFromRoute } from '@/api/admin/server';
import useFlash from '@/plugins/useFlash';
import unsuspendServer from '@/api/admin/servers/manage/unsuspendServer';

export default () => {
    const { data: server } = useServerFromRoute();
    const [visible, setVisible] = useState<boolean>(false);
    const { addFlash, clearAndAddHttpError } = useFlash();

    if (!server) return null;

    const submit = () => {
        unsuspendServer(server.id)
            .then(() => {
                addFlash({
                    key: 'server:manage',
                    type: 'success',
                    message: 'Your server is now unsuspended.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'server:manage',
                    error: `Failed to unsuspend server: ${error.message}`,
                });
            });

        setVisible(false);
    };

    return (
        <>
            <Dialog.Confirm
                title={'Confirm suspension removal'}
                onConfirmed={submit}
                open={visible}
                onClose={() => setVisible(false)}
                confirm={'I understand, proceed'}
            >
                Are you sure you wish to unsuspend this server? Users will now be able to reconnect as usual.
            </Dialog.Confirm>
            <div css={tw`h-auto flex flex-col`}>
                <AdminBox icon={faEye} title={'Unuspend Server'} css={tw`relative w-full`}>
                    <Button.Warn size={Button.Sizes.Large} css={tw`w-full`} onClick={() => setVisible(true)}>
                        Unsuspend Server
                    </Button.Warn>
                    <p css={tw`text-xs text-neutral-400 mt-2`}>
                        This action will allow users to access the server like normal.
                    </p>
                </AdminBox>
            </div>
        </>
    );
};
