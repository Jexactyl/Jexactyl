import { Form, Formik } from 'formik';
import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import type { ApplicationStore } from '@/state';
import { Dialog } from '@/elements/dialog';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { useState } from 'react';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { TextareaField } from '@/elements/Field';
import { createMessage } from '@/api/routes/admin/tickets/messages';
import { CreateTicketMessageValues as Values } from '@/api/routes/admin/tickets/types';

export default ({ ticketId }: { ticketId: number }) => {
    const [open, setOpen] = useState<boolean>(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!ticketId) return <></>;

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('ticket:message:create');

        createMessage({ ...values, ticket_id: ticketId })
            .then(() => {
                // @ts-expect-error quit your whining
                window.location = `/admin/tickets/${ticketId}`;
            })
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'ticket:message:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <>
            <Button.Info onClick={() => setOpen(true)}>New Message</Button.Info>
            <Formik onSubmit={submit} initialValues={{ ticket_id: ticketId, message: '' }} enableReinitialize>
                {({ isSubmitting, isValid, submitForm }) => (
                    <Form>
                        <SpinnerOverlay visible={isSubmitting} />
                        <Dialog title={'New message'} open={open} onClose={() => setOpen(false)}>
                            <FlashMessageRender byKey={'ticket:message:create'} />
                            <TextareaField id={'message'} name={'message'} className={'my-4'} rows={5} />
                            <div className={'text-right'}>
                                <Button type={'button'} onClick={submitForm} disabled={isSubmitting || !isValid}>
                                    Send
                                </Button>
                            </div>
                        </Dialog>
                    </Form>
                )}
            </Formik>
        </>
    );
};
