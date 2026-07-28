import { useRef, useState } from 'react';
import { Actions, useStoreActions } from 'easy-peasy';
import tw from 'twin.macro';
import Input from '@/elements/Input';
import Label from '@/elements/Label';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import Avatar from '@/elements/Avatar';
import { Button } from '@/elements/button/index';
import { httpErrorToHuman } from '@/api/http';
import { ApplicationStore } from '@/state';

export default () => {
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const { updateUserAvatarUrl, uploadUserAvatar, removeUserAvatar } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.user,
    );
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const withFlashHandling = (promise: Promise<void>, message: string) => {
        clearFlashes('account:avatar');
        setLoading(true);

        promise
            .then(() => addFlash({ type: 'success', key: 'account:avatar', message }))
            .catch(error =>
                addFlash({ type: 'error', key: 'account:avatar', title: 'Error', message: httpErrorToHuman(error) }),
            )
            .then(() => setLoading(false));
    };

    const submitUrl = () => {
        if (!avatarUrl.trim()) {
            return;
        }

        withFlashHandling(updateUserAvatarUrl(avatarUrl.trim()), 'Your avatar has been updated.');
        setAvatarUrl('');
    };

    const submitFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        withFlashHandling(uploadUserAvatar(file), 'Your avatar has been updated.');
        e.target.value = '';
    };

    const remove = () => {
        withFlashHandling(removeUserAvatar(), 'Your avatar has been reset to the default.');
    };

    return (
        <div css={tw`relative`}>
            <SpinnerOverlay size={'large'} visible={loading} />

            <div css={tw`flex items-center mb-6`}>
                <Avatar.User size={64} />
            </div>

            <Label htmlFor={'avatar_url'}>Avatar URL</Label>
            <Input
                id={'avatar_url'}
                type={'text'}
                placeholder={'https://example.com/avatar.png'}
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
            />
            <div css={tw`mt-4 flex flex-wrap gap-2`}>
                <Button type={'button'} disabled={!avatarUrl.trim() || loading} onClick={submitUrl}>
                    Use Link
                </Button>
                <Button.Text type={'button'} disabled={loading} onClick={() => fileInput.current?.click()}>
                    Upload Image
                </Button.Text>
                <Button.Text type={'button'} disabled={loading} onClick={remove}>
                    Remove Avatar
                </Button.Text>
            </div>
            <input ref={fileInput} type={'file'} accept={'image/*'} onChange={submitFile} css={tw`hidden`} />
        </div>
    );
};
