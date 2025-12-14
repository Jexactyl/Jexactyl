import React, { useEffect } from 'react';
import { useStoreState } from '@/state/hooks';
import { Button } from '@/components/elements/button';
import { linkDiscord, unlinkDiscord } from '@/api/account/discord';
import useFlash from '@/plugins/useFlash';

export default () => {
    const discordId = useStoreState((state) => state.user.data!.discordId);
    const { clearFlashes, addFlash } = useFlash();

    useEffect(() => {
        // Check for error parameter in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        
        if (error === 'discord_already_linked') {
            addFlash({
                key: 'account:discord',
                type: 'error',
                message: 'This Discord account is already linked to another user.',
            });
            // Remove error parameter from URL
            window.history.replaceState({}, '', '/account');
        }
    }, []);

    const link = () => {
        clearFlashes('account:discord');
        linkDiscord().then((data) => {
            window.location.href = data;
        });
    };

    const unlink = () => {
        clearFlashes('account:discord');
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
