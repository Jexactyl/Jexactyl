import { Button } from '@/components/elements/button';
import Dialog from '@/components/elements/dialog/Dialog';
import { useState } from 'react';

export default () => {
    const [open, setOpen] = useState<boolean>(false);
    //

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} preventExternalClose title={'Add a Product Category'}>
                <p className={'text-gray-400'}>Add a new product category to your panel.</p>
            </Dialog>
            <Button onClick={() => setOpen(true)}>Add Category</Button>
        </>
    );
};
