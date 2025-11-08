import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import FormikFieldWrapper from '@/elements/FormikFieldWrapper';
import { Textarea } from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { PencilAltIcon } from '@heroicons/react/outline';
import { Field as FormikField, Form, useFormikContext, FormikHelpers, Formik } from 'formik';
import { useState } from 'react';
import tw from 'twin.macro';
import Field from '@/elements/Field';
import { ServerContext } from '@/state/server';
import { ApplicationStore } from '@/state';
import { useStoreActions } from '@/state/hooks';
import { Actions } from 'easy-peasy';
import { renameServer } from '@/api/routes/server';
import { httpErrorToHuman } from '@/api/http';
import { object, string } from 'yup';
import Can from '@/elements/Can';
import ReinstallServerDialog from './ReinstallServerDialog';

interface Values {
    name: string;
    description: string;
}

const RenameServerForm = () => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0`}>
                <Field id={'name'} name={'name'} label={'Server Name'} type={'text'} />
                <div css={tw`mt-6`}>
                    <Label>Server Description</Label>
                    <FormikFieldWrapper name={'description'}>
                        <FormikField as={Textarea} name={'description'} rows={3} />
                    </FormikFieldWrapper>
                </div>
                <div css={tw`mt-6 flex items-center justify-between`}>
                    <ReinstallServerDialog />
                    <Button type={'submit'}>Save</Button>
                </div>
            </Form>
        </>
    );
};

export default () => {
    const [open, setOpen] = useState<boolean>(false);
    const server = ServerContext.useStoreState(state => state.server.data!);
    const setServer = ServerContext.useStoreActions(actions => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('settings');
        renameServer(server.uuid, name, description)
            .then(() => setServer({ ...server, name, description }))
            .catch(error => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <>
            <Dialog open={open} onClose={() => setOpen(false)} title={'Edit Server Details'}>
                <Can action={'settings.rename'}>
                    <Formik
                        onSubmit={submit}
                        initialValues={{
                            name: server.name,
                            description: server.description ?? '',
                        }}
                        validationSchema={object().shape({
                            name: string().required().min(1),
                            description: string().nullable(),
                        })}
                    >
                        <RenameServerForm />
                    </Formik>
                </Can>
            </Dialog>
            <PencilAltIcon
                className={'text-white/50 hover:text-gray-200 transition duration-300 w-4'}
                onClick={() => setOpen(true)}
            />
        </>
    );
};
