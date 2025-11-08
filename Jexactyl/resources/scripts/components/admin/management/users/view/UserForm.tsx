import type { Action } from 'easy-peasy';
import { action, createContextStore } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import tw from 'twin.macro';
import { bool, object, string } from 'yup';

import type { UpdateUserValues } from '@/api/routes/admin/users';
import AdminBox from '@/elements/AdminBox';
import CopyOnClick from '@/elements/CopyOnClick';
import FormikSwitch from '@/elements/FormikSwitch';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Button } from '@/elements/button';
import Field, { FieldRow } from '@/elements/Field';
import { UserRole, type User } from '@definitions/admin';
import { faIdBadge, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import RoleSelect from './RoleSelect';
import { useEffect, useState } from 'react';
import { getRole } from '@/api/routes/admin/roles';
import { Alert } from '@/elements/alert';

interface ctx {
    user: User | undefined;
    setUser: Action<ctx, User | undefined>;
}

export const Context: ReturnType<typeof createContextStore<ctx>> = createContextStore<ctx>({
    user: undefined,

    setUser: action((state, payload) => {
        state.user = payload;
    }),
});

export interface Params {
    title: string;
    initialValues?: UpdateUserValues;
    children?: React.ReactNode;

    onSubmit: (values: UpdateUserValues, helpers: FormikHelpers<UpdateUserValues>) => void;

    uuid?: string;
    admin_role_id?: number | null;
}

export default function UserForm({ title, initialValues, children, onSubmit, uuid, admin_role_id }: Params) {
    const { colors } = useStoreState(state => state.theme.data!);

    const [currentRole, setCurrentRole] = useState<UserRole | undefined>();

    const submit = (values: UpdateUserValues, helpers: FormikHelpers<UpdateUserValues>) => {
        onSubmit(values, helpers);
    };

    useEffect(() => {
        getRole(Number(admin_role_id))
            .then(setCurrentRole)
            .catch(error => console.log(error));
    }, []);

    if (!initialValues) {
        initialValues = {
            externalId: '',
            username: '',
            email: '',
            password: '',
            admin_role_id: null,
            state: '',
            rootAdmin: false,
        };
    }

    return (
        <Formik
            onSubmit={submit}
            initialValues={initialValues}
            validationSchema={object().shape({
                username: string().min(1).max(32),
                email: string(),
                rootAdmin: bool().required(),
            })}
        >
            {({ isSubmitting, isValid }) => (
                <Form>
                    <AdminBox title={title} css={tw`relative`} icon={faIdBadge}>
                        <SpinnerOverlay visible={isSubmitting} />
                        <FieldRow>
                            {uuid && (
                                <div>
                                    <Label>UUID</Label>
                                    <CopyOnClick text={uuid}>
                                        <Input type={'text'} value={uuid} readOnly />
                                    </CopyOnClick>
                                </div>
                            )}
                            {uuid && (
                                <Field
                                    id={'externalId'}
                                    name={'externalId'}
                                    label={'External ID'}
                                    type={'text'}
                                    description={
                                        'Used by external integrations, this field should not be modified unless you know what you are doing.'
                                    }
                                />
                            )}
                            <Field
                                id={'username'}
                                name={'username'}
                                label={'Username'}
                                type={'text'}
                                description={"The user's username, what else would go here?"}
                            />
                            <Field
                                id={'email'}
                                name={'email'}
                                label={'Email Address'}
                                type={'email'}
                                description={"The user's email address, what else would go here?"}
                            />
                            <Field
                                id={'password'}
                                name={'password'}
                                label={'Password'}
                                type={'password'}
                                placeholder={'••••••••'}
                                autoComplete={'new-password'}
                                /* TODO: Change description depending on if user is being created or updated. */
                                description={
                                    'Leave empty to email the user a link where they will be required to set a password.'
                                }
                            />
                        </FieldRow>
                    </AdminBox>
                    <AdminBox title={'Permission Control'} css={tw`relative mt-6`} icon={faToggleOn}>
                        <SpinnerOverlay visible={isSubmitting} />
                        <div className={'grid lg:grid-cols-2 gap-4'}>
                            <div css={tw`w-full flex flex-row mb-6`}>
                                <div
                                    css={tw`w-full border border-neutral-900 shadow-inner p-4 rounded`}
                                    style={{ backgroundColor: colors.headers }}
                                >
                                    <FormikSwitch
                                        name={'rootAdmin'}
                                        label={'Root Admin'}
                                        description={'Should this user be a root administrator?'}
                                    />
                                    <Alert type={'warning'} className={'mt-2'} small>
                                        Enabling RootAdmin gives the user full access. It is recommended to keep this
                                        off, but assign an admin role to the user to grant specific permissions.
                                    </Alert>
                                </div>
                            </div>
                            <div>
                                <RoleSelect selected={currentRole} />
                                <p className={'mt-1 text-xs'}>
                                    If you wish, you can assign an administrator role to restrict permissions.
                                </p>
                            </div>
                        </div>
                    </AdminBox>
                    <div css={tw`w-full flex flex-row items-center mt-6`}>
                        {children}
                        <div css={tw`flex ml-auto`}>
                            <Button type={'submit'} disabled={isSubmitting || !isValid}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
