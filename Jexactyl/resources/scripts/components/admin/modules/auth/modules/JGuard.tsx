import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import AdminBox from '@/elements/AdminBox';
import Spinner from '@/elements/Spinner';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/outline';
import { toggleModule, updateModule } from '@/api/routes/admin/auth/module';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Dialog } from '@/elements/dialog';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';

export default () => {
    const [confirm, setConfirm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const delay = useStoreState(state => state.everest.data!.auth.modules.jguard.delay);

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

    const doDeletion = () => {
        toggleModule('disable', 'jguard')
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:modules:jguard', error }));
    };

    return (
        <AdminBox title={'jGuard'} icon={faDoorOpen}>
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
        </AdminBox>
    );
};
