import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Select from '@/elements/Select';
import AdminBox from '@/elements/AdminBox';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import { Alert } from '@/elements/alert';
import useStatus from '@/plugins/useStatus';
import { updateModule } from '@/api/routes/admin/auth/module';

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
                    onChange={e => update('enabled', e.target.value)}
                    autoComplete={'off'}
                >
                    <option value={1} selected={settings.enabled}>
                        Enabled
                    </option>
                    <option value={0} selected={!settings.enabled}>
                        Disabled
                    </option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>
                    Toggle whether users can register using the built-in pages.
                </p>
            </div>
            {!settings.enabled && (
                <Alert type={'warning'} className={'mt-6'}>
                    <span className={'text-xs'}>
                        Since registration is disabled, OAuth modules like Discord will only allow users to login - not
                        register.
                    </span>
                </Alert>
            )}
        </AdminBox>
    );
};
