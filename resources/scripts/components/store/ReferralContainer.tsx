import tw from 'twin.macro';
import { format } from 'date-fns';
import { breakpoint } from '@/theme';
import * as Icon from 'react-feather';
import styled from 'styled-components/macro';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/elements/button';
import { Dialog } from '@/components/elements/dialog';
import GreyRowBox from '@/components/elements/GreyRowBox';
import ContentBox from '@/components/elements/ContentBox';
import useFlash, { useFlashKey } from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import deleteReferralCode from '@/api/account/deleteReferralCode';
import createReferralCode from '@/api/account/createReferralCode';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import PageContentBlock from '@/components/elements/PageContentBlock';
import getReferralCodes, { ReferralCode } from '@/api/account/getReferralCodes';
import { useStoreState } from '@/state/hooks';

const Container = styled.div`
    ${tw`flex flex-wrap`};

    & > div {
        ${tw`w-full`};

        ${breakpoint('sm')`
      width: calc(50% - 1rem);
    `}

        ${breakpoint('md')`
      ${tw`w-auto flex-1`};
    `}
    }
`;

export default () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const reward = useStoreState((state) => state.storefront.data?.referrals.reward);
    const [codes, setCodes] = useState<ReferralCode[]>([]);
    const { addFlash } = useFlash();
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('referrals');

    useEffect(() => {
        clearFlashes();
        getReferralCodes()
            .then((codes) => setCodes(codes))
            .then(() => setLoading(false))
            .catch((error) => clearAndAddHttpError(error));
    }, []);

    const doCreation = () => {
        clearFlashes();
        setLoading(true);

        createReferralCode()
            .then(() => {
                getReferralCodes().then((codes) => setCodes(codes));
                addFlash({
                    type: 'success',
                    key: 'referrals',
                    message: '推广码已创建。',
                });
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
            });
    };

    const doDeletion = (code: string) => {
        clearFlashes();
        setLoading(true);

        deleteReferralCode(code)
            .then(() => {
                getReferralCodes().then((codes) => setCodes(codes));
                addFlash({
                    type: 'success',
                    key: 'referrals',
                    message: '推广码已删除。',
                });
            })
            .catch((error) => clearAndAddHttpError(error))
            .then(() => {
                setLoading(false);
                setCode('');
            });
    };

    return (
        <PageContentBlock title={'推广'}>
            <h1 className={'j-left text-5xl'}>推广</h1>
            <h3 className={'j-left text-2xl mt-2 text-neutral-500'}>创建推广码共享给其他人</h3>
            <FlashMessageRender byKey={'referrals'} className={'mt-2'} />
            <Container className={'j-up lg:grid lg:grid-cols-3 my-10'}>
                <ContentBox title={'你的推广码'} css={tw`sm:mt-0`}>
                    <Dialog.Confirm
                        title={'删除推广码'}
                        confirm={'删除'}
                        open={!!code}
                        onClose={() => setCode('')}
                        onConfirmed={() => doDeletion(code)}
                    >
                        用户将无法再使用此推广码进行注册。
                    </Dialog.Confirm>
                    <SpinnerOverlay visible={loading} />
                    {codes.length === 0 ? (
                        <p css={tw`text-center my-2`}>{!loading && '此账户下无可用推广码。'}</p>
                    ) : (
                        codes.map((code, index) => (
                            <GreyRowBox
                                key={code.code}
                                css={[tw`bg-neutral-900 flex items-center`, index > 0 && tw`mt-2`]}
                            >
                                <Icon.GitBranch css={tw`text-neutral-300`} />
                                <div css={tw`ml-4 flex-1 overflow-hidden`}>
                                    <p css={tw`text-sm break-words`}>{code.code}</p>
                                    <p css={tw`text-2xs text-neutral-300 uppercase`}>
                                        创建于:&nbsp;
                                        {code.createdAt ? format(code.createdAt, 'MMM do, yyyy HH:mm') : '从未'}
                                    </p>
                                </div>
                                <button css={tw`ml-4 p-2 text-sm`} onClick={() => setCode(code.code)}>
                                    <Icon.Trash
                                        css={tw`text-neutral-400 hover:text-red-400 transition-colors duration-150`}
                                    />
                                </button>
                            </GreyRowBox>
                        ))
                    )}
                    <Button onClick={() => doCreation()} className={'mt-4'}>
                        创建
                    </Button>
                </ContentBox>
                <ContentBox title={'可用特权'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <h1 css={tw`text-xl`}>
                        你每邀请一个用户，你将获得 <span className={'text-green-500'}>{reward}</span> 积分。
                    </h1>
                </ContentBox>
                <ContentBox title={'已邀请的用户'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <h1 css={tw`text-gray-400`}>目前无法查看统计信息。</h1>
                </ContentBox>
            </Container>
        </PageContentBlock>
    );
};
