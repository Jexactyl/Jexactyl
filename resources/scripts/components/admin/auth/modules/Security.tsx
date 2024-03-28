import { useState } from 'react';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import { faLock } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);

    const update = () => {
        setLoading(true);
    };

    return (
        <AdminBox title={'Security Module'} icon={faLock}>
            {loading && <Spinner className={'absolute top-0 right-0 m-3.5'} size={'small'} />}
            <div>
                <Label>Force Two-Factor Authentication</Label>
                <Select id={'enabled'} name={'enabled'} onChange={update}>
                    <option value={1}>Enabled</option>
                    <option value={0}>Disabled</option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>Toggle whether users must use two-factor authentication.</p>
            </div>
        </AdminBox>
    );
};
