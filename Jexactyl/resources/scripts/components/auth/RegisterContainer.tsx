import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { object, string } from 'yup';

import LoginFormContainer from '@/components/auth/LoginFormContainer';
import Field from '@/elements/Field';
import { Button } from '@/elements/button';
import useFlash from '@/plugins/useFlash';
import register from '@/api/routes/auth/register';
import { login } from '@/api/routes/auth/login';
import { faAt, faIdBadge, faKey, faUnlockKeyhole } from '@fortawesome/free-solid-svg-icons';

interface Values {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
}

function RegisterContainer() {
    const ref = useRef<Reaptcha>(null);
    const token = useRef('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState(state => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch(error => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        register({ ...values, recaptchaData: token.current })
            .then(() => {
                login({ ...values, recaptchaData: token.current }).then(() => {
                    // @ts-expect-error this is valid
                    window.location = '/';
                });
            })
            .catch(error => {
                console.error(error);

                token.current = '';
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', email: '', password: '', confirm_password: '' }}
            validationSchema={object().shape({
                username: string().required('A username must be provided.'),
                email: string().email().required('You must provide a valid email.'),
                password: string().required('Please enter your account password.'),
                confirm_password: string().required('Please enter the password confirmation.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={`Create an Account`}>
                    <Field
                        type={'text'}
                        label={'Username'}
                        icon={faIdBadge}
                        name={'username'}
                        placeholder={'user_account'}
                        disabled={isSubmitting}
                    />
                    <div css={tw`mt-6`}>
                        <Field
                            type={'text'}
                            label={'Email Address'}
                            icon={faAt}
                            name={'email'}
                            placeholder={'user@jexpanel.com'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            type={'password'}
                            label={'Password'}
                            icon={faKey}
                            name={'password'}
                            placeholder={'••••••••••••'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            type={'password'}
                            label={'Confirm Password'}
                            icon={faUnlockKeyhole}
                            name={'confirm_password'}
                            placeholder={'••••••••••••'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button
                            type={'submit'}
                            loading={isSubmitting}
                            className={'w-full'}
                            size={Button.Sizes.Large}
                            disabled={isSubmitting}
                        >
                            Register
                        </Button>
                    </div>
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={response => {
                                token.current = response;
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                token.current = '';
                            }}
                        />
                    )}
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-300 tracking-wide no-underline uppercase font-medium hover:text-neutral-600`}
                        >
                            Return to Login
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
}

export default RegisterContainer;
