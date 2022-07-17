import tw from 'twin.macro';
import { breakpoint } from '@/theme';
import * as Icon from 'react-feather';
import React, { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import styled from 'styled-components/macro';
import { ServerContext } from '@/state/server';
import editServer from '@/api/server/editServer';
import { Dialog } from '@/components/elements/dialog';
import { Button } from '@/components/elements/button/index';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import ServerContentBlock from '@/components/elements/ServerContentBlock';

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

export default () => {
    const [submitting, setSubmitting] = useState(false);
    const [resource, setResource] = useState('');
    const [amount, setAmount] = useState(0);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();

    const edit = (resource: string, amount: number) => {
        clearFlashes('server:edit');
        setSubmitting(true);

        editServer(uuid, resource, amount)
            .then(() => {
                setSubmitting(false);
                addFlash({
                    key: 'server:edit',
                    type: 'success',
                    message: '已成功编辑服务器实例资源。',
                });
            })
            .catch((error) => clearAndAddHttpError({ key: 'server:edit', error }));
    };

    return (
        <ServerContentBlock title={'编辑服务器实例'}>
            <SpinnerOverlay size={'large'} visible={submitting} />
            <Dialog.Confirm
                open={submitting}
                onClose={() => setSubmitting(false)}
                title={'确认资源的编辑'}
                onConfirmed={() => edit(resource, amount)}
            >
                这将从您的帐户中删除相应的资源并添加到您的服务器实例当中。你确定你要继续吗？
            </Dialog.Confirm>
            <FlashMessageRender byKey={'server:edit'} css={tw`mb-4`} />
            <h1 className={'j-left text-5xl'}>编辑资源</h1>
            <h3 className={'j-left text-2xl mt-2 text-neutral-500 mb-10'}>
                从您的服务器实例添加/删除资源。
            </h3>
            <Container css={tw`lg:grid lg:grid-cols-3 gap-4 my-10`}>
                <TitledGreyBox title={'编辑服务器 CPU 限制'} css={tw`mt-8 sm:mt-0`}>
                    <Wrapper>
                        <Icon.Cpu size={40} />
                        <Button.Success
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('cpu');
                                setAmount(50);
                            }}
                        >
                            <Icon.Plus />
                        </Button.Success>
                        <Button.Danger
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('cpu');
                                setAmount(-50);
                            }}
                        >
                            <Icon.Minus />
                        </Button.Danger>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        更改分配给服务器的 CPU 数量。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>限制不能低于 50%。</p>
                </TitledGreyBox>
                <TitledGreyBox title={'编辑服务器内存限制'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.PieChart size={40} />
                        <Button.Success
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('memory');
                                setAmount(1024);
                            }}
                        >
                            <Icon.Plus />
                        </Button.Success>
                        <Button.Danger
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('memory');
                                setAmount(-1024);
                            }}
                        >
                            <Icon.Minus />
                        </Button.Danger>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        更改分配给服务器的内存大小.
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>限制不能低于 1GB。</p>
                </TitledGreyBox>
                <TitledGreyBox title={'编辑服务器存储空间限制'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.HardDrive size={40} />
                        <Button.Success
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('disk');
                                setAmount(1024);
                            }}
                        >
                            <Icon.Plus />
                        </Button.Success>
                        <Button.Danger
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('disk');
                                setAmount(-1024);
                            }}
                        >
                            <Icon.Minus />
                        </Button.Danger>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        更改分配给服务器的存储空间大小。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>限制不能低于 1GB。</p>
                </TitledGreyBox>
                <TitledGreyBox title={'编辑服务器端口数量'} css={tw`mt-8 sm:mt-0`}>
                    <Wrapper>
                        <Icon.Share2 size={40} />
                        <Button.Success
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('allocation_limit');
                                setAmount(1);
                            }}
                        >
                            <Icon.Plus />
                        </Button.Success>
                        <Button.Danger
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('allocation_limit');
                                setAmount(-1);
                            }}
                        >
                            <Icon.Minus />
                        </Button.Danger>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        更改分配给服务器的端口数量。
                    </p>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>限制不能低于 1。</p>
                </TitledGreyBox>
                <TitledGreyBox title={'编辑服务器备份限制'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Archive size={40} />
                        <Button.Success
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('backup_limit');
                                setAmount(1);
                            }}
                        >
                            <Icon.Plus />
                        </Button.Success>
                        <Button.Danger
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('backup_limit');
                                setAmount(-1);
                            }}
                        >
                            <Icon.Minus />
                        </Button.Danger>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        更改分配给服务器的可用备份槽位。
                    </p>
                </TitledGreyBox>
                <TitledGreyBox title={'编辑服务器数据库限制'} css={tw`mt-8 sm:mt-0 sm:ml-8`}>
                    <Wrapper>
                        <Icon.Database size={40} />
                        <Button.Success
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('database_limit');
                                setAmount(1);
                            }}
                        >
                            <Icon.Plus />
                        </Button.Success>
                        <Button.Danger
                            css={tw`ml-4`}
                            onClick={() => {
                                setSubmitting(true);
                                setResource('database_limit');
                                setAmount(-1);
                            }}
                        >
                            <Icon.Minus />
                        </Button.Danger>
                    </Wrapper>
                    <p css={tw`mt-1 text-gray-500 text-xs flex justify-center`}>
                        更改分配给服务器的可用数据库数量。
                    </p>
                </TitledGreyBox>
            </Container>
        </ServerContentBlock>
    );
};
