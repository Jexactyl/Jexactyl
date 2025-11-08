import { useState } from 'react';
import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import { deleteAllAllocations } from '@/api/routes/admin/nodes/allocations/deleteAllocation';
import useFlash from '@/plugins/useFlash';
import SpinnerOverlay from '@/elements/SpinnerOverlay';

export default ({ nodeId }: { nodeId: number }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const doDeleteAll = () => {
        setLoading(true);
        clearFlashes();

        deleteAllAllocations(nodeId)
            .then(() => window.location.reload())
            .catch(error => {
                setLoading(false);
                clearAndAddHttpError({ key: 'admin:nodes:allocations', error });
            });
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                buttonType={'danger'}
                onClose={() => setOpen(false)}
                onConfirmed={doDeleteAll}
                confirm={'Yes, delete all'}
                title={'Delete all unused allocations?'}
            >
                <SpinnerOverlay visible={loading} />
                Are you sure you wish to remove all unused allocations? You can re-create them at any time by using the
                form above. This action will not delete allocations which are currently assigned to servers.
            </Dialog.Confirm>
            <Button.Danger onClick={() => setOpen(true)}>Delete All Unused Allocations</Button.Danger>
        </>
    );
};
