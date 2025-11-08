import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import type { NodeInformation } from '@/api/routes/admin/nodes/getNodeInformation';
import getNodeInformation from '@/api/routes/admin/nodes/getNodeInformation';
import AdminBox from '@/elements/AdminBox';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Context } from '@admin/management/nodes/NodeRouter';
import { Alert } from '@/elements/alert';
import {
    faBarChart,
    faChartBar,
    faExclamationTriangle,
    faHdd,
    faMemory,
    faMicrochip,
    faQuestionCircle,
    faServer,
    faShuffle,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '@/elements/tooltip/Tooltip';
import getNodeUtilization, { NodeUtilization } from '@/api/routes/admin/nodes/getNodeUtilization';
import { useStoreState } from '@/state/hooks';

const Code = ({ className, children }: { className?: string; children: ReactNode }) => {
    return (
        <code css={tw`text-sm font-mono bg-neutral-900 rounded`} style={{ padding: '2px 6px' }} className={className}>
            {children}
        </code>
    );
};

const ResourceBox = ({
    icon,
    title,
    usage,
    large,
}: {
    icon: IconDefinition;
    title: string;
    usage: any;
    large?: boolean;
}) => (
    <div className={large ? 'col-span-2' : 'col-span-1'}>
        <div className={'bg-black/50 rounded-lg shadow-xl text-left'}>
            <div className={'grid grid-cols-3 gap-4 w-full p-4'}>
                <div className={'w-12 h-12 rounded-xl bg-black grid m-auto'}>
                    <div className={'m-auto'}>
                        <FontAwesomeIcon icon={icon} className={'text-xl'} />
                    </div>
                </div>
                <div className={'col-span-2 my-auto'}>
                    <p className={'text-xs uppercase text-gray-400 font-bold'}>{title}</p>
                    <p className={'text-lg text-gray-200 font-semibold'}>{usage}</p>
                </div>
            </div>
        </div>
    </div>
);

const AllocatedBox = ({ title, percent }: { title: string; percent?: number }) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div className={'w-full grid grid-cols-[1fr_auto]'}>
            <Label>{title}</Label>
            <Label>
                {(percent ?? 0) > 80 && (
                    <FontAwesomeIcon icon={faExclamationTriangle} className={'text-yellow-500/50 mr-1'} />
                )}
                {percent}%
            </Label>

            <div className="col-span-2 w-full rounded-full h-2.5" style={{ backgroundColor: colors.headers }}>
                <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${percent ?? 0}%`, backgroundColor: colors.primary }}
                ></div>
            </div>
        </div>
    );
};

export default () => {
    const { clearFlashes } = useFlash();
    const [error, setError] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<NodeInformation | null>(null);
    const [utilization, setUtilization] = useState<NodeUtilization | null>(null);

    const node = Context.useStoreState(state => state.node);

    if (node === undefined) {
        return <></>;
    }

    useEffect(() => {
        clearFlashes('node');

        getNodeInformation(node.id)
            .then(info => setInfo(info))
            .catch(error => {
                console.error(error);
                setError(true);
            })
            .then(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (info?.system.supercharged) {
            getNodeUtilization(node.id).then(util => setUtilization(util));
        }
    }, [info?.system.supercharged]);

    if (loading) {
        return (
            <AdminBox title={'Node Information'} icon={faServer} css={tw`relative`}>
                <SpinnerOverlay visible={loading} />
            </AdminBox>
        );
    }

    return (
        <div className={'grid lg:grid-cols-3 gap-4'}>
            {error ? (
                <Alert type={'danger'} className={'col-span-2'}>
                    We were unable to connect to this node, so no information can be displayed.
                </Alert>
            ) : (
                <>
                    <AdminBox title={'System Information'} icon={faServer}>
                        <table>
                            <tbody>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Version</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.version}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Operating System</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.type}</Code>
                                        <Code css={tw`ml-1`}>{info?.system.release}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Architecture</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.arch}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>CPU Threads</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.cpus}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Supercharged</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.supercharged ? 'Yes' : 'No'}</Code>
                                        <Tooltip
                                            placement={'right-end'}
                                            content={
                                                info?.system.supercharged
                                                    ? 'This node is running Jexactyl SuperDaemon, which adds more features.'
                                                    : 'This node is running Pterodactyl Wings. Consider moving to Jexactyl SuperDaemon for more features.'
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faQuestionCircle}
                                                size={'sm'}
                                                className={'my-auto text-gray-300 ml-2'}
                                            />
                                        </Tooltip>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </AdminBox>
                    <AdminBox icon={faMicrochip} title={'Resources'} css={tw`w-full relative`}>
                        <div css={tw`md:w-full md:flex md:flex-row mb-6`}>
                            <div css={tw`md:w-full md:flex md:flex-col md:mr-4 mb-6 md:mb-0`}>
                                <Label>Memory Limit</Label>
                                <Input disabled placeholder={`${(node.memory / 1024).toString()} GiB`}></Input>
                            </div>

                            <div css={tw`md:w-full md:flex md:flex-col md:ml-4 mb-6 md:mb-0`}>
                                <Label>Disk Limit</Label>
                                <Input disabled placeholder={`${(node.disk / 1024).toString()} GiB`}></Input>
                            </div>
                        </div>
                        <div css={tw`md:w-full md:flex md:flex-row mb-6`}>
                            <div css={tw`md:w-full md:flex md:flex-col mb-6 md:mb-0`}>
                                <Label>FQDN Address</Label>
                                <Input
                                    disabled
                                    placeholder={`${node.scheme}://${node.fqdn}:${node.listenPortHTTP}`}
                                ></Input>
                            </div>
                        </div>
                    </AdminBox>
                    <AdminBox icon={faChartBar} title={'Allocation Information'} css={tw`w-full relative`}>
                        <div className={'grid space-y-6'}>
                            <AllocatedBox title={'Memory allocated to servers'} percent={node.memoryUsedPercent} />
                            <AllocatedBox title={'Disk allocated to servers'} percent={node.diskUsedPercent} />
                            <AllocatedBox title={'Used Allocations'} percent={node.allocationsUsedPercent} />
                        </div>
                    </AdminBox>
                    {utilization && (
                        <AdminBox icon={faBarChart} title={'Resource Utilization'} css={tw`w-full relative`}>
                            <div className={'grid lg:grid-cols-3 gap-6'}>
                                <ResourceBox
                                    icon={faMicrochip}
                                    title={'CPU usage'}
                                    usage={`${utilization.cpu.toFixed(2)}%`}
                                />
                                <ResourceBox
                                    large
                                    icon={faMemory}
                                    title={'RAM utilization'}
                                    usage={`${(utilization.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB of ${(
                                        utilization.memory.total /
                                        1024 /
                                        1024 /
                                        1024
                                    ).toFixed(1)} GB`}
                                />
                                <ResourceBox
                                    large
                                    icon={faHdd}
                                    title={'Disk utilization'}
                                    usage={`${(utilization.disk.used / 1024 / 1024 / 1024).toFixed(1)} GB of ${(
                                        utilization.disk.total /
                                        1024 /
                                        1024 /
                                        1024
                                    ).toFixed(1)} GB`}
                                />
                                <ResourceBox
                                    icon={faShuffle}
                                    title={'Swap usage'}
                                    usage={`${(utilization.swap.used / 1024 / 1024 / 1024).toFixed(1)} GB`}
                                />
                            </div>
                        </AdminBox>
                    )}
                </>
            )}
        </div>
    );
};
