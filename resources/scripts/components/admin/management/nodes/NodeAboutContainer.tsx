import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import type { NodeInformation } from '@/api/admin/nodes/getNodeInformation';
import getNodeInformation from '@/api/admin/nodes/getNodeInformation';
import AdminBox from '@elements/AdminBox';
import SpinnerOverlay from '@elements/SpinnerOverlay';
import { Context } from '@admin/management/nodes/NodeRouter';
import { Alert } from '@elements/alert';
import { faServer } from '@fortawesome/free-solid-svg-icons';
import useFlash from '@/plugins/useFlash';

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
        <AdminBox title={'Node Information'} icon={faServer}>
            {error ? (
                <Alert type={'danger'}>
                    We were unable to connect to this node, so no information can be displayed.
                </Alert>
            ) : (
                <table>
                    <tbody>
                        <tr>
                            <td css={tw`py-1 pr-6`}>Wings Version</td>
                            <td css={tw`py-1`}>
                                <Code css={tw`ml-auto`}>{info?.version ?? 'Unknown - node offline'}</Code>
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
                    </tbody>
                </table>
            )}
        </AdminBox>
    );
};
