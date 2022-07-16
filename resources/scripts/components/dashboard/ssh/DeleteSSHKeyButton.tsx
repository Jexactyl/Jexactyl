import tw from 'twin.macro';
import * as Icon from 'react-feather';
import React, { useState } from 'react';
import Code from '@/components/elements/Code';
import { useFlashKey } from '@/plugins/useFlash';
import { Dialog } from '@/components/elements/dialog';
import { deleteSSHKey, useSSHKeys } from '@/api/account/ssh-keys';

export default ({ name, fingerprint }: { name: string; fingerprint: string }) => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const [visible, setVisible] = useState(false);
    const { mutate } = useSSHKeys();

    const onClick = () => {
        clearAndAddHttpError();

        Promise.all([
            mutate((data) => data?.filter((value) => value.fingerprint !== fingerprint), false),
            deleteSSHKey(fingerprint),
        ]).catch((error) => {
            mutate(undefined, true).catch(console.error);
            clearAndAddHttpError(error);
        });
    };

    return (
        <>
            <Dialog.Confirm
                open={visible}
                title={'SSH 密钥删除确定'}
                confirm={'确定删除'}
                onConfirmed={onClick}
                onClose={() => setVisible(false)}
            >
                删除 <Code>{name}</Code> SSH 密钥将使其在整个面板中的使用无效。
            </Dialog.Confirm>
            <button css={tw`ml-4 p-2 text-sm`} onClick={() => setVisible(true)}>
                <Icon.Trash css={tw`text-neutral-400 hover:text-red-400 transition-colors duration-150`} />
            </button>
        </>
    );
};
