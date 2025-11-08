import { Field, Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import FormikFieldWrapper from '@/elements/FormikFieldWrapper';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import tw from 'twin.macro';
import { Button } from '@/elements/button';
import Input, { Textarea } from '@/elements/Input';
import styled from 'styled-components';
import { useFlashKey } from '@/plugins/useFlash';
import { createTicket } from '@/api/routes/account/tickets';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { useNavigate } from 'react-router-dom';

interface Values {
    title: string;
    message: string;
}

const CustomTextarea = styled(Textarea)`
    ${tw`h-32`}
`;

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account:tickets');
    const navigate = useNavigate();

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearAndAddHttpError();

        createTicket(values.title, values.message)
            .then(ticket => {
                navigate(`/account/tickets/${ticket.id}`);
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
