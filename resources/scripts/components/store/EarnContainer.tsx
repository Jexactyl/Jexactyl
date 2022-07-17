import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import styled from 'styled-components/macro';
import { useStoreState } from '@/state/hooks';
import React, { useEffect, useState } from 'react';
import ContentBox from '@/components/elements/ContentBox';
import StoreError from '@/components/store/error/StoreError';
import { getResources, Resources } from '@/api/store/getResources';
import PageContentBlock from '@/components/elements/PageContentBlock';

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
    const [resources, setResources] = useState<Resources>();
    const earn = useStoreState((state) => state.storefront.data!.earn);
    const store = useStoreState((state) => state.storefront.data!);

    useEffect(() => {
        getResources().then((resources) => setResources(resources));
    }, []);

    if (!resources) return <StoreError />;

    return (
        <PageContentBlock title={'账户余额'}>
            <h1 className={'j-left text-5xl'}>获取积分</h1>
            <h3 className={'j-left text-2xl mt-2 text-neutral-500'}>通过我们设置的一些途径免费获得积分。</h3>
            <Container className={'j-up lg:grid lg:grid-cols-3 my-10'}>
                <ContentBox title={'当前账户余额'} showFlashes={'earn:balance'} css={tw`sm:mt-0`}>
                    <h1 css={tw`text-7xl flex justify-center items-center`}>
                        ${resources.balance} {store.currency}
                    </h1>
                </ContentBox>
                <ContentBox title={'获取速度'} showFlashes={'earn:rate'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <h1 css={tw`text-7xl flex justify-center items-center`}>
                        {earn.amount} {store.currency} / 每分钟
                    </h1>
                </ContentBox>
                <ContentBox title={'如何获取'} showFlashes={'earn:how'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <p>您可以通过打开此面板的任何页面来获得积分。</p>
                    <p css={tw`mt-1`}>
                        只要网站一直在浏览器中打开，每分钟都会向你的账户添加<span css={tw`text-green-500`}>&nbsp;{earn.amount}&nbsp;</span>积分.
                    </p>
                </ContentBox>
            </Container>
        </PageContentBlock>
    );
};
