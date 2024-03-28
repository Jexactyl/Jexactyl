import { useState } from 'react';
import Label from '@/components/elements/Label';
import Select from '@/components/elements/Select';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { CheckCircleIcon } from '@heroicons/react/solid';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const update = async () => {
        setLoading(true);
        setSuccess(false);

        // Do action

        setSuccess(true);
        setLoading(false);
    };

    return (
        <AdminBox title={'Discord SSO Module'} icon={faDiscord}>
            {loading && <Spinner className={'absolute top-0 right-0 m-3.5'} size={'small'} />}
            {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-0 m-3.5 text-green-500'} />}
            <div>
                <Label>Allow Discord SSO</Label>
                <Select id={'enabled'} name={'enabled'} onChange={update}>
                    <option value={1}>Enabled</option>
                    <option value={0}>Disabled</option>
                </Select>
                <p className={'text-xs text-gray-400 mt-1'}>
                    Toggle whether users can sign up and log in via Discord&trade;.
                </p>
            </div>
        </AdminBox>
    );
};
