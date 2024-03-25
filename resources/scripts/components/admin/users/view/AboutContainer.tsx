import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { useNavigate } from 'react-router-dom';

import type { UpdateUserValues } from '@/api/admin/users';
import { deleteUser, updateUser } from '@/api/admin/users';
import UserForm from '@/components/admin/users/view/UserForm';
import { Context } from '@/components/admin/users/UserRouter';
import type { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import { Button } from '@/components/elements/button';
import { useState } from 'react';

const UserAboutContainer = () => {
    const navigate = useNavigate();

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const user = Context.useStoreState(state => state.user);
    const setUser = Context.useStoreActions(actions => actions.setUser);

    if (user === undefined) {
        return <></>;
    }

    const submit = (values: UpdateUserValues, { setSubmitting }: FormikHelpers<UpdateUserValues>) => {
        clearFlashes('user');

        updateUser(user.id, values)
            .then(() => setUser({ ...user, ...values }))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'user', error });
            })
            .then(() => setSubmitting(false));
    };

    const onDelete = () => {
        setLoading(true);
        clearFlashes('user');

        deleteUser(user.id)
            .then(() => {
                setLoading(false);
                navigate('/admin/users');
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'user', error });

                setLoading(false);
                setVisible(false);
            });
    };

    return (
        <UserForm
            title={'Edit User'}
            initialValues={{
                externalId: user.externalId,
                username: user.username,
                email: user.email,
                adminRoleId: user.adminRoleId,
                password: '',
                rootAdmin: user.isRootAdmin,
            }}
            onSubmit={submit}
            uuid={user.uuid}
        >
            <div css={tw`flex`}>
                <ConfirmationModal
                    visible={visible}
                    title={'Delete user?'}
                    buttonText={'Yes, delete user'}
                    onConfirmed={onDelete}
                    showSpinnerOverlay={loading}
                    onModalDismissed={() => setVisible(false)}
                >
                    Are you sure you want to delete this user?
                </ConfirmationModal>

                <Button.Danger type={'button'} size={Button.Sizes.Small} onClick={() => setVisible(true)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        css={tw`h-5 w-5`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </Button.Danger>
            </div>
        </UserForm>
    );
};

export default UserAboutContainer;
