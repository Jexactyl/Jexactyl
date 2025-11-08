import React, { useState } from 'react';
import { Button } from '@/elements/button';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@/elements/dialog';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import useFlash from '@/plugins/useFlash';
import Switch from '@/elements/Switch';
import { Alert } from '@/elements/alert';
import { importBillingConfiguration } from '@/api/routes/admin/billing/config';

export default () => {
    const [open, setOpen] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [override, setOverride] = useState<boolean>(false);
    const [ignoreDuplicates, setIgnoreDuplicates] = useState<boolean>(true);

    const { clearAndAddHttpError, clearFlashes, addFlash } = useFlash();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUploadClick = () => {
        if (!file) {
            addFlash({ key: 'billing:config', type: 'warning', message: 'No JSON file was selected for upload.' });
            return;
        }

        clearFlashes();
        setLoading(true);

        const reader = new FileReader();

        reader.onload = async e => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);

                await importBillingConfiguration(jsonData, override, ignoreDuplicates)
                    .then(() => {
                        setLoading(false);
                        setOpen(false);
                        addFlash({ key: 'billing:config', type: 'success', message: 'Import completed successfully' });
                    })
                    .catch(error => {
                        setLoading(false);
                        setOpen(false);
                        clearAndAddHttpError({ key: 'billing:config', error });
                    });
            } catch (error) {
                setLoading(false);
                setOpen(false);
                clearAndAddHttpError({ key: 'billing:config', error });
            }
        };

        reader.readAsText(file);
    };

    return (
        <>
            <Dialog.Confirm
                onConfirmed={handleUploadClick}
                confirm={'Import Configuration'}
                open={open}
                onClose={() => setOpen(false)}
                title={'Choose JSON to import'}
            >
                <SpinnerOverlay visible={loading} />
                {override && (
                    <Alert type={'warning'}>
                        It is strongly recommended to export your current configuration before overriding it, as it
                        cannot be recovered.
                    </Alert>
                )}
                <input type="file" accept=".json" onChange={handleFileChange} className={'mt-4'} />
                <div className="bg-neutral-800 border border-neutral-900 shadow-inner p-4 rounded mt-4">
                    <Switch
                        onChange={() => setOverride(!override)}
                        name={'override'}
                        label={'Delete existing categories and products?'}
                        description={'This will completely erase your existing products for sale.'}
                    />
                </div>
                {!override && (
                    <div className="bg-neutral-800 border border-neutral-900 shadow-inner p-4 rounded mt-4">
                        <Switch
                            onChange={() => setIgnoreDuplicates(!ignoreDuplicates)}
                            name={'ignoreDuplicates'}
                            defaultChecked={ignoreDuplicates}
                            label={'Ignore duplicate values?'}
                            description={
                                'Setting this to true will mean that products/categories with identical names will be ignored.'
                            }
                        />
                    </div>
                )}
            </Dialog.Confirm>
            <Button onClick={() => setOpen(true)} className={'ml-2'}>
                <FontAwesomeIcon icon={faUpload} className={'mr-1'} /> Import
            </Button>
        </>
    );
};
