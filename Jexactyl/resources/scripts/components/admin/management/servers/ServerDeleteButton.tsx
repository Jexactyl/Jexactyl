import { TrashIcon } from '@heroicons/react/outline';
import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/elements/button';
import deleteServer from '@/api/routes/admin/servers/deleteServer';
import { useServerFromRoute } from '@/api/routes/admin/server';
import type { ApplicationStore } from '@/state';
import { Dialog } from '@/elements/dialog';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import Checkbox from '@/elements/inputs/Checkbox';
import { Alert } from '@/elements/alert';

export default () => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [force, setForce] = useState(false);
    const { data: server } = useServerFromRoute();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const onDelete = () => {
        if (!server) return;

        setLoading(true);
        clearFlashes('server');

        deleteServer(server.id, force)
            .then(() => navigate('/admin/servers'))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'server', error });

                setLoading(false);
                setVisible(false);
            });
    };

    if (!server) return null;

    return (
        <>
            <Dialog.Confirm
                open={visible}
                title={'Delete server?'}
                confirm={'Yes, delete server'}
                onConfirmed={onDelete}
                onClose={() => setVisible(false)}
            >
                <SpinnerOverlay visible={loading} />
                Are you sure you want to delete this server?
                <div className={'bg-black/50 rounded-lg p-4 text-gray-400 mt-4'}>
                    <Checkbox onClick={() => setForce(!force)} className={'mr-1'} />
                    Force delete this server from the Panel
                </div>
                {force && (
                    <Alert type={'warning'} className={'mt-2'}>
                        Using force to delete this server from the Panel will delete its contents and data, regardless
                        of any errors that may occur during the process. Only use this if safely deleting the server
                        fails.
                    </Alert>
                )}
            </Dialog.Confirm>

            <Button.Danger type="button" onClick={() => setVisible(true)} className="flex items-center justify-center">
                <TrashIcon className="h-5 w-5" />
            </Button.Danger>
        </>
    );
};
