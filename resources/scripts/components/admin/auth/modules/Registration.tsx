import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import updateRegistrationSettings from '@/api/admin/auth/updateRegistrationSettings';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from '@/state/hooks';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.settings.data!.registration);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateRegistrationSettings(key, value)
            .then(() => {
                setSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                clearAndAddHttpError({ key: 'auth:registration', error });
            });

        setTimeout(() => setSuccess(false), 2000);
    };

    return (
        <AdminBox title={'Registration Module'} icon={faUserPlus}>
            <FlashMessageRender byKey={'auth:registration'} className={'my-2'} />
            {loading && <Spinner className={'absolute top-0 right-0 m-3.5'} size={'small'} />}
            {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-0 m-3.5 text-green-500'} />}
            <div>
                <Label>Allow User Registration</Label>
                <Select id={'enabled'} name={'enabled'} onChange={e => update('enabled', e.target.value)}>
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
        </AdminBox>
    );
};
