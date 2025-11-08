import { useStoreActions } from 'easy-peasy';
import { useState } from 'react';
import deleteDatabase from '@/api/routes/admin/databases/deleteDatabase';
import { Button } from '@/elements/button';
import { Shape } from '@/elements/button/types';
import ConfirmationModal from '@/elements/ConfirmationModal';
import { TrashIcon } from '@heroicons/react/outline';

interface Props {
    databaseId: number;
    onDeleted: () => void;
}

export default ({ databaseId, onDeleted }: Props) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(actions => actions.flashes);

    const onDelete = () => {
        setLoading(true);
        clearFlashes('admin:databases');

        deleteDatabase(databaseId)
            .then(() => {
                setLoading(false);
                onDeleted();
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'admin:databases', error });

                setLoading(false);
                setVisible(false);
            });
    };

    return (
        <>
            <ConfirmationModal
                visible={visible}
                title={'Delete database host?'}
                buttonText={'Yes, delete database host'}
                onConfirmed={onDelete}
                showSpinnerOverlay={loading}
                onModalDismissed={() => setVisible(false)}
            >
                Are you sure you want to delete this database host? This action will delete all knowledge of databases
                created on this host but not the databases themselves.
            </ConfirmationModal>

            <Button.Danger type="button" shape={Shape.IconSquare} onClick={() => setVisible(true)}>
                <TrashIcon className={'w-5 h-5'} />
            </Button.Danger>
        </>
    );
};
