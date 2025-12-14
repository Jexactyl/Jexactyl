import tw from 'twin.macro';
import Reaptcha from 'reaptcha';
import login from '@/api/auth/login';
import { object, string } from 'yup';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/elements/button/index';
import { Link, RouteComponentProps } from 'react-router-dom';
import LoginFormContainer from '@/components/auth/LoginFormContainer';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const name = useStoreState((state) => state.settings.data?.name);
    const email = useStoreState((state) => state.settings.data?.registration.email);
    const discord = useStoreState((state) => state.settings.data?.registration.discord);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const recaptchaEnabled = useStoreState((state) => state.settings.data?.recaptcha?.enabled || false);
    const siteKey = useStoreState((state) => state.settings.data?.recaptcha?.siteKey || '');

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });

            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }

                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
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
                <LoginFormContainer title={'Login to ' + name} css={tw`w-full flex`}>
                    <Field light type={'text'} label={'Username or Email'} name={'username'} disabled={isSubmitting} />
                    <div css={tw`mt-6`}>
                        <Field light type={'password'} label={'Password'} name={'password'} disabled={isSubmitting} />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} size={Button.Sizes.Large} css={tw`w-full`} disabled={isSubmitting}>
                            Login
                        </Button>
                    </div>
                    {discord && (
                        <div css={tw`mt-4`}>
                            <div css={tw`relative`}>
                                <div css={tw`absolute inset-0 flex items-center`}>
                                    <div css={tw`w-full border-t border-neutral-700`}></div>
                                </div>
                                <div css={tw`relative flex justify-center text-sm`}>
                                    <span css={tw`px-2 bg-neutral-800 text-neutral-500`}>Or continue with</span>
                                </div>
                            </div>
                            <div css={tw`mt-4`}>
                                <Link to={'/auth/discord'}>
                                    <Button.Text
                                        type={'button'}
                                        size={Button.Sizes.Large}
                                        css={tw`w-full bg-[#5865F2] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4]`}
                                    >
                                        <svg css={tw`w-5 h-5 mr-2`} fill='currentColor' viewBox='0 0 24 24'>
                                            <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' />
                                        </svg>
                                        Login with Discord
                                    </Button.Text>
                                </Link>
                            </div>
                        </div>
                    )}
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/password'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Forgot password?
                        </Link>
                    </div>
                    {(email || discord) && (
                        <div css={tw`mt-6 text-center`}>
                            {email && (
                                <Link
                                    to={'/auth/register'}
                                    css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                                >
                                    Signup with Email
                                </Link>
                            )}
                            {discord && (
                                <Link
                                    to={'/auth/discord'}
                                    css={tw`text-xs ml-6 text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                                >
                                    Authenticate with Discord
                                </Link>
                            )}
                        </div>
                    )}
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
