import { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { reinstallServer } from '@/api/routes/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import tw from 'twin.macro';
import { Button } from '@/elements/button/index';
import { Dialog } from '@/elements/dialog';

export default () => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Your server has begun the reinstallation process.',
                });
            })
            .catch(error => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <>
            <Dialog.Confirm
                open={modalVisible}
                title={'Confirm server reinstallation'}
                confirm={'Yes, reinstall server'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
            >
                <div css={tw`text-sm rounded-lg p-4 bg-yellow-500/25 mb-4`}>
                    Reinstalling your server will stop it, and then re-run the installation script that initially set it
                    up.&nbsp;
                    <strong css={tw`font-medium`}>
                        Some files may be deleted or modified during this process, please back up your data before
                        continuing.
                    </strong>
                </div>
                Your server will be stopped and some files may be deleted or modified during this process, are you sure
                you wish to continue?
            </Dialog.Confirm>
            <Button.Danger type={'button'} variant={Button.Variants.Secondary} onClick={() => setModalVisible(true)}>
                Reinstall Server
            </Button.Danger>
        </>
    );
};
