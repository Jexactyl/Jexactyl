import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik, useFormikContext } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tw from 'twin.macro';
import { number, object, string } from 'yup';

import type { CreateNodeValues as Values } from '@/api/routes/admin/nodes';
import { createNodeEntry as createNode } from '@/api/routes/admin/nodes';
import AdminBox from '@/elements/AdminBox';
import NodeExpressContainer from '@admin/management/nodes/NodeExpressContainer';
import NodeLimitContainer from '@admin/management/nodes/NodeLimitContainer';
import NodeListenContainer from '@admin/management/nodes/NodeListenContainer';
import NodeSettingsContainer from '@admin/management/nodes/NodeSettingsContainer';
import { Button } from '@/elements/button';
import Switch from '@/elements/Switch';
import type { ApplicationStore } from '@/state';
import NodeBillingContainer from './NodeBillingContainer';
import { PlusIcon } from '@heroicons/react/outline';

type Values2 = Omit<Omit<Values, 'behindProxy'>, 'public' | 'deployable' | 'deployableFree'> & {
    behindProxy: string;
    public: string;
    deployable: string;
    deployableFree: string;
};

const initialValues: Values2 = {
    name: '',
    locationId: 0,
    databaseHostId: null,
    fqdn: '',
    sftpAlias: '',
    scheme: 'https',
    behindProxy: 'false',
    public: 'true',
    daemonBase: '/var/lib/pterodactyl/volumes',
    deployable: 'false',
    deployableFree: 'false',
    deploymentFee: 0,

    listenPortHTTP: 8080,
    publicPortHTTP: 8080,
    listenPortSFTP: 2022,
    publicPortSFTP: 2022,

    memory: 0,
    memoryOverallocate: 0,
    disk: 0,
    diskOverallocate: 0,
};

function InternalForm() {
    const { isSubmitting, isValid } = useFormikContext();
    const [advanced, setAdvanced] = useState(false);

    return (
        <Form>
            <div css={tw`w-full mb-4`}>
                <AdminBox title={'Setup Mode'} css={tw`w-full relative`}>
                    <Switch
                        name={'advancedSetup'}
                        label={advanced ? 'Advanced' : 'Express'}
                        description={
                            advanced
                                ? 'Configure every setting for this node.'
                                : 'Configure only the essentials — everything else uses sensible defaults.'
                        }
                        defaultChecked={advanced}
                        onChange={() => setAdvanced(!advanced)}
                    />
                </AdminBox>
            </div>

            {advanced ? (
                <div css={tw`flex flex-col lg:flex-row`}>
                    <div css={tw`w-full lg:w-1/2 flex flex-col mr-0 lg:mr-2`}>
                        <NodeSettingsContainer />
                    </div>

                    <div css={tw`w-full lg:w-1/2 flex flex-col ml-0 lg:ml-2 mt-4 lg:mt-0`}>
                        <div css={tw`flex w-full`}>
                            <NodeListenContainer />
                        </div>

                        <div css={tw`flex w-full mt-4`}>
                            <NodeLimitContainer />
                        </div>

                        <div css={tw`flex w-full mt-4`}>
                            <NodeBillingContainer />
                        </div>
                    </div>
                </div>
            ) : (
                <div css={tw`flex flex-col lg:flex-row`}>
                    <div css={tw`w-full lg:w-1/2 flex flex-col mr-0 lg:mr-2`}>
                        <NodeExpressContainer />
                    </div>

                    <div css={tw`w-full lg:w-1/2 flex flex-col ml-0 lg:ml-2 mt-4 lg:mt-0`}>
                        <NodeBillingContainer />
                    </div>
                </div>
            )}

            <div css={tw`mt-4 py-2 pr-6`}>
                <div css={tw`flex flex-row`}>
                    <Button
                        type={'submit'}
                        size={Button.Sizes.Large}
                        css={tw`ml-auto`}
                        disabled={isSubmitting || !isValid}
                        icon={PlusIcon}
                    >
                        Create
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default () => {
    const navigate = useNavigate();

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    const submit = (values2: Values2, { setSubmitting }: FormikHelpers<Values2>) => {
        clearFlashes('node:create');

        const values: Values = {
            ...values2,
            behindProxy: values2.behindProxy === 'true',
            public: values2.public === 'true',
            deployable: values2.deployable === 'true',
            deployableFree: values2.deployableFree === 'true',
        };

        createNode(values)
            .then(node => navigate(`/admin/nodes/${node.id}/configuration?setup=true`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'node:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={initialValues}
            validationSchema={object().shape({
                name: string().required().max(191),

                listenPortHTTP: number().required(),
                publicPortHTTP: number().required(),
                listenPortSFTP: number().required(),
                publicPortSFTP: number().required(),

                memory: number().required(),
                memoryOverallocate: number().required(),
                disk: number().required(),
                diskOverallocate: number().required(),
                deploymentFee: number()
                    .typeError('Deployment fee must be a number')
                    .min(0, 'Deployment fee cannot be negative'),
            })}
        >
            <InternalForm />
        </Formik>
    );
};
