import { Dialog } from '@/elements/dialog';
import { createLink, CustomLink, updateLink, Values } from '@/api/routes/admin/links';
import { VisibleDialog } from './LinksContainer';
import Label from '@/elements/Label';
import InputField from '@/elements/inputs/InputField';
import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import Switch from '@/elements/Switch';
import { mutate } from 'swr';

export default ({ link, setOpen }: { link?: CustomLink; setOpen: Dispatch<SetStateAction<VisibleDialog>> }) => {
    const [values, setValues] = useState<Values>({
        name: link?.name ?? '',
        url: link?.url ?? '',
        visible: link?.visible ?? false,
    });

    const onSubmit = () => {
        if (link) {
            updateLink(link.id, values).then(() => {
                setOpen('none');
                mutate(['links']);
            });
        } else {
            createLink(values).then(() => {
                setOpen('none');
                mutate(['links'], true);
            });
        }
    };

    const updateValues = (e: FormEvent<HTMLInputElement>) => {
        setValues(prev => ({ ...prev, [e.currentTarget?.name]: e.currentTarget?.value } as Values));
    };

    return (
        <Dialog.Confirm
            confirm={'Create'}
            onConfirmed={onSubmit}
            open
            onClose={() => setOpen('none')}
            title={'Create new link'}
        >
            <div className={'mt-4'}>
                <Label>Link Name</Label>
                <InputField defaultValue={values.name} name={'name'} onChange={updateValues}></InputField>
                <p className={'text-gray-400 text-sm mt-1'}>Give the link a friendly name which clients can read.</p>
            </div>
            <div className={'mt-2'}>
                <Label>Link URL</Label>
                <InputField defaultValue={values.url} name={'url'} onChange={updateValues}></InputField>
                <p className={'text-gray-400 text-sm mt-1'}>
                    This is the URL which the link points to outside of the Panel.
                </p>
            </div>
            <div className={'xl:col-span-2 bg-black/50 border border-black shadow-inner p-4 rounded mt-4'}>
                <Switch
                    name={'visible'}
                    defaultChecked={values.visible}
                    onChange={() => {
                        setValues(prev => ({ ...prev, visible: !values.visible }));
                    }}
                    label={'Link Visibility'}
                    description={
                        "Toggle this setting to 'on' if you want to allow users to view and use this link. You can change this setting to 'off' at any time."
                    }
                />
            </div>
        </Dialog.Confirm>
    );
};
