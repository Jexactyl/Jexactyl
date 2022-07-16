import { join } from 'path';
import tw from 'twin.macro';
import { object, string } from 'yup';
import useFlash from '@/plugins/useFlash';
import Code from '@/components/elements/Code';
import { ServerContext } from '@/state/server';
import Field from '@/components/elements/Field';
import Portal from '@/components/elements/Portal';
import React, { useEffect, useState } from 'react';
import { WithClassname } from '@/components/types';
import { Form, Formik, FormikHelpers } from 'formik';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import { FileObject } from '@/api/server/files/loadDirectory';
import createDirectory from '@/api/server/files/createDirectory';
import FlashMessageRender from '@/components/FlashMessageRender';

interface Values {
    directoryName: string;
}

const schema = object().shape({
    directoryName: string().required('必须提供有效的目录名称。'),
});

const generateDirectoryData = (name: string): FileObject => ({
    key: `dir_${name.split('/', 1)[0] ?? name}`,
    name: name.replace(/^(\/*)/, '').split('/', 1)[0] ?? name,
    mode: 'drwxr-xr-x',
    modeBits: '0755',
    size: 0,
    isFile: false,
    isSymlink: false,
    mimetype: '',
    createdAt: new Date(),
    modifiedAt: new Date(),
    isArchiveType: () => false,
    isEditable: () => false,
});

export default ({ className }: WithClassname) => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [visible, setVisible] = useState(false);

    const { mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);

    useEffect(() => {
        if (!visible) return;

        return () => {
            clearFlashes('files:directory-modal');
        };
    }, [visible]);

    const submit = ({ directoryName }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        createDirectory(uuid, directory, directoryName)
            .then(() => mutate((data) => [...data, generateDirectoryData(directoryName)], false))
            .then(() => setVisible(false))
            .catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ key: 'files:directory-modal', error });
            });
    };

    return (
        <>
            <Portal>
                <Formik onSubmit={submit} validationSchema={schema} initialValues={{ directoryName: '' }}>
                    {({ resetForm, submitForm, isSubmitting: _, values }) => (
                        <Dialog
                            title={'创建目录'}
                            open={visible}
                            onClose={() => {
                                setVisible(false);
                                resetForm();
                            }}
                        >
                            <FlashMessageRender key={'files:directory-modal'} />
                            <Form css={tw`m-0`}>
                                <Field autoFocus id={'directoryName'} name={'directoryName'} label={'目录名'} />
                                <p css={tw`mt-2 text-sm md:text-base break-all`}>
                                    <span css={tw`text-neutral-200`}>此目录将被创建于&nbsp;</span>
                                    <Code>
                                        /home/container/
                                        <span css={tw`text-cyan-200`}>
                                            {join(directory, values.directoryName).replace(/^(\.\.\/|\/)+/, '')}
                                        </span>
                                    </Code>
                                </p>
                            </Form>
                            <Dialog.Footer>
                                <Button.Text
                                    className={'w-full sm:w-auto'}
                                    onClick={() => {
                                        setVisible(false);
                                        resetForm();
                                    }}
                                >
                                    取消
                                </Button.Text>
                                <Button className={'w-full sm:w-auto'} onClick={submitForm}>
                                    创建
                                </Button>
                            </Dialog.Footer>
                        </Dialog>
                    )}
                </Formik>
            </Portal>
            <Button.Text onClick={() => setVisible(true)} className={className}>
                创建目录
            </Button.Text>
        </>
    );
};
