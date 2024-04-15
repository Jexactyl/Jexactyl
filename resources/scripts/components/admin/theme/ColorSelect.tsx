import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from '@/state/hooks';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import AdminBox from '@/components/admin/AdminBox';
import Spinner from '@/components/elements/Spinner';
import updateColors from '@/api/admin/theme/updateColors';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import FlashMessageRender from '@/components/FlashMessageRender';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const colors = useStoreState(state => state.theme.data!.colors);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateColors(key, value)
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

    return (
        <AdminBox title={'Color Selection'} icon={faDiscord}>
            <FlashMessageRender byKey={'theme:colors'} className={'my-2'} />
            {loading && <Spinner className={'absolute top-0 right-8 m-3.5'} size={'small'} />}
            {success && <CheckCircleIcon className={'w-5 h-5 absolute top-0 right-8 m-3.5 text-green-500'} />}
            <div>
                <Label>Primary Color</Label>
                <Input
                    id={'primary'}
                    type={'color'}
                    name={'primary'}
                    value={colors.primary}
                    onChange={e => update('primary', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    This color is used as the main text color on the application and is also used for the buttons and
                    other components.
                </p>
            </div>
        </AdminBox>
    );
};
