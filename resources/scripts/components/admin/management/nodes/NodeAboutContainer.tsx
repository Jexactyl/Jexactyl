import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import type { NodeInformation } from '@/api/admin/nodes/getNodeInformation';
import getNodeInformation from '@/api/admin/nodes/getNodeInformation';
import AdminBox from '@elements/AdminBox';
import SpinnerOverlay from '@elements/SpinnerOverlay';
import { Context } from '@admin/management/nodes/NodeRouter';
import { Alert } from '@elements/alert';
import { faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';

const Code = ({ className, children }: { className?: string; children: ReactNode }) => {
    return (
        <code css={tw`text-sm font-mono bg-neutral-900 rounded`} style={{ padding: '2px 6px' }} className={className}>
            {children}
        </code>
    );
};

export default () => {
    const { clearFlashes } = useFlash();
    const [error, setError] = useState<boolean>(false);

    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<NodeInformation | null>(null);

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

    if (loading) {
        return (
            <AdminBox title={'Node Information'} icon={faServer} css={tw`relative`}>
                <SpinnerOverlay visible={loading} />
            </AdminBox>
        );
    }

    return (
        <div className={'grid lg:grid-cols-2 gap-4'}>
            {error ? (
                <Alert type={'danger'} className={'col-span-2'}>
                    We were unable to connect to this node, so no information can be displayed.
                </Alert>
            ) : (
                <>
                    <AdminBox title={'Node Information'} icon={faServer}>
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
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Architecture</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.arch}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Kernel</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.release}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>CPU Threads</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{info?.system.cpus}</Code>
                                    </td>
                                </tr>
                                <tr>
                                    <td css={tw`py-1 pr-6`}>Daemon Ports</td>
                                    <td css={tw`py-1`}>
                                        <Code css={tw`ml-auto`}>{node.listenPortHTTP}</Code>
                                        <Code css={tw`ml-1`}>{node.listenPortSFTP}</Code>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </AdminBox>
                    <AdminBox icon={faMicrochip} title={'Node Resources'} css={tw`w-full relative`}>
                        <div css={tw`md:w-full md:flex md:flex-row mb-6`}>
                            <div css={tw`md:w-full md:flex md:flex-col md:mr-4 mb-6 md:mb-0`}>
                                <Label>Memory Limit</Label>
                                <Input disabled placeholder={node.memory.toString()}></Input>
                            </div>

                            <div css={tw`md:w-full md:flex md:flex-col md:ml-4 mb-6 md:mb-0`}>
                                <Label>Disk Limit</Label>
                                <Input disabled placeholder={node.disk.toString()}></Input>
                            </div>
                        </div>
                        <div css={tw`md:w-full md:flex md:flex-row mb-6`}>
                            <div css={tw`md:w-full md:flex md:flex-col md:mr-4 mb-6 md:mb-0`}>
                                <Label>Location Name</Label>
                                <Input disabled placeholder={node.relations.location!.short}></Input>
                            </div>

                            <div css={tw`md:w-full md:flex md:flex-col md:ml-4 mb-6 md:mb-0`}>
                                <Label>FQDN Address</Label>
                                <Input disabled placeholder={node.fqdn}></Input>
                            </div>
                        </div>
                    </AdminBox>
                </>
            )}
        </div>
    );
};
