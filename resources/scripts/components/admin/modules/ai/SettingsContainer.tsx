import Field from '@/elements/Field';
import Label from '@/elements/Label';
import { Form, Formik } from 'formik';
import AdminBox from '@/elements/AdminBox';
import { useStoreState } from '@/state/hooks';
import { faKey, faUser, faCog, faServer } from '@fortawesome/free-solid-svg-icons';
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
                api_key: ai.api_key || ai.key || '',
                endpoint: ai.endpoint || 'https://api.openai.com/v1/chat/completions',
                model: ai.model || 'gpt-3.5-turbo',
                max_tokens: ai.max_tokens || 1000,
                temperature: ai.temperature || 0.7,
                user_access: ai.user_access,
            }}
        >
            <Form>
                <div className={'grid lg:grid-cols-2 gap-4'}>
                    <AdminBox title={'API Configuration'} icon={faKey}>
                        <div>
                            <Label htmlFor={'api_key'}>API Key</Label>
                            <Field
                                id={'api_key'}
                                name={'api_key'}
                                type={'password'}
                                placeholder={'sk-...'}
                            />
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                Enter your OpenAI compatible API key.
                            </p>
                        </div>
                    </AdminBox>

                    <AdminBox title={'API Endpoint'} icon={faServer}>
                        <div>
                            <Label htmlFor={'endpoint'}>Endpoint URL</Label>
                            <Field
                                id={'endpoint'}
                                name={'endpoint'}
                                type={'input'}
                                placeholder={'https://api.openai.com/v1/chat/completions'}
                            />
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                OpenAI compatible API endpoint (OpenAI, Groq, Ollama, etc.)
                            </p>
                        </div>
                    </AdminBox>

                    <AdminBox title={'Model Configuration'} icon={faCog}>
                        <div>
                            <Label htmlFor={'model'}>Model</Label>
                            <Field
                                id={'model'}
                                name={'model'}
                                type={'input'}
                                placeholder={'gpt-3.5-turbo'}
                            />
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                Model name (e.g., gpt-3.5-turbo, gpt-4, llama3-8b-8192, etc.)
                            </p>
                        </div>
                    </AdminBox>

                    <AdminBox title={'Generation Settings'} icon={faCog}>
                        <div className={'space-y-4'}>
                            <div>
                                <Label htmlFor={'max_tokens'}>Max Tokens</Label>
                                <Field
                                    id={'max_tokens'}
                                    name={'max_tokens'}
                                    type={'number'}
                                    min={1}
                                    max={4000}
                                />
                            </div>
                            <div>
                                <Label htmlFor={'temperature'}>Temperature</Label>
                                <Field
                                    id={'temperature'}
                                    name={'temperature'}
                                    type={'number'}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs'}>
                                Control the creativity and randomness of responses.
                            </p>
                        </div>
                    </AdminBox>

                    <AdminBox title={'Client Access'} icon={faUser}>
                        <div>
                            <div className={'inline-flex'}>
                                <Label className={'mt-1 mr-2'}>Allow standard users to use AI?</Label>
                                <Field
                                    id={'user_access'}
                                    name={'user_access'}
                                    type={'checkbox'}
                                />
                            </div>
                            <p className={'text-gray-400 text-xs mt-1.5'}>
                                If enabled, standard Jexactyl users will be able to interact with Jexactyl AI as well as
                                administrators.
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
