import { useState } from 'react';
import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import { SparklesIcon } from '@heroicons/react/outline';
import { createServerFromPreset, getServerPresets } from '@/api/routes/admin/servers/presets';
import Select from '@/elements/Select';
import { ServerPreset } from '@/api/definitions/admin';
import getNodes, { Node } from '@/api/routes/admin/nodes/getNodes';
import { Alert } from '@/elements/alert';
import FlashMessageRender from '@/elements/FlashMessageRender';
import useFlash from '@/plugins/useFlash';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const [selectedPreset, setSelectedPreset] = useState<ServerPreset | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [open, setOpen] = useState(false);

    const { data: presets } = getServerPresets();
    const { data: nodes } = getNodes();

    const presetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        const preset = presets?.items.find(p => p.id === id) ?? null;
        setSelectedPreset(preset);
    };

    const nodeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        const node = nodes?.items.find(p => p.id === id) ?? null;
        setSelectedNode(node);
    };

    const submit = () => {
        clearFlashes();

        if (!selectedPreset || !selectedNode) return;

        createServerFromPreset(selectedPreset.id, selectedNode.id)
            .then(() => window.location.reload())
            .catch(error => clearAndAddHttpError({ key: 'admin:servers:create', error }));
    };

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} title="Select preset for server creation">
                <FlashMessageRender byKey={'admin:servers:create'} className={'mb-2'} />
                <div className={'grid lg:grid-cols-2 gap-4'}>
                    <Select onChange={presetSelect} value={selectedPreset?.id ?? ''}>
                        <option value="">Select a server preset...</option>
                        {presets?.items.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </Select>

                    <Select onChange={nodeSelect} value={selectedNode?.id ?? ''} className={'mt-2 lg:mt-0'}>
                        <option value="">Select a node for deploment...</option>
                        {nodes?.items.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </Select>
                </div>

                {selectedPreset && (
                    <div className="bg-black/50 rounded-lg p-4 mt-4 space-y-2">
                        <div className="font-bold">
                            Deploying using {selectedPreset.name} onto {selectedNode?.name ?? '...'}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-neutral-400">
                            <div>CPU: {selectedPreset.cpu}%</div>
                            <div>Memory: {selectedPreset.memory} MB</div>
                            <div>Disk: {selectedPreset.disk} MB</div>
                        </div>
                    </div>
                )}

                <p className={'text-gray-400 text-sm my-3'}>
                    Variables, allocations and deployment will all be calculated automatically. You can change this at
                    any time by heading to the server in the administrative menu and changing details there.
                </p>

                {!selectedPreset || !selectedNode ? (
                    <Alert type={'info'}>Select a valid node and server preset to continue.</Alert>
                ) : (
                    <div className="flex justify-end">
                        <Button onClick={submit}>
                            <SparklesIcon className="w-5 h-5 mr-2" /> Create
                        </Button>
                    </div>
                )}
            </Dialog>

            <Button
                onClick={() => setOpen(true)}
                type="button"
                size={Button.Sizes.Large}
                className="h-10 px-4 py-0 whitespace-nowrap"
            >
                <SparklesIcon className="w-5 h-5 mr-2" /> Create from Preset
            </Button>
        </>
    );
};
