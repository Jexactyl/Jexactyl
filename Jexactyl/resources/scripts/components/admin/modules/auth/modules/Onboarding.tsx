import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import AdminBox from '@/elements/AdminBox';
import Spinner from '@/elements/Spinner';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/outline';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { Dialog } from '@/elements/dialog';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from '@/state/hooks';
import { Alert } from '@/elements/alert';
import { toggleModule, updateModule } from '@/api/routes/admin/auth/module';

export default () => {
    const [confirm, setConfirm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const force2fa = useStoreState(state => state.everest.data!.auth.security.force2fa);
    const content = useStoreState(state => state.everest.data!.auth.modules.onboarding.content);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setLoading(true);
        setSuccess(false);

        updateModule('onboarding', key, value)
            .then(() => {
                setSuccess(true);
                setLoading(false);
                setTimeout(() => setSuccess(false), 2000);
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:onboarding', error });

                setLoading(false);
            });
    };

    const doDeletion = () => {
        toggleModule('disable', 'onboarding')
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:modules:onboarding', error }));
    };

    return (
        <AdminBox title={'Onboarding'} icon={faDoorOpen}>
            <FlashMessageRender byKey={'auth:modules:onboarding'} className={'my-2'} />
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
                <Label>Content</Label>
                <Input
                    autoComplete={'off'}
                    id={'content'}
                    type={'text'}
                    name={'content'}
                    defaultValue={content || "You can change these at any time in the 'Account' tab."}
                    onChange={e => update('content', e.target.value)}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Set the description that should be displayed in the Onboarding dialog. You can leave this empty if
                    you wish.
                </p>
            </div>
            {force2fa && (
                <Alert type={'info'} className={'mt-6'}>
                    <span className={'text-xs'}>
                        Since &apos;Force 2FA&apos; is enabled, a box will be shown to users in the Onboarding dialog
                        which informs users they must enable two-factor to use the Panel.
                    </span>
                </Alert>
            )}
        </AdminBox>
    );
};
