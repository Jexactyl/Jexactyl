import { useState } from 'react';
import { CustomLink } from '@/api/routes/admin/links';
import AdminContentBlock from '@/elements/AdminContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Button } from '@/elements/button';
import CreateLinkDialog from './CreateLinkDialog';
import DeleteLinkDialog from './DeleteLinkDialog';
import LinksTable from './LinksTable';

export type VisibleDialog = 'none' | 'create' | 'update' | 'delete';

export default () => {
    const [link, setLink] = useState<CustomLink | null>(null);
    const [open, setOpen] = useState<VisibleDialog>('none');

    return (
        <AdminContentBlock title={'Custom Links'}>
            {open === 'create' && <CreateLinkDialog setOpen={setOpen} />}
            {open === 'update' && link && <CreateLinkDialog link={link} setOpen={setOpen} />}
            {open === 'delete' && <DeleteLinkDialog id={link?.id} setOpen={setOpen} />}
            <FlashMessageRender byKey={'admin:links'} className={'mb-4'} />
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Custom Links</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        Create custom links to external sites for clients.
                    </p>
                </div>
                <div className={'flex ml-auto pl-4'}>
                    <Button onClick={() => setOpen('create')}>New Link</Button>
                </div>
            </div>
            <LinksTable setLink={setLink} setOpen={setOpen} />
        </AdminContentBlock>
    );
};
