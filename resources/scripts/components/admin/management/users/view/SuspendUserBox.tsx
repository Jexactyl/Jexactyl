import tw from 'twin.macro';
import AdminBox from '@elements/AdminBox';
import { Button } from '@elements/button';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@elements/dialog';
import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Context } from '../UserRouter';
import { suspendUser } from '@/api/admin/users';

export default () => {
    const { addFlash, clearAndAddHttpError } = useFlash();
    const [visible, setVisible] = useState<boolean>(false);
    const user = Context.useStoreState(state => state.user);

    const action = user?.state === 'suspended' ? 'unsuspend' : 'suspend';

    const submit = () => {
        suspendUser(user!.id)
            .then(() => {
                addFlash({
                    key: 'user:manage',
                    type: 'success',
                    message: 'This user has been suspended.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'user:manage',
                    error: error,
                });
            });

        setVisible(false);
    };

    return (
        <>
            <Dialog.Confirm
                title={`Confirm ${action} request`}
                onConfirmed={submit}
                open={visible}
                onClose={() => setVisible(false)}
                confirm={'I understand, proceed'}
            >
                Are you sure you wish to {action} this user?
            </Dialog.Confirm>
            <div css={tw`h-auto flex flex-col`}>
                <AdminBox
                    icon={action === 'suspend' ? faEyeSlash : faEye}
                    title={`${action} user`}
                    css={tw`relative w-full`}
                >
                    <Button.Warn size={Button.Sizes.Large} css={tw`w-full capitalize`} onClick={() => setVisible(true)}>
                        {action} User
                    </Button.Warn>
                    <p css={tw`text-xs text-neutral-400 mt-2`}>
                        This will {action} the user instantly. This account is currently&nbsp;
                        {user?.state === 'suspended' ? 'suspended' : 'active'}.
                    </p>
                </AdminBox>
            </div>
        </>
    );
};
