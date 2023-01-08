import React from 'react';
import { useStoreState } from '@/state/hooks';
import { Button } from '@/components/elements/button';
import { linkDiscord, unlinkDiscord } from '@/api/account/discord';

export default () => {
    const discordId = useStoreState((state) => state.user.data!.discordId);

    const link = () => {
        linkDiscord().then((data) => {
            window.location.href = data;
        });
    };

    const unlink = () => {
        unlinkDiscord().then(() => {
            window.location.href = '/account';
        });
    };

    return (
        <>
            {discordId ? (
                <>
                    <p className={'text-gray-400'}>Your account is currently linked to the Discord: {discordId}</p>
                    <Button.Success className={'mt-4'} onClick={() => unlink()}>
                        Unlink Discord Account
                    </Button.Success>
                </>
            ) : (
                <>
                    <p className={'text-gray-400'}>Your account is not linked to Discord.</p>
                    <Button.Success className={'mt-4'} onClick={() => link()}>
                        Link Discord Account
                    </Button.Success>
                </>
            )}
        </>
    );
};
