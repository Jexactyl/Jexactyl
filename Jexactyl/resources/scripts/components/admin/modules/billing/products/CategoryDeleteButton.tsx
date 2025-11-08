import { deleteCategory } from '@/api/routes/admin/billing/categories';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Input from '@/elements/Input';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import useFlash from '@/plugins/useFlash';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '@definitions/admin';

export default ({ category }: { category: Category }) => {
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();

    const doDeletion = () => {
        clearFlashes();

        if (name !== category.name) {
            addFlash({
                type: 'error',
                key: 'admin:billing:categories:delete',
                message: 'The category name does not match.',
            });

            return;
        }

        deleteCategory(category.id)
            .then(() => navigate('/admin/billing/categories'))
            .catch(error => clearAndAddHttpError({ key: 'admin:billing:categories:delete', error }));
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                onConfirmed={doDeletion}
                onClose={() => setOpen(false)}
                title={'Confirm category deletion'}
            >
                <FlashMessageRender byKey={'admin:billing:categories:delete'} className={'mb-2'} />
                Are you sure you want to delete this category? All products under this category will also be permenantly
                deleted. To confirm, please type the category name&nbsp;
                <span className={'p-1 bg-zinc-900 rounded font-mono text-sm mx-1'}>({category.name})</span>below:
                <Input onChange={e => setName(e.currentTarget.value)} className={'mt-2'} />
            </Dialog.Confirm>
            <Button.Danger type={'button'} onClick={() => setOpen(true)}>
                Delete Category & Products
            </Button.Danger>
        </>
    );
};
