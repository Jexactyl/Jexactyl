import AdminBox from '@/elements/AdminBox';
import ToggleFeatureButton from '@admin/modules/ai/ToggleFeatureButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Input from '@/elements/Input';
import { SparklesIcon, XCircleIcon } from '@heroicons/react/outline';
import { useStoreState } from '@/state/hooks';
import { KeyboardEvent as ReactKeyboardEvent, useState } from 'react';
import { handleQuery } from '@/api/routes/admin/ai/handleQuery';
import { useFlashKey } from '@/plugins/useFlash';
import Spinner from '@/elements/Spinner';
import { Alert } from '@/elements/alert';

interface Props {
    primary: string;
    loading: boolean;
    result: string | undefined;
}

function DisplayMessage({ primary, result, loading }: Props) {
    if (result && result !== 'error') {
        return (
            <>
                <SparklesIcon className={'w-4 h-4 inline-flex'} style={{ color: primary }} />
                <div>{result}</div>
            </>
        );
    }

    if (result && result === 'error') {
        return (
            <>
                <XCircleIcon className={'w-4 h-4 inline-flex text-red-400'} /> An error occurred. Please try again
                later.
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Spinner className={'my-auto inline-flex'} size={'small'} />
                <span className={'ml-2 animate-pulse'}>...</span>
            </>
        );
    }

    return (
        <>
            <SparklesIcon className={'w-4 h-4 inline-flex'} style={{ color: primary }} /> waiting for query
        </>
    );
}

export default () => {
    const [result, setResult] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const { primary } = useStoreState(s => s.theme.data!.colors);
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('admin:ai');

    const submit = (e: ReactKeyboardEvent<HTMLInputElement>) => {
        const command = e.currentTarget.value;

        if (e.key === 'Enter' && command.length > 1) {
            clearFlashes();
            setLoading(true);
            setResult(undefined);

            handleQuery(command)
                .then(result => setResult(result))
                .then(() => setLoading(false))
                .catch(error => {
                    setResult('error');
                    clearAndAddHttpError(error);
                });
        }
    };

    return (
        <div className={'grid lg:grid-cols-5 gap-4'}>
            <div className={'col-span-3'}>
                <div className={'bg-black rounded-t shadow-xl relative overflow-auto min-h-[50vh] h-full'}>
                    <div className={'absolute top-0 left-0 w-full p-2 font-mono'}>
                        <DisplayMessage primary={primary} loading={loading} result={result} />
                    </div>
                </div>
                <div className={'w-full bg-zinc-800 rounded-b px-4 py-2 inline-flex'}>
                    <FontAwesomeIcon icon={faChevronRight} className={'my-auto mr-4'} />
                    <Input className={'font-mono'} placeholder={'Ask Jexactyl AI a question'} onKeyDown={submit} />
                </div>
            </div>
            <div className={'col-span-2 space-y-4'}>
                <Alert type={'warning'} className={'mt-16 md:mt-0'}>
                    Jexactyl AI relies on Google Gemini models for requests. Information provided could be inaccurate or
                    outdated. Use with caution!
                </Alert>
                <Alert type={'info'}>
                    API requests are limited on Gemini&apos;s public API to 120/second - if you experience ratelimiting,
                    you may need to upgrade your license.
                </Alert>
                <AdminBox title={'Disable Jexactyl AI'} className={'col-span-2 h-min'}>
                    Clicking the button below will disable Jexactyl AI for both clients and administrators. Your API key
                    will remain in the database unless you choose to delete it manually.
                    <div className={'text-right mt-2'}>
                        <ToggleFeatureButton />
                    </div>
                </AdminBox>
            </div>
        </div>
    );
};
