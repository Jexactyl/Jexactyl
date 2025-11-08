import { Form, Formik } from 'formik';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import Field from '@/elements/Field';
import { Dialog } from '@/elements/dialog';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '../../elements/FlashMessageRender';
import { setupAccount } from '@/api/routes/account';
import { Alert } from '@/elements/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const appName = useStoreState(state => state.settings.data!.name);
    const force2fa = useStoreState(state => state.everest.data!.auth.security.force2fa);
    const content = useStoreState(state => state.everest.data!.auth.modules.onboarding.content);

    const submit = (values: { username: string; password: string }) => {
        clearFlashes();

        setupAccount(values)
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/auth/login';
            })
            .catch(error => clearAndAddHttpError({ key: 'onboarding', error }));
    };

    return (
        <Dialog
            open={true}
            hideCloseIcon
            preventExternalClose
            onClose={() => undefined}
            title={`👋 Welcome to ${appName.toString()}!`}
        >
            <FlashMessageRender byKey={'onboarding'} className={'my-3'} />
            <Formik onSubmit={submit} initialValues={{ username: '', password: '' }}>
                <Form>
                    <p className={'mt-2'}>We are missing some details - please enter them now.</p>
                    <p className={'text-sm text-gray-400'}>
                        {content ?? "You can change these at any time in the 'Account' tab."}
                    </p>
                    <div className={'my-6'}>
                        <Field
                            type={'text'}
                            id={'username'}
                            name={'username'}
                            label={'Account Username'}
                            placeholder={'everestuser1'}
                        />
                        <p className={'text-xs text-gray-400 mt-2'}>
                            This will be the unique username for your account. Maybe make this your name?
                        </p>
                    </div>
                    <div className={'my-6'}>
                        <Field
                            id={'password'}
                            name={'password'}
                            type={'password'}
                            placeholder={'••••••••'}
                            label={'Account Password'}
                        />
                        <p className={'text-xs text-gray-400 mt-2'}>
                            Your password must be at least 8 characters and include at least 1 special character.
                        </p>
                    </div>
                    {force2fa && (
                        <Alert type={'warning'} className={'my-6'}>
                            The security policies on this Panel indicate you must enable Two Factor Authentication for
                            secure access. You can enable it by clicking the &apos;Setup 2FA&apos; button on the next
                            page.
                        </Alert>
                    )}
                    <div className={'flex w-full justify-between'}>
                        <p className={'my-auto text-xs text-gray-400'}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className={'mr-1 text-yellow-600'} />
                            This action will cause your account to logout.
                        </p>
                        <Button type={'submit'}>Save Changes</Button>
                    </div>
                </Form>
            </Formik>
        </Dialog>
    );
};
