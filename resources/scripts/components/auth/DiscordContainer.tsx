import tw from 'twin.macro';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useFlash from '@/plugins/useFlash';
import discordLogin from '@/api/auth/discord';
import { Button } from '@/components/elements/button/index';
import DiscordFormContainer from '@/components/auth/DiscordFormContainer';

const DiscordContainer = () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const [loading, setLoading] = useState(false);

    const login = () => {
        clearFlashes();
        setLoading(true);

        discordLogin()
            .then((data) => {
                if (!data) return clearAndAddHttpError({ error: 'Discord auth failed. Please try again.' });
                window.location.href = data;
            })
            .then(() => setLoading(false))
            .catch((error) => {
                console.error(error);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <DiscordFormContainer css={tw`w-full flex`}>
            <div css={tw`flex flex-col md:h-full`}>
                <div css={tw`mb-6`}>
                    <h3 css={tw`text-2xl text-neutral-100 font-semibold`}>Discord Authentication</h3>
                    <p css={tw`text-sm text-neutral-400 mt-2`}>
                        Click the button below to authenticate with your Discord account. You&apos;ll be redirected to
                        Discord to authorize access.
                    </p>
                </div>
                <div css={tw`mt-6`}>
                    <Button.Text
                        type={'button'}
                        size={Button.Sizes.Large}
                        css={tw`w-full bg-[#5865F2] hover:bg-[#4752C4] border-[#5865F2] hover:border-[#4752C4]`}
                        onClick={() => login()}
                        disabled={loading}
                    >
                        <svg css={tw`w-5 h-5 mr-2`} fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' />
                        </svg>
                        {loading ? 'Connecting...' : 'Continue with Discord'}
                    </Button.Text>
                </div>
                <div css={tw`mt-4 p-4 bg-neutral-800 rounded-lg border border-neutral-700`}>
                    <p css={tw`text-xs text-neutral-400`}>
                        <strong css={tw`text-neutral-300`}>What happens next?</strong>
                        <br />
                        • You&apos;ll be redirected to Discord&apos;s authorization page
                        <br />
                        • Grant permission to access your Discord profile
                        <br />• You&apos;ll be automatically logged in or registered
                    </p>
                </div>
                <div css={tw`mt-6 text-center`}>
                    <Link
                        to={'/auth/login'}
                        css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                    >
                        ← Return to login
                    </Link>
                </div>
            </div>
        </DiscordFormContainer>
    );
};

export default DiscordContainer;
