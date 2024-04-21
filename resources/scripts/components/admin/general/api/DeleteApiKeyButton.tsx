import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Dialog } from '@elements/dialog';
import { Button } from '@elements/button';
import deleteApiKey from '@/api/admin/api/deleteApiKey';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default ({ id }: { id: number }) => {
    const [visible, setVisible] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const submit = () => {
        clearFlashes('api');

        deleteApiKey(id)
            .then(() => window.location.reload())
            .catch(error => clearAndAddHttpError({ key: 'api', error }));

        setVisible(false);
    };

    return (
        <>
            <Dialog.Confirm
                open={visible}
                onConfirmed={submit}
                onClose={() => setVisible(false)}
                title={'Confirm API Key Deletion'}
            >
                Deleting this key will instantly remove all access. You will not be able to reverse this action!
            </Dialog.Confirm>
            <Button.Danger className={'mt-2'} size={Button.Sizes.Small} onClick={() => setVisible(true)}>
                <FontAwesomeIcon icon={faTrash} />
            </Button.Danger>
        </>
    );
};
