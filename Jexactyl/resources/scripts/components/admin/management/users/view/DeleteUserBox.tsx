import tw from 'twin.macro';
import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from '@/elements/dialog';
import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { Context } from '@admin/management/users/UserRouter';
import { deleteUser } from '@/api/routes/admin/users';
import { useNavigate } from 'react-router-dom';

export default () => {
    const navigate = useNavigate();
    const { clearAndAddHttpError } = useFlash();
    const [visible, setVisible] = useState<boolean>(false);
    const user = Context.useStoreState(state => state.user!.id);

    const submit = () => {
        deleteUser(user)
            .then(() => {
                navigate('/admin/users');
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'user:manage', error });
            });

        setVisible(false);
    };

    return (
        <>
            <Dialog.Confirm
                title={'Confirm deletion request'}
                onConfirmed={submit}
                open={visible}
                onClose={() => setVisible(false)}
                confirm={'I understand, proceed'}
            >
                Are you sure you wish to delete this user? They will not be able to access the Panel anymore!
            </Dialog.Confirm>
            <div css={tw`h-auto flex flex-col`}>
                <AdminBox icon={faUserSlash} title={'Delete User'} css={tw`relative w-full`}>
                    <Button.Danger size={Button.Sizes.Large} css={tw`w-full`} onClick={() => setVisible(true)}>
                        Delete User
                    </Button.Danger>
                    <p css={tw`text-xs text-neutral-400 mt-2`}>
                        This will remove the user&apos;s account, meaning they will not be able to access the Panel.
                    </p>
                </AdminBox>
            </div>
        </>
    );
};
