import { updateSettings } from '@/api/routes/admin/ai/settings';
import Input from '@/elements/Input';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import Tooltip from '@/elements/tooltip/Tooltip';
import { useFlashKey } from '@/plugins/useFlash';
import { Dialog } from '@/elements/dialog';
import { faCheckCircle, faExclamationTriangle, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreState } from 'easy-peasy';
import { useEffect, useState } from 'react';

export default () => {
    const [key, setKey] = useState<string>();
    const settings = useStoreState(s => s.everest.data!.ai);
    const [loading, setLoading] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('admin:ai');

    const theme = useStoreState(s => s.theme.data!.colors);

    const submit = () => {
        clearFlashes();
        setLoading(true);

        updateSettings({ ...settings, key })
            .then(() => {
                window.location.reload();
            })
            .catch(error => clearAndAddHttpError(error));
    };

    useEffect(() => {
        if (key && key.length > 30 && key.length < 60) {
            submit();
        }
    }, [key]);

    return (
        <Dialog open onClose={() => undefined} preventExternalClose hideCloseIcon title={'Configure Jexactyl AI'}>
            <SpinnerOverlay visible={loading} />
            <p className={'text-gray-400'}>
                In order to use <span style={{ color: theme.primary }}>Jexactyl AI</span>, you must get a Gemini API key
                from Google.
            </p>
            <p className={'text-gray-400 my-2'}>
                You can visit the{' '}
                <a
                    href={'https://aistudio.google.com/'}
                    rel={'noreferrer'}
                    target={'_blank'}
                    className={'text-blue-400'}
                >
                    AI Studio
                    <FontAwesomeIcon icon={faExternalLink} className={'mb-1.5 ml-0.5 h-2 w-2'} />
                </a>
                &nbsp;and obtain an API key to use.
            </p>
            <div className={'relative'}>
                <Input placeholder={'Enter API key here...'} onChange={e => setKey(e.currentTarget.value)} />
                {!key || key.length < 30 || key.length > 60 ? (
                    <Tooltip placement={'right'} content={'You must enter a valid Google AI key to continue.'}>
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className={'absolute top-1/3 right-4 text-yellow-500'}
                        />
                    </Tooltip>
                ) : (
                    <FontAwesomeIcon icon={faCheckCircle} className={'absolute top-1/3 right-4 text-green-500'} />
                )}
            </div>
        </Dialog>
    );
};
