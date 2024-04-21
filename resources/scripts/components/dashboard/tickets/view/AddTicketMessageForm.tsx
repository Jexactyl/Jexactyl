import { Field, Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import FormikFieldWrapper from '@elements/FormikFieldWrapper';
import SpinnerOverlay from '@elements/SpinnerOverlay';
import tw from 'twin.macro';
import { Button } from '@elements/button';
import { Textarea } from '@elements/Input';
import styled from 'styled-components';
import { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import { createMessage } from '@/api/account/tickets';
import DeleteTicketDialog from './DeleteTicketDialog';

interface Values {
    message: string;
}

const CustomTextarea = styled(Textarea)`
    ${tw`h-32`}
`;

export default ({ ticketId }: { ticketId: number }) => {
    const { clearAndAddHttpError } = useFlashKey('account:tickets:view');

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearAndAddHttpError();

        createMessage(ticketId, values.message)
            .then(() => {
                window.location.reload();
            })
            .catch(error => clearAndAddHttpError(error))
            .then(() => setSubmitting(false));
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ message: '' }}
                validationSchema={object().shape({
                    message: string().required().min(3).max(300),
                })}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FlashMessageRender byKey={'account:tickets:view'} className={'mb-4'} />
                        <SpinnerOverlay visible={isSubmitting} />
                        <FormikFieldWrapper
                            label={'Message Content'}
                            name={'message'}
                            description={'Enter a message for this ticket.'}
                        >
                            <Field name={'message'} as={CustomTextarea} />
                        </FormikFieldWrapper>
                        <div css={tw`flex justify-end mt-6`}>
                            <DeleteTicketDialog />
                            <Button>Add to Ticket</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
};
