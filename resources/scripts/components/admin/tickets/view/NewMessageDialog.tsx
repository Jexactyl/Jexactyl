import { Form, Formik } from 'formik';
import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { useNavigate } from 'react-router-dom';
import type { ApplicationStore } from '@/state';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useTicketFromRoute } from '@/api/admin/tickets/getTicket';
import createMessage from '@/api/admin/tickets/messages/createMessage';
import type { Values } from '@/api/admin/tickets/messages/createMessage';
import { useState } from 'react';
import { Button } from '@/components/elements/button';
import FlashMessageRender from '@/components/FlashMessageRender';
import { TextareaField } from '@/components/elements/Field';

const initialValues: Values = {
    message: '',
};

export default () => {
    const navigate = useNavigate();
    const { data: ticket } = useTicketFromRoute();
    const [open, setOpen] = useState<boolean>(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!ticket) return <></>;

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        console.log('submitting');
        clearFlashes('ticket:message:create');

        createMessage(ticket.id, values)
            .then(() => navigate(`/admin/tickets/${ticket.id}`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'ticket:message:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <>
            <Button.Info onClick={() => setOpen(true)}>New Message</Button.Info>
            <Formik onSubmit={submit} initialValues={initialValues}>
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
