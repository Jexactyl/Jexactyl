import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Select from '@/elements/Select';
import AdminBox from '@/elements/AdminBox';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import { Alert } from '@/elements/alert';
import useStatus from '@/plugins/useStatus';
import { updateModule } from '@/api/routes/admin/auth';

export default () => {
    const { status, setStatus } = useStatus();
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.everest.data!.auth.registration);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setStatus('loading');

        updateModule('registration', key, value)
            .then(() => {
                setStatus('success');
            })
            .catch(error => {
                setStatus('error');
                clearAndAddHttpError({ key: 'auth:registration', error });
            });
    };

    return (
        <AdminBox title={'Registration Module'} icon={faUserPlus} byKey={'auth:registration'} status={status}>
            <div>
                <Label>Allow User Registration</Label>
                <Select
                    id={'enabled'}
                    name={'enabled'}
                    onChange={e => update('email:enabled', e.target.value)}
                    autoComplete={'off'}
                >
                    <option value={1} selected={settings.email.enabled}>
                        Enabled
                    </option>
                    <option value={0} selected={!settings.email.enabled}>
                        Disabled
                    </option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>
                    Toggle whether users can register using email.
                </p>
            </div>
            {!settings.email.enabled && (
                <Alert type={'warning'} className={'mt-6'}>
                    <span className={'text-xs'}>
                        Registration for email is disabled, but can be re-enabled or separately enabled for Oauth modules such as Discord or Google.
                    </span>
                </Alert>
            )}
        </AdminBox>
    );
};
