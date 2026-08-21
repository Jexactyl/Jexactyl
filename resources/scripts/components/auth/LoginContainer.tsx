import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { object, string } from 'yup';

import { login, externalLogin } from '@/api/routes/auth/login';
import { passkeyLogin, passkeysSupported, isPasskeyCancellation } from '@/api/routes/auth/passkey';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import Field from '@/elements/Field';
import { Button } from '@/elements/button';
import useFlash from '@/plugins/useFlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGoogle } from '@fortawesome/free-brands-svg-icons';
import Label from '@/elements/Label';
import { faAt, faEnvelope, faFingerprint, faKey } from '@fortawesome/free-solid-svg-icons';

interface Values {
    username: string;
    password: string;
}

function LoginContainer() {
    const ref = useRef<Reaptcha>(null);
    const token = useRef('');
    const pendingAction = useRef<string>('login');

    const [passkeyPending, setPasskeyPending] = useState(false);

    const appName = useStoreState(state => state.settings.data!.name);
    const modules = useStoreState(state => state.everest.data!.auth.modules);
    const registration = useStoreState(state => state.everest.data!.auth.registration.enabled);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState(state => state.settings.data!.recaptcha);

    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from;

    useEffect(() => {
        clearFlashes();
    }, []);

    const useOauth = (name: string) => {
        if (recaptchaEnabled && !token.current) {
            pendingAction.current = name;
            ref.current!.execute().catch(error => {
                console.error(error);

                clearAndAddHttpError({ error });
            });

            return;
        }

        externalLogin(name, token.current)
            .then(url => {
                // @ts-expect-error this is fine
                window.location = url;
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:register', error }));
    };

    const usePasskey = () => {
        if (passkeyPending) return;

        clearFlashes();
        setPasskeyPending(true);

        passkeyLogin()
            .then(response => {
                // @ts-expect-error this is valid
                window.location = from || response.intended || '/';
            })
            .catch(error => {
                setPasskeyPending(false);

                // Dismissing the OS prompt is not a failure worth shouting about.
                if (isPasskeyCancellation(error)) return;

                console.error(error);
                clearAndAddHttpError({ error });
            });
    };

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token.current) {
            pendingAction.current = 'login';
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
                    window.location = from || response.intended || '/';
                    return;
                }

                navigate('/auth/login/checkpoint', { state: { token: response.confirmationToken, from } });
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
                    {passkeysSupported() && (
                        <div css={tw`mt-3`}>
                            {/* `loading` is what disables this button — Button overrides any
                                explicit `disabled` prop with it. */}
                            <Button.Text
                                type={'button'}
                                onClick={usePasskey}
                                loading={passkeyPending}
                                className={'w-full'}
                            >
                                <FontAwesomeIcon icon={faFingerprint} className={'mr-2 my-auto'} /> Or, Sign in with a
                                Passkey
                            </Button.Text>
                        </div>
                    )}
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={response => {
                                token.current = response;
                                if (pendingAction.current === 'login') {
                                    submitForm();
                                } else {
                                    externalLogin(pendingAction.current, token.current)
                                        .then(url => {
                                            // @ts-expect-error this is fine
                                            window.location = url;
                                        })
                                        .catch(error => clearAndAddHttpError({ key: 'auth:register', error }));
                                }

                                pendingAction.current = 'login';
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                pendingAction.current = 'login';
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
