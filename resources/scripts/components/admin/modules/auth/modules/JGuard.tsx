import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import Select from '@/elements/Select';
import AdminBox from '@/elements/AdminBox';
import Spinner from '@/elements/Spinner';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/outline';
import { toggleModule, updateModule } from '@/api/routes/admin/auth';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Dialog } from '@/elements/dialog';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import useStatus from '@/plugins/useStatus';
import { Link } from 'react-router-dom';

export default () => {
    const [confirm, setConfirm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { status, setStatus } = useStatus();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const delay = useStoreState(state => state.everest.data!.auth.modules.jguard.delay);
    const sensitivity = useStoreState(state => state.everest.data!.auth.modules.jguard.sensitivity);
    const registrationSettings = useStoreState(state => state.everest.data!.auth.registration.jguard);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateModule('jguard', key, value)
            .then(() => {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => setSuccess(false), 2000);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:jguard', error });

                setLoading(false);
            });
    };
    
    const updateRegistration = async (value: any) => {
        clearFlashes();
        setStatus('loading');

        updateModule('registration', 'jguard:enabled', value)
            .then(() => {
                setStatus('success');
                setTimeout(() => setStatus('none'), 2000);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:jguard', error });

                setStatus('none');
            });
    };
    const doDeletion = () => {
        toggleModule('disable', 'jguard')
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:modules:jguard', error }));
    };

    return (
        <AdminBox 
            title={'jGuard'} 
            icon={faDoorOpen} 
            byKey={'auth:modules:jguard'} 
            status={status} 
            canDelete
        >
            <FlashMessageRender byKey={'auth:modules:jguard'} className={'my-2'} />
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
                <Label>Automatic approval delay</Label>
                <Input
                    autoComplete={'off'}
                    id={'delay'}
                    type={'text'}
                    name={'delay'}
                    defaultValue={delay || 0}
                    onChange={e => update('delay', parseInt(e.target.value))}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    If you wish to automatically approve user signups, this variable can make it so that users cannot
                    access the Panel for a certain period of time in order to prevent bot attacks.
                </p>
            </div>
            <div className={'mt-6'}>
                <Label>Alt account detection sensitivity</Label>
                <Select
                    id={'sensitivity'}
                    name={'sensitivity'}
                    defaultValue={sensitivity || 'medium'}
                    onChange={e => update('sensitivity', e.target.value)}
                    autoComplete={'off'}
                >
                    <option value={'low'}>Low</option>
                    <option value={'medium'}>Medium</option>
                    <option value={'high'}>High</option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>
                    Controls how quickly jGuard blocks new signups from an IP address that has recently registered or
                    failed to log in multiple times. Higher sensitivity blocks alt accounts more aggressively, but may
                    also affect legitimate users signing up from a shared IP (e.g. school or office networks).
                </p>
            </div>
            <div className={'my-6'}>
                <Label>Client Secret {!settings.abuseipdb_api_key && <RequiredFieldIcon />}</Label>
                <Input
                    autoComplete={'off'}
                    id={'abuseipdb_api_key'}
                    type={'password'}
                    name={'abuseipdb_api_key'}
                    onChange={e => update('abuseipdb_api_key', e.target.value)}
                    placeholder={settings.abuseipdb_api_key ? '••••••••••••••••' : ''}
                />
                <p className={'text-xs text-gray-400 mt-1'}>Set the 
                    <Link
                        to={'https://abuseipdb.com/register'}
                        target={'_blank'} 
                        rel={'noopener noreferrer'}
                        style={{ color: colors.primary }}
                        className={'hover:brightness-125 duration-300'}
                    >
                        AbuseIPDB
                    </Link>
                     api key.</p>
            </div>
            
            <div>
                <Label>Allow User Registration</Label>
                <Select
                    id={'enabled'}
                    name={'enabled'}
                    onChange={e => updateRegistration(e.target.value)}
                    autoComplete={'off'}
                >
                    <option value={1} selected={registrationSettings.enabled}>
                        Enabled
                    </option>
                    <option value={0} selected={!registrationSettings.enabled}>
                        Disabled
                    </option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>
                    Toggle whether jGuard is used for signups. If this is disabled, jGuard will only be used for logins.
                </p>
            </div>
        </AdminBox>
    );
};
