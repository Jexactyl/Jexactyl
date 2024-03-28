import { Form, Formik } from 'formik';
import { Button } from './elements/button';
import { useStoreState } from '@/state/hooks';
import Field from '@/components/elements/Field';
import { Dialog } from '@/components/elements/dialog';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from './FlashMessageRender';
import setup, { Values } from '@/api/account/setup';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const content = useStoreState(state => state.everest.data!.auth.modules.onboarding.content);
    const appName = useStoreState(state => state.settings.data!.name);

    const submit = (values: Values) => {
        clearFlashes();

        setup(values)
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/';
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
                    <div className={'text-right'}>
                        <Button type={'submit'}>Save Changes</Button>
                    </div>
                </Form>
            </Formik>
        </Dialog>
    );
};
