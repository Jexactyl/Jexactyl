import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import { Dialog } from '@/components/elements/dialog';
import disableModule from '@/api/admin/auth/disableModule';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import FlashMessageRender from '@/components/FlashMessageRender';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/outline';
import RequiredFieldIcon from '@/components/elements/RequiredFieldIcon';
import updateDiscordSettings from '@/api/admin/auth/modules/updateDiscordSettings';

export default () => {
    const [confirm, setConfirm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.everest.data!.auth.modules.discord);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateDiscordSettings(key, value)
            .then(() => {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => setSuccess(false), 2000);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:discord', error });

                setLoading(false);
            });
    };

    const doDeletion = () => {
        disableModule('discord')
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:modules:discord', error }));
    };

    return (
        <AdminBox title={'Discord SSO Module'} icon={faDiscord}>
            <FlashMessageRender byKey={'auth:modules:discord'} className={'my-2'} />
            {loading && <Spinner className={'absolute top-0 right-8 m-3.5'} size={'small'} />}
            {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-8 m-3.5 text-green-500'} />}
            <Dialog.Confirm
                open={confirm}
                title={'Confirm module removal'}
                onConfirmed={() => doDeletion()}
                onClose={() => setConfirm(false)}
            >
                Are you sure you wish to delete this module?
            </Dialog.Confirm>
            <TrashIcon
                className={'w-5 h-5 absolute top-0 right-0 m-3.5 text-red-500 hover:text-red-300 duration-300'}
                onClick={() => setConfirm(true)}
            />
            <div>
                <Label>Client Identifier {!settings.clientId && <RequiredFieldIcon />}</Label>
                <Input
                    id={'client_id'}
                    type={'password'}
                    name={'client_id'}
                    onChange={e => update('client_id', e.target.value)}
                    placeholder={settings.clientId ? '••••••••••••••••' : ''}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Set the Discord Client ID. You can find this in the{' '}
                    <Link to={'https://discord.com/developers/docs/intro'} className={'text-primary-400'}>
                        Developer Portal
                    </Link>
                    .
                </p>
            </div>
            <div className={'mt-6'}>
                <Label>Client Secret {!settings.clientSecret && <RequiredFieldIcon />}</Label>
                <Input
                    id={'client_secret'}
                    type={'password'}
                    name={'client_secret'}
                    onChange={e => update('client_secret', e.target.value)}
                    placeholder={settings.clientSecret ? '••••••••••••••••' : ''}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Set the Discord Client Secret. You can find this in the{' '}
                    <Link to={'https://discord.com/developers/docs/intro'} className={'text-primary-400'}>
                        Developer Portal
                    </Link>
                    .
                </p>
            </div>
        </AdminBox>
    );
};
