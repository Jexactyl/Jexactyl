import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import * as Icon from 'react-feather';
import { Link } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import styled from 'styled-components/macro';
import { megabytesToHuman } from '@/helpers';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/elements/button/index';
import PlusSquareSvg from '@/assets/images/plus_square.svg';
import StoreError from '@/components/store/error/StoreError';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import DivideSquareSvg from '@/assets/images/divide_square.svg';
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

const Wrapper = styled.div`
    ${tw`text-2xl flex flex-row justify-center items-center`};
`;

const OverviewContainer = () => {
    const [resources, setResources] = useState<Resources>();
    const username = useStoreState((state) => state.user.data!.username);

    useEffect(() => {
        getResources().then((resources) => setResources(resources));
    }, []);

    const redirect = (url: string) => {
        // @ts-expect-error this is valid
        window.location = `/store/${url}`;
    };

    if (!resources) return <StoreError />;

    return (
        <PageContentBlock title={'商店概览'}>
            <h1 className={'j-left text-5xl'}>👋 Hey, {username}!</h1>
            <h3 className={'j-left text-2xl mt-2 text-neutral-500'}>欢迎来到服务器商店。</h3>
            <Container className={'j-right lg:grid lg:grid-cols-3 my-10'}>
                <TitledGreyBox title={'总 CPU'} css={tw`mt-8 sm:mt-0`}>
                    <Wrapper>
                        <Icon.Cpu css={tw`mr-2`} /> {resources.cpu}%
                    </Wrapper>
                </TitledGreyBox>
                <TitledGreyBox title={'总内存'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.PieChart css={tw`mr-2`} /> {megabytesToHuman(resources.memory)}
                    </Wrapper>
                </TitledGreyBox>
                <TitledGreyBox title={'总存储空间'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.HardDrive css={tw`mr-2`} /> {megabytesToHuman(resources.disk)}
                    </Wrapper>
                </TitledGreyBox>
            </Container>
            <Container className={'j-left lg:grid lg:grid-cols-4 my-10'}>
                <TitledGreyBox title={'总实例槽位'} css={tw`mt-8 sm:mt-0`}>
                    <Wrapper>
                        <Icon.Server css={tw`mr-2`} /> {resources.slots}
                    </Wrapper>
                </TitledGreyBox>
                <TitledGreyBox title={'总端口数'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Share2 css={tw`mr-2`} /> {resources.ports}
                    </Wrapper>
                </TitledGreyBox>
                <TitledGreyBox title={'总备份数'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Archive css={tw`mr-2`} /> {resources.backups}
                    </Wrapper>
                </TitledGreyBox>
                <TitledGreyBox title={'总数据库数'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Database css={tw`mr-2`} /> {resources.databases}
                    </Wrapper>
                </TitledGreyBox>
            </Container>
            <Container css={tw`lg:grid lg:grid-cols-2 my-10`}>
                <TitledGreyBox title={'创建服务器实例'} className={'j-right'}>
                    <div css={tw`md:flex w-full p-6 md:pl-0 mx-1`}>
                        <div css={tw`flex-none select-none mb-6 md:mb-0 self-center`}>
                            <img src={PlusSquareSvg} css={tw`block w-32 md:w-48 mx-auto p-8`} />
                        </div>
                        <div css={tw`flex-1`}>
                            <h2 css={tw`text-xl mb-2`}>创建服务器实例</h2>
                            <p>
                                使用您选择的资源、服务器类型等来创建您的服务器。
                                随时删除或者编辑您的服务器以充分利用您的可用资源。
                            </p>
                            <Link to={'/store/create'}>
                                <Button css={tw`mt-6 w-full`} size={Button.Sizes.Large}>
                                    创建
                                </Button>
                            </Link>
                        </div>
                    </div>
                </TitledGreyBox>
                <TitledGreyBox title={'编辑服务器资源'} className={'j-left mt-8 sm:mt-0 sm:ml-8'}>
                    <div css={tw`md:flex w-full p-6 md:pl-0 mx-1`}>
                        <div css={tw`flex-none select-none mb-6 md:mb-0 self-center`}>
                            <img src={DivideSquareSvg} css={tw`block w-32 md:w-48 mx-auto p-8`} />
                        </div>
                        <div css={tw`flex-1`}>
                            <h2 css={tw`text-xl mb-2`}>编辑您的服务器资源</h2>
                            <p>
                                想要从您的服务器中添加或删除资源，或者完全删除它？使用编辑功能立即对您的服务器进行更改。
                            </p>
                            <Button css={tw`mt-6 w-full`} size={Button.Sizes.Large} onClick={() => redirect('edit')}>
                                编辑
                            </Button>
                        </div>
                    </div>
                </TitledGreyBox>
            </Container>
        </PageContentBlock>
    );
};

export default OverviewContainer;
