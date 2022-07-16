import React, { useState } from 'react';
import PageContentBlock from '@/components/elements/PageContentBlock';
import tw from 'twin.macro';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import { Button } from '@/components/elements/button';
import renewServer from '@/api/server/renewServer';
import { ServerContext } from '@/state/server';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import deleteServer from '@/api/server/deleteServer';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useStoreState } from '@/state/hooks';
import { Dialog } from '@/components/elements/dialog';

type ModalType = 'renew' | 'delete';

export default () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const renewable = ServerContext.useStoreState((state) => state.server.data?.renewable);
    const store = useStoreState((state) => state.storefront.data!);
    const [isSubmit, setSubmit] = useState(false);
    const [open, setOpen] = useState<ModalType | null>(null);

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);

    const doRenewal = () => {
        clearFlashes('server:renewal');
        setSubmit(true);

        renewServer(uuid)
            .then(() => {
                setSubmit(false);
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'server:renewal', error });
                setSubmit(false);
            });
    };

    const doDeletion = () => {
        clearFlashes('server:renewal');
        setSubmit(true);

        deleteServer(uuid)
            .then(() => {
                setSubmit(false);
                // @ts-expect-error this is valid
                window.location = '/store';
            })
            .catch((error) => {
                clearAndAddHttpError({ key: 'server:renewal', error });
                setSubmit(false);
            });
    };

    const RenewDialog = () => (
        <Dialog.Confirm
            open={open === 'renew'}
            onClose={() => setOpen(null)}
            title={'确认续费服务器'}
            confirm={'继续'}
            onConfirmed={() => doRenewal()}
        >
            <SpinnerOverlay visible={isSubmit} />
            您确定要花费 {store.renewals.cost} {store.currency} 来续费您的服务器实例吗？
        </Dialog.Confirm>
    );

    const DeleteDialog = () => (
        <Dialog.Confirm
            open={open === 'delete'}
            onClose={() => setOpen(null)}
            title={'确认删除服务器'}
            confirm={'继续'}
            onConfirmed={() => doDeletion()}
        >
            <SpinnerOverlay visible={isSubmit} />
            此操作会将您的服务器实例以及所有文件和配置从系统中删除。
        </Dialog.Confirm>
    );

    return (
        <>
            {open && open === 'renew' ? <RenewDialog /> : <DeleteDialog />}
            <PageContentBlock title={'服务器实例已停用'}>
                <FlashMessageRender byKey={'server:renewal'} css={tw`mb-1`} />
                <div css={tw`flex justify-center`}>
                    <div
                        css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 bg-neutral-900 rounded-lg shadow-lg text-center relative`}
                    >
                        <img src={ServerErrorSvg} css={tw`w-2/3 h-auto select-none mx-auto`} />
                        <h2 css={tw`mt-10 font-bold text-4xl`}>已停用</h2>
                        {renewable ? (
                            <>
                                <p css={tw`text-sm my-2`}>
                                    您的服务器因未按时更新而被暂停。&apos;续订&apos; 按钮以重新激活您的服务器实例。如果您想删除服务器实例，则资源将自动退回您的帐户中，以便您的下次重新部署新的服务器实例。
                                </p>
                                <Button className={'mx-2 my-1'} onClick={() => setOpen('renew')} disabled={isSubmit}>
                                    立即续订
                                </Button>
                                <Button.Danger
                                    className={'mx-2 my-1'}
                                    onClick={() => setOpen('delete')}
                                    disabled={isSubmit}
                                >
                                    删除服务器
                                </Button.Danger>
                            </>
                        ) : (
                            <>此服务器已停用，无法访问。</>
                        )}
                    </div>
                </div>
            </PageContentBlock>
        </>
    );
};
