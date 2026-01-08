import { ServerPresetValues } from '@/api/routes/admin/servers/types';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import { useTypedForm } from '@/plugins/useTypedForm';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, PencilAltIcon, PlusIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import NestEggSelect from '@admin/management/servers/presets/NestEggSelect';
import { createServerPreset, updateServerPreset } from '@/api/routes/admin/servers/presets';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { ServerPreset } from '@/api/definitions/admin';
import { useNavigate } from 'react-router-dom';

const pages = [
    { title: '(1/3) Create a description', description: 'Add a title and description to identify this preset.' },
    { title: '(2/3) Assign resource limits', description: 'Add a resource cap on specific hardware usage.' },
    { title: '(3/3) Choose a nest and egg (optional)', description: 'Assign a default nest/egg to this preset.' },
];

export interface NameSelectProps {
    form: ServerPresetValues;
    update: <K extends keyof ServerPresetValues>(key: K, value: ServerPresetValues[K]) => void;
}

const NameSelect = ({ form, update }: NameSelectProps) => (
    <div className="mb-8 space-y-2">
        <Input
            name={'name'}
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder={'Preset Name'}
        />
        <Input
            name="description"
            value={form.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Preset Description"
        />
    </div>
);

const ResourceSelect = ({ form, update }: NameSelectProps) => (
    <div className="mb-8 space-y-2">
        <div className={'grid lg:grid-cols-3 gap-4'}>
            <div>
                <Label>CPU Limit (%)</Label>
                <Input
                    name={'cpu'}
                    type={'number'}
                    value={form.cpu}
                    onChange={e => update('cpu', Number(e.target.value))}
                />
            </div>
            <div>
                <Label>Memory Limit (MiB)</Label>
                <Input
                    name={'memory'}
                    type={'number'}
                    value={form.memory}
                    onChange={e => update('memory', Number(e.target.value))}
                />
            </div>
            <div>
                <Label>Disk Limit (MiB)</Label>
                <Input
                    name={'disk'}
                    type={'number'}
                    value={form.disk}
                    onChange={e => update('disk', Number(e.target.value))}
                />
            </div>
        </div>
    </div>
);

export default function ServerPresetDialog({ preset }: { preset?: ServerPreset }) {
    const [page, setPage] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const { form, update } = useTypedForm<ServerPresetValues>({
        name: preset?.name ?? '',
        description: preset?.description ?? '',

        cpu: preset?.cpu ?? 0,
        memory: preset?.memory ?? 0,
        disk: preset?.disk ?? 0,

        nest_id: preset?.nest_id ?? null,
        egg_id: preset?.egg_id ?? null,
    });

    useEffect(() => {
        if (!open) {
            setPage(0);
        }
    }, [open]);

    const submit = () => {
        setLoading(true);

        if (preset) {
            updateServerPreset(preset.id, form)
                .then(() => {
                    setPage(0);
                    setOpen(false);

                    navigate('/admin/servers/presets');
                })
                .finally(() => setLoading(false));
        } else {
            createServerPreset(form)
                .then(preset => {
                    setPage(0);
                    setOpen(false);

                    navigate(`/admin/servers/presets/${preset.id}`);
                })
                .finally(() => setLoading(false));
        }
    };

    return (
        <>
            <Dialog
                open={open}
                title={pages[page]!.title}
                onClose={() => setOpen(false)}
                description={pages[page]!.description}
            >
                <SpinnerOverlay visible={loading} />

                {page === 0 && <NameSelect form={form} update={update} />}
                {page === 1 && <ResourceSelect form={form} update={update} />}
                {page === 2 && <NestEggSelect form={form} update={update} />}

                <div className="absolute right-0 bottom-0 m-4 flex gap-2">
                    {page > 0 && (
                        <Button.Text
                            size={Button.Sizes.Small}
                            shape={Button.Shapes.IconSquare}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </Button.Text>
                    )}
                    {page < pages.length - 1 && (
                        <Button.Text
                            size={Button.Sizes.Small}
                            shape={Button.Shapes.IconSquare}
                            onClick={() => setPage(page + 1)}
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </Button.Text>
                    )}
                    {page === 2 && (
                        <Button.Success size={Button.Sizes.Small} onClick={submit}>
                            <CheckCircleIcon className="w-4 h-4 mr-1" /> Finish
                        </Button.Success>
                    )}
                </div>
            </Dialog>

            <Button
                type="button"
                size={Button.Sizes.Large}
                onClick={() => setOpen(true)}
                className="h-10 px-4 py-0 whitespace-nowrap"
            >
                {preset ? (
                    <>
                        <PencilAltIcon className={'w-5 h-5 mr-1'} /> Update
                    </>
                ) : (
                    <>
                        <PlusIcon className={'w-5 h-5 mr-1'} /> Create
                    </>
                )}
            </Button>
        </>
    );
}
