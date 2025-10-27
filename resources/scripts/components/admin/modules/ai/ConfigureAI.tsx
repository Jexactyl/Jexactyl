import { updateSettings } from '@/api/routes/admin/ai/settings';
import Input from '@/elements/Input';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import Tooltip from '@/elements/tooltip/Tooltip';
import { useFlashKey } from '@/plugins/useFlash';
import { Dialog } from '@/elements/dialog';
import { faCheckCircle, faExclamationTriangle, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreState } from 'easy-peasy';
import { useState } from 'react';

export default () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [endpoint, setEndpoint] = useState<string>('https://api.openai.com/v1/chat/completions');
    const [model, setModel] = useState<string>('gpt-3.5-turbo');
    const settings = useStoreState(s => s.everest.data!.ai);
    const [loading, setLoading] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('admin:ai');

    const theme = useStoreState(s => s.theme.data!.colors);

    const submit = () => {
        clearFlashes();
        setLoading(true);

        updateSettings({ 
            ...settings, 
            api_key: apiKey,
            endpoint: endpoint,
            model: model,
            key: apiKey // Legacy support
        })
            .then(() => {
                window.location.reload();
            })
            .catch(error => clearAndAddHttpError(error));
    };

    const isValidKey = () => {
        return apiKey.length > 10;
    };

    return (
        <Dialog open onClose={() => undefined} preventExternalClose hideCloseIcon title={'Configure Jexactyl AI'}>
            <SpinnerOverlay visible={loading} />
            <div className={'space-y-4'}>
                <p className={'text-gray-400'}>
                    In order to use <span style={{ color: theme.primary }}>Jexactyl AI</span>, you must configure an OpenAI-compatible API.
                </p>

                <div>
                    <label className={'text-sm font-medium text-gray-300 mb-2 block'}>API Key</label>
                    <div className={'relative'}>
                        <Input 
                            placeholder={'sk-...'}
                            value={apiKey}
                            onChange={e => setApiKey(e.currentTarget.value)}
                            type={'password'}
                        />
                        {!isValidKey() ? (
                            <Tooltip placement={'right'} content={'You must enter a valid API key to continue.'}>
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className={'absolute top-1/3 right-4 text-yellow-500'}
                                />
                            </Tooltip>
                        ) : (
                            <FontAwesomeIcon icon={faCheckCircle} className={'absolute top-1/3 right-4 text-green-500'} />
                        )}
                    </div>
                    <p className={'text-gray-400 text-xs mt-1'}>
                        Enter your OpenAI compatible API key (OpenAI, Groq, Ollama, etc.)
                    </p>
                </div>

                <div>
                    <label className={'text-sm font-medium text-gray-300 mb-2 block'}>Endpoint URL</label>
                    <Input 
                        placeholder={'https://api.openai.com/v1/chat/completions'}
                        value={endpoint}
                        onChange={e => setEndpoint(e.currentTarget.value)}
                    />
                    <p className={'text-gray-400 text-xs mt-1'}>
                        OpenAI compatible API endpoint URL
                    </p>
                </div>

                <div>
                    <label className={'text-sm font-medium text-gray-300 mb-2 block'}>Model</label>
                    <Input 
                        placeholder={'gpt-3.5-turbo'}
                        value={model}
                        onChange={e => setModel(e.currentTarget.value)}
                    />
                    <p className={'text-gray-400 text-xs mt-1'}>
                        Model name (e.g., gpt-3.5-turbo, gpt-4, llama3-8b-8192, etc.)
                    </p>
                </div>

                <div className={'flex justify-end'}>
                    <button
                        onClick={submit}
                        disabled={!isValidKey()}
                        className={'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'}
                    >
                        Configure AI
                    </button>
                </div>
            </div>
        </Dialog>
    );
};
