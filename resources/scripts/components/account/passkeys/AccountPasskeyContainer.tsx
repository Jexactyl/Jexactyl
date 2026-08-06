import { useEffect } from 'react';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';

import ContentBox from '@/elements/ContentBox';
import SpinnerOverlay from '@/elements/SpinnerOverlay';
import GreyRowBox from '@/elements/GreyRowBox';
import { usePasskeys } from '@/api/routes/account/passkeys';
import { useFlashKey } from '@/plugins/useFlash';
import CreatePasskeyForm from '@account/passkeys/CreatePasskeyForm';
import DeletePasskeyButton from '@account/passkeys/DeletePasskeyButton';

export default () => {
    const { clearAndAddHttpError } = useFlashKey('account');
    const { data, isValidating, error } = usePasskeys({
        revalidateOnMount: true,
        revalidateOnFocus: false,
    });

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <div css={tw`md:flex flex-nowrap my-10`}>
            <ContentBox title={'Add Passkey'} css={tw`flex-none w-full md:w-1/2`}>
                <CreatePasskeyForm />
            </ContentBox>
            <ContentBox title={'Passkeys'} css={tw`flex-1 overflow-hidden mt-8 md:mt-0 md:ml-8`}>
                <SpinnerOverlay visible={!data && isValidating} />
                {!data || !data.length ? (
                    <p css={tw`text-center text-sm`}>{!data ? 'Loading...' : 'No passkeys exist for this account.'}</p>
                ) : (
                    data.map((passkey, index) => (
                        <GreyRowBox
                            key={passkey.uuid}
                            css={[tw`bg-black/50 flex space-x-4 items-center`, index > 0 && tw`mt-2`]}
                        >
                            <FontAwesomeIcon icon={faFingerprint} css={tw`text-neutral-300`} />
                            <div css={tw`flex-1`}>
                                <p css={tw`text-lg font-bold break-words`}>{passkey.name}</p>
                                <p css={tw`text-xs mt-1 text-gray-400 uppercase`}>
                                    Last used:&nbsp;
                                    {passkey.lastUsedAt ? passkey.lastUsedAt.toLocaleString() : 'Never'}
                                </p>
                                <p css={tw`text-xs mt-1 text-gray-400 uppercase`}>
                                    Added on:&nbsp;
                                    {passkey.createdAt.toLocaleString()}
                                </p>
                            </div>
                            <DeletePasskeyButton name={passkey.name} uuid={passkey.uuid} />
                        </GreyRowBox>
                    ))
                )}
            </ContentBox>
        </div>
    );
};
