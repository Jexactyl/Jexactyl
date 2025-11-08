import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { object, string } from 'yup';

import { login, externalLogin } from '@/api/routes/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import Field from '@/elements/Field';
import { Button } from '@/elements/button';
import useFlash from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGoogle } from '@fortawesome/free-brands-svg-icons';
import Label from '@/elements/Label';
import { faAt, faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';

interface Values {
    username: string;
    password: string;
}

function LoginContainer() {
    const ref = useRef<Reaptcha>(null);
    const token = useRef('');

    const appName = useStoreState(state => state.settings.data!.name);
    const modules = useStoreState(state => state.everest.data!.auth.modules);
    const registration = useStoreState(state => state.everest.data!.auth.registration.enabled);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState(state => state.settings.data!.recaptcha);

    const navigate = useNavigate();

    useEffect(() => {
        clearFlashes();
    }, []);

    const useOauth = (name: string) => {
        externalLogin(name)
            .then(url => {
                // @ts-expect-error this is fine
                window.location = url;
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:register', error }));
    };

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token.current) {
            ref.current!.execute().catch(error => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token.current })
            .then(response => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                navigate('/auth/login/checkpoint', { state: { token: response.confirmationToken } });
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
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={`Welcome to ${appName}`}>
                    <Field
                        icon={faAt}
                        type={'text'}
                        label={'Username or Email'}
                        name={'username'}
                        disabled={isSubmitting}
                        placeholder={'user@jexpanel.com'}
                    />
                    <div css={tw`mt-6`}>
                        <Label>
                            Password
                            <Link
                                to={'/auth/password'}
                                tabIndex={-1}
                                className={'ml-1 text-green-400 hover:text-green-200 duration-300 text-xs'}
                            >
                                Forgot Password?
                            </Link>
                        </Label>
                        <Field
                            icon={faKey}
                            type={'password'}
                            name={'password'}
                            disabled={isSubmitting}
                            placeholder={'••••••••••••'}
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
                            Login
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
                    {(modules.discord.enabled || modules.google.enabled || registration) && (
                        <div className={'w-full text-center my-3 text-gray-400'}>OR</div>
                    )}
                    <div className={'mt-4 w-full grid gap-4 grid-cols-2'}>
                        {modules.discord.enabled && (
                            <Button.Info type={'button'} onClick={() => useOauth('discord')} size={Button.Sizes.Small}>
                                <FontAwesomeIcon icon={faDiscord} className={'mr-2 my-auto'} /> Use Discord SSO
                            </Button.Info>
                        )}
                        {modules.google.enabled && (
                            <Button.Text type={'button'} onClick={() => useOauth('google')} size={Button.Sizes.Small}>
                                <FontAwesomeIcon icon={faGoogle} className={'mr-2 my-auto'} /> Use Google SSO
                            </Button.Text>
                        )}
                        {registration && (
                            <Button.Text
                                type={'button'}
                                onClick={() => navigate('/auth/register')}
                                size={Button.Sizes.Small}
                            >
                                <FontAwesomeIcon icon={faEnvelope} className={'mr-2 my-auto'} /> Register with Email
                            </Button.Text>
                        )}
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
}

export default LoginContainer;
