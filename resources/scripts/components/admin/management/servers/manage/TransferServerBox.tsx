import tw from 'twin.macro';
import { useState, useEffect } from 'react';
import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useServerFromRoute } from '@/api/routes/admin/server';
import useFlash from '@/plugins/useFlash';
import transferServer from '@/api/routes/admin/servers/manage/transferServer';
import { searchNodes, getAllocations, Node, Allocation } from '@/api/routes/admin/node';

export default () => {
    const { data: server } = useServerFromRoute();
    const [visible, setVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [selectedAllocationId, setSelectedAllocationId] = useState<number | null>(null);
    const { addFlash } = useFlash();

    if (!server) return null;

    useEffect(() => {
        if (visible) {
            // Fetch available nodes when dialog opens
            searchNodes({ filters: {} })
                .then(fetchedNodes => {
                    // Filter out the current node
                    const availableNodes = fetchedNodes.filter(node => node.id !== server.nodeId);
                    setNodes(availableNodes);
                })
                .catch(error => {
                    addFlash({
                        key: 'server:manage',
                        type: 'error',
                        message: 'Unable to load available nodes. Please try again.',
                    });
                });
        }
    }, [visible]);

    useEffect(() => {
        if (selectedNodeId) {
            setLoading(true);
            // Fetch all allocations for the selected node and filter client-side for unassigned ones
            getAllocations(selectedNodeId)
                .then(fetchedAllocations => {
                    // Filter for allocations that are not assigned to any server
                    // According to the API, unassigned allocations have assigned=false and server_id=null
                    const availableAllocations = fetchedAllocations.filter(
                        allocation => !allocation.isAssigned
                    );
                    setAllocations(availableAllocations);
                    // Auto-select first allocation if available
                    if (availableAllocations.length > 0) {
                        setSelectedAllocationId(availableAllocations[0].id);
                    } else {
                        setSelectedAllocationId(null);
                    }
                    setLoading(false);
                })
                .catch(error => {
                    addFlash({
                        key: 'server:manage',
                        type: 'error',
                        message: 'Unable to load available allocations for the selected node.',
                    });
                    setLoading(false);
                });
        } else {
            setAllocations([]);
            setSelectedAllocationId(null);
        }
    }, [selectedNodeId]);

    const submit = () => {
        if (!selectedNodeId || !selectedAllocationId) {
            addFlash({
                key: 'server:manage',
                type: 'error',
                message: 'Please select both a node and an allocation.',
            });
            return;
        }

        setLoading(true);
        transferServer(server.id, {
            node_id: selectedNodeId,
            allocation_id: selectedAllocationId,
        })
            .then(() => {
                addFlash({
                    key: 'server:manage',
                    type: 'success',
                    message: 'Server transfer has been initiated. This may take several minutes.',
                });
                setVisible(false);
                // Reset form
                setSelectedNodeId(null);
                setSelectedAllocationId(null);
                setNodes([]);
                setAllocations([]);
            })
            .catch(error => {
                addFlash({
                    key: 'server:manage',
                    type: 'error',
                    message: 'Failed to initiate server transfer. Please ensure the server is not suspended or already being transferred.',
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <>
            <Dialog
                title={'Transfer Server'}
                open={visible}
                onClose={() => {
                    setVisible(false);
                    setSelectedNodeId(null);
                    setSelectedAllocationId(null);
                    setNodes([]);
                    setAllocations([]);
                }}
            >
                <div css={tw`space-y-4`}>
                    <p css={tw`text-sm text-neutral-400`}>
                        <FontAwesomeIcon icon={faExclamationTriangle} className={'mr-1 text-yellow-500'} />
                        Transferring a server will move all of its files to a new node. The server will be stopped
                        during this process and may experience downtime.
                    </p>

                    <div>
                        <label css={tw`block text-sm font-medium mb-2`}>Target Node</label>
                        <select
                            css={tw`shadow-none block p-3 pr-8 rounded border w-full text-sm transition-colors duration-150 ease-linear border-neutral-500 text-neutral-200 bg-neutral-800 outline-none`}
                            value={selectedNodeId?.toString() || ''}
                            onChange={e => setSelectedNodeId(e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">Select a node...</option>
                            {nodes.map(node => (
                                <option key={node.id} value={node.id}>
                                    {node.name} ({node.fqdn})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedNodeId && (
                        <div>
                            <label css={tw`block text-sm font-medium mb-2`}>Target Allocation</label>
                            <select
                                css={tw`shadow-none block p-3 pr-8 rounded border w-full text-sm transition-colors duration-150 ease-linear border-neutral-500 text-neutral-200 bg-neutral-800 outline-none disabled:opacity-50`}
                                value={selectedAllocationId?.toString() || ''}
                                onChange={e =>
                                    setSelectedAllocationId(e.target.value ? parseInt(e.target.value) : null)
                                }
                                disabled={loading || allocations.length === 0}
                            >
                                {allocations.length === 0 ? (
                                    <option value="">No available allocations</option>
                                ) : (
                                    <>
                                        <option value="">Select an allocation...</option>
                                        {allocations.map(allocation => (
                                            <option key={allocation.id} value={allocation.id}>
                                                {allocation.ip}:{allocation.port}
                                                {allocation.alias ? ` (${allocation.alias})` : ''}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    )}

                    <div css={tw`flex justify-end space-x-4 mt-6`}>
                        <Button.Text
                            onClick={() => {
                                setVisible(false);
                                setSelectedNodeId(null);
                                setSelectedAllocationId(null);
                                setNodes([]);
                                setAllocations([]);
                            }}
                        >
                            Cancel
                        </Button.Text>
                        <Button.Danger
                            onClick={submit}
                            disabled={!selectedNodeId || !selectedAllocationId || loading}
                        >
                            {loading ? 'Transferring...' : 'Transfer Server'}
                        </Button.Danger>
                    </div>
                </div>
            </Dialog>
            <div css={tw`h-auto flex flex-col`}>
                <AdminBox icon={faExchangeAlt} title={'Transfer Server'} css={tw`relative w-full`}>
                    <Button size={Button.Sizes.Large} css={tw`w-full`} onClick={() => setVisible(true)}>
                        Transfer Server
                    </Button>
                    <p css={tw`text-xs text-neutral-400 mt-2`}>
                        Transfer this server to a different node. The server will be stopped and all files will be
                        migrated.
                    </p>
                </AdminBox>
            </div>
        </>
    );
};
