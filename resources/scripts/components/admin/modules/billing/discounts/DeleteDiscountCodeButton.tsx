import { deleteDiscountCode } from '@/api/routes/admin/billing';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import useFlash from '@/plugins/useFlash';
import { useState } from 'react';

export default ({ id }: { id: number }) => {
    const { clearFlashes, addFlash } = useFlash();
    const [open, setOpen] = useState<boolean>(false);

    const submit = () => {
        clearFlashes();

        deleteDiscountCode(id)
            .then(() => {
                addFlash({
                    key: 'admin:billing:discount-codes',
                    message: 'Discount code removed successfully',
                    type: 'success',
                });
            })
            .finally(() => setOpen(false));
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={'Confirm discount code deletion'}
                onConfirmed={submit}
            >
                Are you sure you wish to delete this discount code? It will not be able to be used for new orders.
                Users` who already recieve an active discount from this code will continue to gain the discount on
                their` account until it runs out.
            </Dialog.Confirm>
            <Button.Danger className={'ml-2'} type={'button'} size={Button.Sizes.Small} onClick={() => setOpen(true)}>
                Delete
            </Button.Danger>
        </>
    );
};
