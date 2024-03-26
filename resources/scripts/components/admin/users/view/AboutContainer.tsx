import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import type { UpdateUserValues } from '@/api/admin/users';
import { updateUser } from '@/api/admin/users';
import { Context } from '@/components/admin/users/UserRouter';
import type { ApplicationStore } from '@/state';
import UserForm from './UserForm';

export default () => {
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

    return (
        <UserForm
            title={'Edit User'}
            initialValues={{
                externalId: user.externalId,
                username: user.username,
                email: user.email,
                adminRoleId: user.adminRoleId,
                password: '',
                state: user.state,
                rootAdmin: user.isRootAdmin,
            }}
            onSubmit={submit}
            uuid={user.uuid}
        />
    );
};
