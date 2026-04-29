import { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import useStatus from '@/plugins/useStatus';
import { useStoreState } from '@/state/hooks';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import AdminBox from '@/elements/AdminBox';
import { TrashIcon } from '@heroicons/react/outline';
import { Dialog } from '@/elements/dialog';
import { faIdCard } from '@fortawesome/free-solid-svg-icons';
import FlashMessageRender from '@/elements/FlashMessageRender';
import RequiredFieldIcon from '@/elements/RequiredFieldIcon';
import { toggleModule, updateModule } from '@/api/routes/admin/auth/module';
import { Alert } from '@/elements/alert';

export default () => {
    const { status, setStatus } = useStatus();
    const [confirm, setConfirm] = useState<boolean>(false);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const settings = useStoreState(state => state.everest.data!.auth.modules.oidc);

    const update = async (key: string, value: any) => {
        clearFlashes();
        setStatus('loading');

        updateModule('oidc', key, value)
            .then(() => {
                setStatus('success');
            })
            .catch(error => {
                clearAndAddHttpError({ key: 'auth:modules:oidc', error });
                setStatus('error');
            });
    };

    const doDeletion = () => {
        toggleModule('disable', 'oidc')
            .then(() => {
                // @ts-expect-error this is fine
                window.location = '/admin/auth';
            })
            .catch(error => clearAndAddHttpError({ key: 'auth:modules:oidc', error }));
    };

    return (
        <AdminBox title={'OIDC SSO Module'} icon={faIdCard} byKey={'auth:modules:oidc'} status={status} canDelete>
            <FlashMessageRender byKey={'auth:modules:oidc'} className={'my-2'} />
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
                <Label>Issuer URL {!settings.issuerUrl && <RequiredFieldIcon />}</Label>
                <Input
                    autoComplete={'off'}
                    id={'issuer_url'}
                    type={'text'}
                    name={'issuer_url'}
                    onChange={e => update('issuer_url', e.target.value)}
                    placeholder={settings.issuerUrl ? '(configured)' : 'https://accounts.example.com'}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    The base URL of your OIDC provider. The panel will auto-discover endpoints via{' '}
                    <code>/.well-known/openid-configuration</code>. Examples: Keycloak, Authentik, Authelia, Okta,
                    Azure AD, Google.
                </p>
            </div>

            <div className={'my-6'}>
                <Label>Client Identifier {!settings.clientId && <RequiredFieldIcon />}</Label>
                <Input
                    autoComplete={'off'}
                    id={'client_id'}
                    type={'password'}
                    name={'client_id'}
                    onChange={e => update('client_id', e.target.value)}
                    placeholder={settings.clientId ? '••••••••••••••••' : ''}
                />
                <p className={'text-xs text-gray-400 mt-1'}>The Client ID from your OIDC provider.</p>
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
                <p className={'text-xs text-gray-400 mt-1'}>The Client Secret from your OIDC provider.</p>
            </div>

            <div className={'my-6'}>
                <Label>Button Display Name</Label>
                <Input
                    autoComplete={'off'}
                    id={'display_name'}
                    type={'text'}
                    name={'display_name'}
                    onChange={e => update('display_name', e.target.value)}
                    placeholder={settings.displayName || 'SSO'}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    The label shown on the login button (e.g. "Login with Keycloak").
                </p>
            </div>

            <div className={'my-6'}>
                <Label>Extra Scopes</Label>
                <Input
                    autoComplete={'off'}
                    id={'scopes'}
                    type={'text'}
                    name={'scopes'}
                    onChange={e => update('scopes', e.target.value)}
                    placeholder={'groups roles'}
                />
                <p className={'text-xs text-gray-400 mt-1'}>
                    Space-separated list of additional scopes to request. <code>openid email profile</code> are always
                    included.
                </p>
            </div>

            <Alert type={'info'}>
                <div>
                    Use the following Callback URL in your OIDC provider:
                    <p className={'bg-black/50 p-1 rounded-lg font-mono w-fit mt-2'}>
                        /auth/modules/oidc/authenticate
                    </p>
                </div>
            </Alert>
        </AdminBox>
    );
};
