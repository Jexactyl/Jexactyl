import Field from '@/elements/Field';
import Label from '@/elements/Label';
import { Form, Formik } from 'formik';
import AdminBox from '@/elements/AdminBox';
import { useStoreState } from '@/state/hooks';
import { faKey, faUser } from '@fortawesome/free-solid-svg-icons';
import { AISettings, updateSettings } from '@/api/routes/admin/ai/settings';
import useFlash from '@/plugins/useFlash';
import { Button } from '@/elements/button';

export default () => {
    const { clearFlashes, clearAndAddHttpError, addFlash } = useFlash();
    const ai = useStoreState(s => s.everest.data!.ai);

    const submit = (values: AISettings) => {
        clearFlashes();

        updateSettings(values)
            .then(() => {
                addFlash({
                    type: 'success',
                    key: 'admin:ai:settings',
                    message: 'Settings have been updated successfully.',
                });
            })
            .catch(error => {
                clearAndAddHttpError({
                    key: 'admin:ai:settings',
                    error: error,
                });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                user_access: ai.user_access,
            }}
        >
            <Form>
                <div className={'grid lg:grid-cols-4 gap-4'}>
                    <AdminBox title={'Client-side AI'} icon={faUser}>
                        <div>
                            <div className={'inline-flex'}>
                                <Label className={'mt-1 mr-2'}>Allow standard users to use AI?</Label>
                                <Field
                                    id={'user_access'}
                                    name={'user_access'}
                                    type={'checkbox'}
                                    defaultChecked={ai.user_access}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If enabled, standard Jexactyl users will be able to interact with Jexactyl AI as well as
                                administrators.
                            </p>
                        </div>
                    </AdminBox>
                    <AdminBox title={'Modify API Key'} icon={faKey}>
                        <div>
                            <Field id={'key'} name={'key'} type={'input'} />
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If you are experiencing &apos;Invalid API Key&apos; errors, you can enter a new one here
                                to reset it.
                            </p>
                        </div>
                    </AdminBox>
                </div>
                <div className={'w-full flex flex-row items-center mt-6'}>
                    <div className={'flex text-xs text-gray-500'}>
                        These changes may not apply until this page is reloaded.
                    </div>
                    <div className={'flex ml-auto'}>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>
            </Form>
        </Formik>
    );
};
