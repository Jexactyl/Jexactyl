import React, { useState } from 'react';
import useFlash from '@/plugins/useFlash';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from '@/state/hooks';
import { ServerContext } from '@/state/server';
import renewServer from '@/api/server/renewServer';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

export default () => {
    const [open, setOpen] = useState(false);
    const { addFlash, clearFlashes } = useFlash();
    const [loading, setLoading] = useState(false);
    const store = useStoreState((state) => state.storefront.data!);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const renewal = ServerContext.useStoreState((state) => state.server.data!.renewal);

    const doRenewal = () => {
        setLoading(true);
        clearFlashes('console:share');

        renewServer(uuid)
            .then(() => {
                setOpen(false);
                setLoading(false);

                addFlash({
                    key: 'console:share',
                    type: 'success',
                    message: '服务器已续订。',
                });
            })
            .catch((error) => {
                setOpen(false);
                setLoading(false);

                console.log(httpErrorToHuman(error));
                addFlash({
                    key: 'console:share',
                    type: 'error',
                    message: '无法续订您的服务器。 你确定你有足够的积分吗？',
                });
            });
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={'确认续费服务器'}
                onConfirmed={() => doRenewal()}
            >
                <SpinnerOverlay visible={loading} />
                您将需要支付 {store.renewals.cost} {store.currency} 以增加 {store.renewals.days} 天，直到您的下一次续订到期。
            </Dialog.Confirm>
            {renewal} 天内{' '}
            <span className={'text-blue-500 text-sm cursor-pointer'} onClick={() => setOpen(true)}>
                {'('}续订{')'}
            </span>
        </>
    );
};
