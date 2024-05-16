import { Alert } from '@elements/alert';
import useFlash from '@/plugins/useFlash';
import { Dialog } from '@elements/dialog';
import { Button } from '@elements/button';
import { useEffect, useState } from 'react';
import Input from '@/components/elements/Input';
import cancelBillingPlan from '@/api/billing/cancelBillingPlan';

export default ({ identifier }: { identifier: string }) => {
    const [name, setName] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [confirm, setConfirm] = useState<boolean>(false);
    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

    const doCancel = () => {
        clearFlashes();

        cancelBillingPlan(identifier)
            .then(() => {
                addFlash({
                    key: 'billing:plans:view',
                    type: 'success',
                    message: 'Your plan has been cancelled and your server will be deleted shortly.',
                });
            })
            .catch(error => clearAndAddHttpError({ key: 'billing:plans:view', error }));
    };

    useEffect(() => {
        if (name === identifier.slice(0, 4)) {
            setConfirm(false);
            doCancel();
        }
    }, [name]);

    return (
        <>
            <Dialog open={confirm} onClose={() => setConfirm(false)}>
                <p className={'text-gray-400 text-sm mb-1'}>
                    Enter the plan&apos;s 4-digit ID ({identifier.slice(0, 4)}) to confirm.
                </p>
                <Input onChange={e => setName(e.target.value)} />
            </Dialog>
            <Dialog.Confirm
                open={open}
                onConfirmed={() => {
                    setOpen(false);
                    setConfirm(true);
                }}
                onClose={() => setOpen(false)}
                title={'Confirm plan cancellation'}
                confirm={'Yes, cancel my plan immediately'}
            >
                If you cancel this product, your server will be instantly removed and you will no longer be charged. Are
                you sure you wish to continue? You cannot reverse this action!
                <Alert type={'danger'} className={'mt-2'}>
                    This is a destructive action and you WILL lose ALL server data.
                </Alert>
            </Dialog.Confirm>
            <Button.Danger onClick={() => setOpen(true)}>Cancel Plan</Button.Danger>
        </>
    );
};
