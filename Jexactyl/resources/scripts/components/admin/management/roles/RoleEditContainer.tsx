import { action, Action, Actions, createContextStore, useStoreActions } from 'easy-peasy';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import { object, string } from 'yup';
import { getRole, updateRole } from '@/api/routes/admin/roles';
import FlashMessageRender from '@/elements/FlashMessageRender';
import AdminBox from '@/elements/AdminBox';
import AdminContentBlock from '@/elements/AdminContentBlock';
import RoleDeleteButton from '@/components/admin/management/roles/RoleDeleteButton';
import { Button } from '@/elements/button';
import Field from '@/elements/Field';
import Spinner from '@/elements/Spinner';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { UserRole } from '@definitions/admin';
import { useNavigate, useParams } from 'react-router-dom';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import PermissionsTable from './PermissionsTable';

interface ctx {
    role: UserRole | undefined;
    setRole: Action<ctx, UserRole | undefined>;
}

export const Context = createContextStore<ctx>({
    role: undefined,

    setRole: action((state, payload) => {
        state.role = payload;
    }),
});

interface Values {
    name: string;
    description: string;
    color: string;
}

const EditInformationContainer = () => {
    const navigate = useNavigate();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const role = Context.useStoreState(state => state.role);
    const setRole = Context.useStoreActions(actions => actions.setRole);

    if (role === undefined) {
        return <></>;
    }

    const submit = ({ name, description, color }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('role');

        updateRole(role.id, name, description, color)
            .then(() => setRole({ ...role, name, description, color }))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'role', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: role.name,
                description: role.description || '',
                color: role.color || '',
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().max(255, ''),
                color: string().nullable(),
            })}
        >
            {({ isSubmitting, isValid }) => (
                <React.Fragment>
                    <AdminBox title={'Edit Role'} css={tw`relative mb-6`} icon={faPencil}>
                        <SpinnerOverlay visible={isSubmitting} />

                        <Form css={tw`mb-0`}>
                            <div>
                                <Field id={'name'} name={'name'} label={'Name'} type={'text'} />
                            </div>

                            <div css={tw`mt-6`}>
                                <Field id={'description'} name={'description'} label={'Description'} type={'text'} />
                            </div>

                            <div css={tw`mt-6`}>
                                <Field id={'color'} type={'color'} name={'color'} label={'Color'} />
                            </div>

                            <div css={tw`w-full flex flex-row items-center mt-6`}>
                                <div css={tw`flex`}>
                                    <RoleDeleteButton roleId={role.id} onDeleted={() => navigate('/admin/roles')} />
                                </div>

                                <div css={tw`flex ml-auto`}>
                                    <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </AdminBox>
                </React.Fragment>
            )}
        </Formik>
    );
};

const RoleEditContainer = () => {
    const params = useParams<'id'>();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );
    const [loading, setLoading] = useState(true);

    const role = Context.useStoreState(state => state.role);
    const setRole = Context.useStoreActions(actions => actions.setRole);

    useEffect(() => {
        clearFlashes('role');

        getRole(Number(params?.id))
            .then(role => setRole(role))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'role', error });
            })
            .then(() => setLoading(false));
    }, []);

    if (loading || role === undefined) {
        return (
            <AdminContentBlock>
                <FlashMessageRender byKey={'role'} css={tw`mb-4`} />

                <div css={tw`w-full flex flex-col items-center justify-center`} style={{ height: '24rem' }}>
                    <Spinner size={'base'} />
                </div>
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Role - ' + role.name}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2
                        css={tw`text-2xl text-neutral-50 font-header font-medium`}
                        style={{ color: role.color ?? 'white' }}
                    >
                        {role.name}
                    </h2>
                    {(role.description || '').length < 1 ? (
                        <p css={tw`text-base text-neutral-400`}>
                            <span css={tw`italic`}>No description</span>
                        </p>
                    ) : (
                        <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                            {role.description}
                        </p>
                    )}
                </div>
            </div>
            <FlashMessageRender byKey={'role'} css={tw`mb-4`} />
            <EditInformationContainer />
            <div css={tw`w-full flex flex-row items-center my-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Role Permissions</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        This table contains the permissions that you can assign to the role.
                    </p>
                </div>
            </div>
            <PermissionsTable role={role} />
        </AdminContentBlock>
    );
};

export default () => {
    return (
        <Context.Provider>
            <RoleEditContainer />
        </Context.Provider>
    );
};
