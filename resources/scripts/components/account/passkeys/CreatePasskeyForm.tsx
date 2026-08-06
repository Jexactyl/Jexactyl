import { Field, Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';

import FormikFieldWrapper from '@/elements/FormikFieldWrapper';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import { Button } from '@/elements/button';
import Input from '@/elements/Input';
import { useFlashKey } from '@/plugins/useFlash';
import { createPasskey, usePasskeys } from '@/api/routes/account/passkeys';
import { passkeysSupported, isPasskeyCancellation } from '@/api/routes/auth/passkey';

interface Values {
    name: string;
    password: string;
}

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const { mutate } = usePasskeys();

    // Accounts created through an SSO module have no password to confirm against.
    const hasPassword = useStoreState(state => state.user.data!.hasPassword);

    const submit = (values: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
        clearAndAddHttpError();

        createPasskey(values.name, hasPassword ? values.password : undefined)
            .then(passkey => {
                resetForm();
                mutate(data => (data || []).concat(passkey));
            })
            .catch(error => {
                if (!isPasskeyCancellation(error)) clearAndAddHttpError(error);
            })
            .then(() => setSubmitting(false));
    };

    if (!passkeysSupported()) {
        return (
            <p css={tw`text-sm`}>
                This browser cannot use passkeys. Passkeys require a secure connection and a recent browser.
            </p>
        );
    }

    return (
        <Formik
            onSubmit={submit}
            initialValues={{ name: '', password: '' }}
            validationSchema={object().shape({
                name: string().required('Give this passkey a name so you can recognise it later.'),
                password: hasPassword ? string().required('Please enter your account password.') : string(),
            })}
        >
            {({ isSubmitting }) => (
                <Form>
                    <SpinnerOverlay visible={isSubmitting} />
                    <FormikFieldWrapper
                        label={'Passkey Name'}
                        name={'name'}
                        description={'Something that identifies the device, such as "Work Laptop".'}
                        css={tw`mb-6`}
                    >
                        <Field name={'name'} as={Input} />
                    </FormikFieldWrapper>
                    {hasPassword && (
                        <FormikFieldWrapper label={'Current Password'} name={'password'}>
                            <Field name={'password'} type={'password'} as={Input} />
                        </FormikFieldWrapper>
                    )}
                    <p css={tw`text-xs text-gray-400 mt-6`}>
                        Your device will ask you to confirm with a fingerprint, face, PIN, or security key. Once added,
                        you can sign in with it in a single step — no password or two-step code needed.
                    </p>
                    <div css={tw`flex justify-end mt-6`}>
                        <Button type={'submit'}>Add Passkey</Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};
