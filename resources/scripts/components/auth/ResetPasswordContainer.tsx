import tw from 'twin.macro';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { object, ref, string } from 'yup';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Formik, FormikHelpers } from 'formik';
import Field from '@/components/elements/Field';
import Input from '@/components/elements/Input';
import { RouteComponentProps } from 'react-router';
import { Actions, useStoreActions } from 'easy-peasy';
import { Button } from '@/components/elements/button/index';
import performPasswordReset from '@/api/auth/performPasswordReset';
import LoginFormContainer from '@/components/auth/LoginFormContainer';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const [email, setEmail] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = new URLSearchParams(location.search);
    if (email.length === 0 && parsed.get('email')) {
        setEmail(parsed.get('email') || '');
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: '错误', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string()
                    .required('需要新密码。')
                    .min(8, '您的新密码长度应至少为 8 个字符。'),
                passwordConfirmation: string()
                    .required('您的新密码不匹配。')
                    // @ts-expect-error this is valid
                    .oneOf([ref('password'), null], '您的新密码不匹配。'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer title={'重置密码'} css={tw`w-full flex`}>
                    <div>
                        <label>邮箱</label>
                        <Input value={email} isLight disabled />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field
                            light
                            label={'新密码'}
                            name={'password'}
                            type={'password'}
                            description={'密码长度必须至少为 8 个字符。'}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Field light label={'确认新密码'} name={'passwordConfirmation'} type={'password'} />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button size={Button.Sizes.Large} css={tw`w-full`} type={'submit'} disabled={isSubmitting}>
                            重置密码
                        </Button>
                    </div>
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/login'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            返回登录
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
