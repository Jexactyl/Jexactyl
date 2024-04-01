import { Field, Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button';
import Input, { Textarea } from '@/components/elements/Input';
import styled from 'styled-components';
import { useFlashKey } from '@/plugins/useFlash';
import { createTicket, useTickets } from '@/api/account/tickets';
import FlashMessageRender from '@/components/FlashMessageRender';

interface Values {
    title: string;
    message: string;
}

const CustomTextarea = styled(Textarea)`
    ${tw`h-32`}
`;

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account:tickets');
    const { mutate } = useTickets();

    const submit = (values: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
        clearAndAddHttpError();

        createTicket(values.title, values.message)
            .then(ticket => {
                resetForm();
                mutate(data => (data || []).concat(ticket));
            })
            .catch(error => clearAndAddHttpError(error))
            .then(() => setSubmitting(false));
    };

    return (
        <>
            <Formik
                onSubmit={submit}
                initialValues={{ title: '', message: '' }}
                validationSchema={object().shape({
                    title: string().required(),
                    message: string().required().min(3).max(300),
                })}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <FlashMessageRender byKey={'account:tickets'} className={'mb-4'} />
                        <SpinnerOverlay visible={isSubmitting} />
                        <FormikFieldWrapper
                            name={'title'}
                            css={tw`mb-6`}
                            label={'Ticket Name'}
                            description={'Enter a user-friendly name for this ticket.'}
                        >
                            <Field name={'title'} as={Input} />
                        </FormikFieldWrapper>
                        <FormikFieldWrapper
                            label={'Message'}
                            name={'message'}
                            description={'Enter a message for this ticket.'}
                        >
                            <Field name={'message'} as={CustomTextarea} />
                        </FormikFieldWrapper>
                        <div css={tw`flex justify-end mt-6`}>
                            <Button>Save</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
};
