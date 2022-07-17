import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import * as Icon from 'react-feather';
import React, { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import styled from 'styled-components/macro';
import { useStoreState } from '@/state/hooks';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import purchaseResource from '@/api/store/purchaseResource';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
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
    ${tw`flex flex-row justify-center items-center`};
`;

export default () => {
    const [open, setOpen] = useState(false);
    const [resource, setResource] = useState('');

    const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();
    const cost = useStoreState((state) => state.storefront.data!.cost);
    const currency = useStoreState((state) => state.storefront.data!.currency);

    const purchase = (resource: string) => {
        clearFlashes('store:resources');

        purchaseResource(resource)
            .then(() =>
                addFlash({
                    type: 'success',
                    key: 'store:resources',
                    message: '资源已成功添加至你的账户。',
                })
            )
            .catch((error) => {
                clearAndAddHttpError({ key: 'store:resources', error });
            });
    };

    return (
        <PageContentBlock title={'商店商品'} showFlashKey={'store:resources'}>
            <SpinnerOverlay size={'large'} visible={open} />
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={'确认资源选择'}
                confirm={'确认'}
                onConfirmed={() => purchase(resource)}
            >
                您确定要购买此资源吗？这将从您的帐户中扣除积分并添加资源，且无法退还。
            </Dialog.Confirm>
            <h1 className={'j-left text-5xl'}>购买资源</h1>
            <h3 className={'j-left text-2xl text-neutral-500'}>购买更多资源以添加到您的服务器。</h3>
            <Container className={'j-up lg:grid lg:grid-cols-3 my-10'}>
                <TitledGreyBox title={'购买 CPU'} css={tw`mt-8 sm:mt-0`}>
                    <Wrapper>
                        <Icon.Cpu size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('cpu');
                            }}
                        >
                            +50% CPU
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        购买 CPU 以提高服务器性能。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每 50% CPU: {cost.cpu} {currency}
                    </p>
                </TitledGreyBox>
                <TitledGreyBox title={'购买内存'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.PieChart size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('memory');
                            }}
                        >
                            +1GB 内存
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        购买内存以提高服务器性能。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每 1GB 内存: {cost.memory} {currency}
                    </p>
                </TitledGreyBox>
                <TitledGreyBox title={'购买存储空间'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.HardDrive size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('disk');
                            }}
                        >
                            +1GB 存储空间
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        购买存储空间以提高服务器容量。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每 1GB 存储空间: {cost.disk} {currency}
                    </p>
                </TitledGreyBox>
            </Container>
            <Container className={'j-up lg:grid lg:grid-cols-4 my-10'}>
                <TitledGreyBox title={'购买实例槽位'} css={tw`mt-8 sm:mt-0`}>
                    <Wrapper>
                        <Icon.Server size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('slots');
                            }}
                        >
                            +1 实例槽位
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        购买服务器位以部署服务器实例。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每个位置: {cost.slot} {currency}
                    </p>
                </TitledGreyBox>
                <TitledGreyBox title={'购买服务器端口'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Share2 size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('ports');
                            }}
                        >
                            +1 端口
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        购买端口以连接到您的服务器。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每个端口: {cost.port} {currency}
                    </p>
                </TitledGreyBox>
                <TitledGreyBox title={'购买服务器备份槽位'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Archive size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('backups');
                            }}
                        >
                            +1 备份槽位
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        购买备份槽位来保护你的数据。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每个备份槽位: {cost.backup} {currency}
                    </p>
                </TitledGreyBox>
                <TitledGreyBox title={'购买服务器数据库'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Database size={40} />
                        <Button.Success
                            variant={Button.Variants.Secondary}
                            css={tw`ml-4`}
                            onClick={() => {
                                setOpen(true);
                                setResource('databases');
                            }}
                        >
                            +1 数据库
                        </Button.Success>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>购买数据库来存储数据。</p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        每个数据库: {cost.database} {currency}
                    </p>
                </TitledGreyBox>
            </Container>
        </PageContentBlock>
    );
};
