import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Form, Formik } from 'formik';
import tw from 'twin.macro';
import { object } from 'yup';

import { useServerFromRoute } from '@/api/routes/admin/server';
import type { Values } from '@/api/routes/admin/servers/updateServer';
import updateServer from '@/api/routes/admin/servers/updateServer';
import ServerDeleteButton from '@admin/management/servers/ServerDeleteButton';
import BaseSettingsBox from '@admin/management/servers/settings/BaseSettingsBox';
import FeatureLimitsBox from '@admin/management/servers/settings/FeatureLimitsBox';
import NetworkingBox from '@admin/management/servers/settings/NetworkingBox';
import ServerResourceBox from '@admin/management/servers/settings/ServerResourceBox';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import TitledGreyBox from '@/elements/TitledGreyBox';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import getNode from '@/api/routes/admin/nodes/getNode';
import { Node } from '@/api/routes/admin/nodes/getNodes';
import Spinner from '@/elements/Spinner';
import NodeStatus from '@admin/management/nodes/NodeStatus';
import { NavLink } from 'react-router-dom';

export default () => {
    const [node, setNode] = useState<Node | undefined>();
    const { data: server } = useServerFromRoute();
    const { secondary } = useStoreState(state => state.theme.data!.colors);
    const { clearFlashes, clearAndAddHttpError } = useStoreActions(actions => actions.flashes);

    if (!server) return null;

    const submit = (values: Values, { setSubmitting, setFieldValue }: FormikHelpers<Values>) => {
        clearFlashes('server');

        updateServer(server.id, values)
            .then(() => {
                // setServer({ ...server, ...s });

                // TODO: Figure out how to properly clear react-selects for allocations.
                setFieldValue('addAllocations', []);
                setFieldValue('removeAllocations', []);
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'server', error });
            })
            .then(() => setSubmitting(false));
    };

    useEffect(() => {
        getNode(server.nodeId).then(node => setNode(node));
    }, []);

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                externalId: server.externalId || '',
                name: server.name,
                ownerId: server.ownerId,
                limits: {
                    memory: server.limits.memory,
                    swap: server.limits.swap,
                    disk: server.limits.disk,
                    io: server.limits.io,
                    cpu: server.limits.cpu,
                    threads: server.limits.threads || '',
                    oomKiller: server.limits.oomKiller,
                },
                featureLimits: {
                    allocations: server.featureLimits.allocations,
                    backups: server.featureLimits.backups,
                    databases: server.featureLimits.databases,
                    subusers: server.featureLimits.subusers,
                },
                allocationId: server.allocationId,
                addAllocations: [] as number[],
                removeAllocations: [] as number[],
            }}
            validationSchema={object().shape({})}
        >
            {({ isSubmitting, isValid }) => (
                <Form>
                    <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-16`}>
                        <div css={tw`grid grid-cols-1 gap-y-6`}>
                            <BaseSettingsBox />
                            <FeatureLimitsBox />
                            <NetworkingBox />
                        </div>

                        <div css={tw`flex flex-col`}>
                            <ServerResourceBox />
                            <TitledGreyBox title={'Node Information'} icon={faLayerGroup} className={'mt-6'}>
                                {!node ? (
                                    <Spinner size={'large'} centered />
                                ) : (
                                    <NavLink to={`/admin/nodes/${node.id}`} className={'text-blue-400'}>
                                        {node.name} &bull; {node.scheme}://{node.fqdn} <NodeStatus node={node.id} />
                                    </NavLink>
                                )}
                            </TitledGreyBox>

                            <div
                                style={{ backgroundColor: secondary }}
                                css={tw`rounded shadow-md px-4 xl:px-5 py-4 mt-6`}
                            >
                                <div css={tw`flex flex-row`}>
                                    <ServerDeleteButton />

                                    <Button type="submit" className="ml-auto" disabled={isSubmitting || !isValid}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};
