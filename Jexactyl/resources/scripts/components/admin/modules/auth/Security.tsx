import Label from '@/elements/Label';
import Select from '@/elements/Select';
import AdminBox from '@/elements/AdminBox';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Input from '@/elements/Input';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';
import useStatus from '@/plugins/useStatus';
import { updateModule } from '@/api/routes/admin/auth/module';

export default () => {
    const { status, setStatus } = useStatus();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.everest.data!.auth.security);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setStatus('loading');

        updateModule('security', key, value)
            .then(() => setStatus('success'))
            .catch(error => {
                setStatus('error');
                clearAndAddHttpError({ key: 'auth:security', error });
            });
    };

    return (
        <AdminBox title={'Security Module'} icon={faLock} byKey={'auth:security'} status={status}>
            <div>
                <Label>Force Two-Factor Authentication</Label>
                <Select
                    id={'force2fa'}
                    name={'force2fa'}
                    onChange={e => update('force2fa', e.target.value)}
                    autoComplete={'off'}
                >
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
                    autoComplete={'off'}
                    onChange={e => update('attempts', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Set the maximum amount of attempts a user can make to login before being throttled.
                </p>
            </div>
        </AdminBox>
    );
};
