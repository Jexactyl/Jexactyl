import { useState } from 'react';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Input from '@/components/elements/Input';
import FlashMessageRender from '@/components/FlashMessageRender';
import { CheckCircleIcon } from '@heroicons/react/solid';
import useFlash from '@/plugins/useFlash';
import updateSecuritySettings from '@/api/admin/auth/updateSecuritySettings';
import { useStoreState } from '@/state/hooks';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.everest.data!.auth.security);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateSecuritySettings(key, value)
            .then(() => {
                setSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                clearAndAddHttpError({ key: 'auth:security', error });
            });

        setTimeout(() => setSuccess(false), 2000);
    };

    return (
        <AdminBox title={'Security Module'} icon={faLock}>
            <FlashMessageRender byKey={'auth:security'} className={'my-2'} />
            {loading && <Spinner className={'absolute top-0 right-0 m-3.5'} size={'small'} />}
            {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-0 m-3.5 text-green-500'} />}
            <div>
                <Label>Force Two-Factor Authentication</Label>
                <Select id={'force2fa'} name={'force2fa'} onChange={e => update('force2fa', e.target.value)}>
                    <option value={1} selected={settings.force2fa}>
                        Enabled
                    </option>
                    <option value={0} selected={!settings.force2fa}>
                        Disabled
                    </option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>Toggle whether users must use two-factor authentication.</p>
            </div>
            <div className={'mt-6'}>
                <Label>Login Attempt Limit</Label>
                <Input
                    placeholder={`${settings.attempts ?? 3}`}
                    id={'attempts'}
                    type={'number'}
                    name={'attempts'}
                    onChange={e => update('attempts', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Set the maximum amount of attempts a user can make to login before being throttled.
                </p>
            </div>
        </AdminBox>
    );
};
