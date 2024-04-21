import { useStoreState } from 'easy-peasy';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { object, string } from 'yup';

import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import Field from '@elements/Field';
import { Button } from '@elements/button';
import useFlash from '@/plugins/useFlash';
import useOauthLogin from '@/api/auth/useOauthLogin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGoogle } from '@fortawesome/free-brands-svg-icons';
import Label from '../elements/Label';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../elements/tooltip/Tooltip';

interface Values {
    username: string;
    password: string;
}

function LoginContainer() {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

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
        useOauthLogin(name)
            .then(url => {
                console.log(url);
                // @ts-expect-error this is fine
                window.location = url;
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:register', error }));
    };

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

        login({ ...values, recaptchaData: token })
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

                setToken('');
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
                    <Field type={'text'} label={'Username or Email'} name={'username'} disabled={isSubmitting} />
                    <div css={tw`mt-6`}>
                        <Label>
                            Password
                            <Link
                                to={'/auth/password'}
                                className={'ml-1 text-green-400 hover:text-green-200 duration-300 text-xs'}
                            >
                                Forgot Password?
                            </Link>
                        </Label>
                        <Field type={'password'} name={'password'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} className={'w-full'} size={Button.Sizes.Large} disabled={isSubmitting}>
                            Login
                        </Button>
                    </div>
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={response => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}
                    <p className={'text-xs text-gray-300 uppercase font-medium text-center my-3'}>
                        Or, authenticate with
                    </p>
                    <div className={'w-full flex flex-wrap gap-4 grid-cols-6 justify-center items-center'}>
                        {modules.discord.enabled && (
                            <Tooltip content={'Register and login with Discord'}>
                                <Button.Info onClick={() => useOauth('discord')} className={'w-12 h-12'}>
                                    <FontAwesomeIcon icon={faDiscord} />
                                </Button.Info>
                            </Tooltip>
                        )}
                        {modules.google.enabled && (
                            <Tooltip content={'Register and login with Google'}>
                                <Button.Info onClick={() => useOauth('google')} className={'w-12 h-12'}>
                                    <FontAwesomeIcon icon={faGoogle} />
                                </Button.Info>
                            </Tooltip>
                        )}
                        {registration && (
                            <Tooltip content={'Register with your email address'}>
                                <Button.Text onClick={() => navigate('/auth/register')} className={'w-12 h-12'}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </Button.Text>
                            </Tooltip>
                        )}
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
}

export default LoginContainer;
