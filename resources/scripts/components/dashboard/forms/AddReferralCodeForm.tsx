import React from 'react';
import * as Yup from 'yup';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import Field from '@/components/elements/Field';
import { Form, Formik, FormikHelpers } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import { Button } from '@/components/elements/button/index';
import useReferralCode from '@/api/account/useReferralCode';
import { useStoreState } from '@/state/hooks';

interface Values {
    code: string;
    password: string;
}

const schema = Yup.object().shape({
    code: Yup.string().length(16).required(),
    password: Yup.string().required('您必须提供您当前的帐户密码。'),
});

export default () => {
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const alreadyReferred = useStoreState((state) => state.user.data!.referralCode);

    const submit = (values: Values, { resetForm, setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('account:email');

        useReferralCode({ ...values })
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/account';
            })
            .then(() =>
                addFlash({
                    type: 'success',
                    key: 'account:referral',
                    message: '您现在正在使用推广码。',
                })
            )
            .catch((error) =>
                addFlash({
                    type: 'error',
                    key: 'account:referral',
                    title: '错误',
                    message: httpErrorToHuman(error),
                })
            )
            .then(() => {
                resetForm();
                setSubmitting(false);
            });
    };

    return (
        <>
            {alreadyReferred ? (
                <>
                    <p className={'my-2 text-gray-400'}>
                        您已经使用过推广码。
                        {' ('}
                        <span className={'text-gray-200 text-white bg-gray-800 rounded-xl w-fit px-2 text-center'}>
                            {alreadyReferred}
                        </span>
                        {') '}
                    </p>
                </>
            ) : (
                <Formik onSubmit={submit} initialValues={{ code: '', password: '' }} validationSchema={schema}>
                    {({ isSubmitting, isValid }) => (
                        <React.Fragment>
                            <Form className={'m-0'}>
                                <Field id={'code'} type={'text'} name={'code'} label={'输入推广码'} />
                                <div className={'mt-6'}>
                                    <Field
                                        id={'confirm_password'}
                                        type={'password'}
                                        name={'password'}
                                        label={'确认密码'}
                                    />
                                </div>
                                <div className={'mt-6'}>
                                    <Button disabled={isSubmitting || !isValid}>使用推广码</Button>
                                </div>
                            </Form>
                        </React.Fragment>
                    )}
                </Formik>
            )}
        </>
    );
};
