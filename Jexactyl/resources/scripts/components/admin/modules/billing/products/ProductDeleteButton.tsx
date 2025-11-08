import { deleteProduct } from '@/api/routes/admin/billing/products';
import FlashMessageRender from '@/elements/FlashMessageRender';
import Input from '@/elements/Input';
import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import useFlash from '@/plugins/useFlash';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Product } from '@definitions/admin';

export default ({ product }: { product: Product }) => {
    const navigate = useNavigate();
    const params = useParams<'id'>();
    const [name, setName] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();

    const doDeletion = () => {
        clearFlashes();

        if (name !== product.name) {
            addFlash({
                type: 'error',
                key: 'admin:billing:products:delete',
                message: 'The product name does not match.',
            });

            return;
        }

        deleteProduct(Number(params.id), product.id)
            .then(() => navigate(`/admin/billing/categories/${params.id}`))
            .catch(error => clearAndAddHttpError({ key: 'admin:billing:products:delete', error }));
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                onConfirmed={doDeletion}
                onClose={() => setOpen(false)}
                title={'Confirm product deletion'}
            >
                <FlashMessageRender byKey={'admin:billing:products:delete'} className={'mb-2'} />
                Are you sure you want to delete this product? All products under this product will also be permenantly
                deleted. To confirm, please type the product name&nbsp;
                <span className={'p-1 bg-zinc-900 rounded font-mono text-sm mx-1'}>({product.name})</span>below:
                <Input onChange={e => setName(e.currentTarget.value)} className={'mt-2'} />
            </Dialog.Confirm>
            <Button.Danger className={'mr-4'} type={'button'} onClick={() => setOpen(true)}>
                <FontAwesomeIcon icon={faTrash} className={'mr-1'} /> Delete
            </Button.Danger>
        </>
    );
};
