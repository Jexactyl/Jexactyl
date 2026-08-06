import { useState } from 'react';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { Dialog } from '@/elements/dialog';
import { Button } from '@/elements/button';
import Input from '@/elements/Input';
import Code from '@/elements/Code';
import { useFlashKey } from '@/plugins/useFlash';
import { deletePasskey, usePasskeys } from '@/api/routes/account/passkeys';

export default ({ name, uuid }: { name: string; uuid: string }) => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const [visible, setVisible] = useState(false);
    const [password, setPassword] = useState('');
    const { mutate } = usePasskeys();

    // Accounts created through an SSO module have no password to confirm against.
    const hasPassword = useStoreState(state => state.user.data!.hasPassword);

    const close = () => {
        setVisible(false);
        setPassword('');
    };

    const onConfirmed = () => {
        if (hasPassword && !password.length) return;

        clearAndAddHttpError();
        close();

        Promise.all([
            mutate(data => data?.filter(value => value.uuid !== uuid), false),
            deletePasskey(uuid, hasPassword ? password : undefined),
        ]).catch(error => {
            mutate(undefined, true).catch(console.error);
            clearAndAddHttpError(error);
        });
    };

    return (
        <>
            <Dialog open={visible} onClose={close} title={'Remove Passkey'}>
                <Dialog.Icon type={'danger'} position={'container'} />
                <p css={tw`text-sm`}>
                    Removing the <Code>{name}</Code> passkey means it can no longer be used to sign in to this account.
                </p>
                {hasPassword && (
                    <div css={tw`mt-6`}>
                        <Input
                            type={'password'}
                            value={password}
                            onChange={e => setPassword(e.currentTarget.value)}
                            placeholder={'Current password'}
                            autoComplete={'current-password'}
                        />
                    </div>
                )}
                <Dialog.Footer>
                    <Button.Text onClick={close}>Cancel</Button.Text>
                    {/* Button drops an explicit `disabled` prop, so the empty-password case is
                        guarded inside onConfirmed instead. */}
                    <Button.Danger onClick={onConfirmed}>Remove Passkey</Button.Danger>
                </Dialog.Footer>
            </Dialog>
            <button css={tw`ml-4 p-2 text-sm`} onClick={() => setVisible(true)}>
                <FontAwesomeIcon
                    icon={faTrashAlt}
                    css={tw`text-neutral-400 hover:text-red-400 transition-colors duration-150`}
                />
            </button>
        </>
    );
};
