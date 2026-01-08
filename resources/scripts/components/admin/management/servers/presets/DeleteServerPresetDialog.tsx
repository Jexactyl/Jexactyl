import { deleteServerPreset } from '@/api/routes/admin/servers/presets';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { TrashIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default ({ id }: { id: number }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const submit = () => {
        setLoading(true);

        deleteServerPreset(id)
            .then(() => navigate('/admin/servers/presets'))
            .catch(e => console.log(e))
            .finally(() => setLoading(false));
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={'Confirm server preset deletion'}
                onConfirmed={submit}
                buttonType={'danger'}
            >
                <SpinnerOverlay visible={loading} />
                Are you sure you wish to delete this server preset? This action cannot be undone.
            </Dialog.Confirm>
            <Button.Danger onClick={() => setOpen(true)}>
                <TrashIcon className={'w-5 h-5 mr-1'} /> Delete
            </Button.Danger>
        </>
    );
};
