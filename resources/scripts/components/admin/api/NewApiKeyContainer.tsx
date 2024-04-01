import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import { Button } from '@/components/elements/button';
import FlashMessageRender from '@/components/FlashMessageRender';
import type { ApplicationStore } from '@/state';
import type { Values } from '@/api/admin/api/createApiKey';
import createApiKey from '@/api/admin/api/createApiKey';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { faCog, faElevator } from '@fortawesome/free-solid-svg-icons';
import AdminBox from '@/components/admin/AdminBox';
import PermissionRow from '@/components/admin/api/PermissionRow';

const initialValues: Values = {
    memo: 'Your API Key',
    permissions: {
        r_allocations: '0',
        r_database_hosts: '0',
        r_eggs: '0',
        r_locations: '0',
        r_nests: '0',
        r_nodes: '0',
        r_server_databases: '0',
        r_servers: '0',
        r_users: '0',
    },
};

export default () => {
    const navigate = useNavigate();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('api:create');

        createApiKey(values)
            .then(() => navigate(`/admin/api`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'api:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'New API Key'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>New Api Key</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        Add a new API key to the panel.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'api:create'} />

            <Formik
                onSubmit={submit}
                initialValues={initialValues}
                /*
                validationSchema={object().shape({
                    memo: string().required().max(191).min(3),
                    permissions: array().of(
                        object().shape({
                            allocations: number().required(),
                            database_hosts: number().required(),
                            eggs: number().required(),
                            locations: number().required(),
                            nests: number().required(),
                            nodes: number().required(),
                            server_databases: number().required(),
                            servers: number().required(),
                            users: number().required(),
                        }),
                    ),
                })}
                */
            >
                {({ isSubmitting, isValid }) => (
                    <Form>
                        <div css={tw`flex flex-col lg:flex-row`}>
                            <div css={tw`w-full lg:w-1/2 flex flex-col mr-0 lg:mr-2`}>
                                <AdminBox icon={faCog} title={'Settings'} css={tw`w-full relative`}>
                                    <SpinnerOverlay visible={isSubmitting} />

                                    <div css={tw`mb-6`}>
                                        <Field id={'memo'} name={'memo'} label={'Key Memo'} type={'text'} />
                                        <p className={'text-gray-400 text-xs mt-1'}>
                                            A simple name or description to identify your API key.
                                        </p>
                                    </div>
                                </AdminBox>
                                <div css={tw`rounded shadow-md bg-zinc-800 mt-4 py-2 pr-6`}>
                                    <div css={tw`flex flex-row`}>
                                        <Button type={'submit'} css={tw`ml-auto`} disabled={isSubmitting || !isValid}>
                                            Create
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div css={tw`w-full lg:w-1/2 flex flex-col ml-0 lg:ml-2 mt-4 lg:mt-0`}>
                                <div css={tw`flex w-full`}>
                                    <AdminBox icon={faElevator} title={'Access Permissions'} css={tw`w-full relative`}>
                                        <SpinnerOverlay visible={isSubmitting} />
                                        <PermissionRow name={'Allocations'} id={'r_allocations'} />
                                        <PermissionRow name={'Database Hosts'} id={'r_database_hosts'} />
                                        <PermissionRow name={'Eggs'} id={'r_eggs'} />
                                        <PermissionRow name={'Locations'} id={'r_locations'} />
                                        <PermissionRow name={'Nests'} id={'r_nests'} />
                                        <PermissionRow name={'Nodes'} id={'r_nodes'} />
                                        <PermissionRow name={'Server Databases'} id={'r_server_databases'} />
                                        <PermissionRow name={'Servers'} id={'r_servers'} />
                                        <PermissionRow name={'User Accounts'} id={'r_users'} />
                                    </AdminBox>
                                </div>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </AdminContentBlock>
    );
};
