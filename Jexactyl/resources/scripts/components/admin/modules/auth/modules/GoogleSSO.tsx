import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import useStatus from '@/plugins/useStatus';
import { useStoreState } from '@/state/hooks';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import AdminBox from '@/elements/AdminBox';
import { TrashIcon } from '@heroicons/react/outline';
import { Dialog } from '@/elements/dialog';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import FlashMessageRender from '@/elements/FlashMessageRender';
import RequiredFieldIcon from '@/elements/RequiredFieldIcon';
import { toggleModule, updateModule } from '@/api/routes/admin/auth/module';
import { Alert } from '@/elements/alert';

export default () => {
    const { status, setStatus } = useStatus();
    const [confirm, setConfirm] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.everest.data!.auth.modules.google);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setStatus('loading');

        updateModule('google', key, value)
            .then(() => {
                setStatus('success');
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:google', error });

                setStatus('error');
            });
    };

    const doDeletion = () => {
        toggleModule('disable', 'google')
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:modules:google', error }));
    };

    return (
        <AdminBox title={'Google SSO Module'} icon={faGoogle} byKey={'auth:modules:google'} status={status} canDelete>
            <FlashMessageRender byKey={'auth:modules:google'} className={'my-2'} />
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
                <Label>Client Identifier {!settings.clientId && <RequiredFieldIcon />}</Label>
                <Input
                    autoComplete={'off'}
                    id={'client_id'}
                    type={'password'}
                    name={'client_id'}
                    onChange={e => update('client_id', e.target.value)}
                    placeholder={settings.clientId ? '••••••••••••••••' : ''}
                />

                <p className={'text-xs text-gray-400 mt-1'}>Set the Google Client ID.</p>
            </div>
            <div className={'my-6'}>
                <Label>Client Secret {!settings.clientSecret && <RequiredFieldIcon />}</Label>
                <Input
                    autoComplete={'off'}
                    id={'client_secret'}
                    type={'password'}
                    name={'client_secret'}
                    onChange={e => update('client_secret', e.target.value)}
                    placeholder={settings.clientSecret ? '••••••••••••••••' : ''}
                />
                <p className={'text-xs text-gray-400 mt-1'}>Set the Google Client Secret.</p>
            </div>
            <Alert type={'info'}>
                <div>
                    Use the following Callback URL:
                    <p className={'bg-black/50 p-1 rounded-lg font-mono w-fit mt-2'}>
                        /auth/modules/google/authenticate
                    </p>
                </div>
            </Alert>
        </AdminBox>
    );
};
