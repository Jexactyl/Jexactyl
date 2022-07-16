import tw from 'twin.macro';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import React, { useEffect, useState } from 'react';
import { Actions, useStoreActions } from 'easy-peasy';
import { Dialog } from '@/components/elements/dialog';
import reinstallServer from '@/api/server/reinstallServer';
import { Button } from '@/components/elements/button/index';
import TitledGreyBox from '@/components/elements/TitledGreyBox';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const reinstall = () => {
        clearFlashes('settings');
        reinstallServer(uuid)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: '您的服务器已开始重新安装过程。',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
    }, []);

    return (
        <TitledGreyBox title={'重新安装服务器'} css={tw`relative`}>
            <Dialog.Confirm
                open={modalVisible}
                title={'确认服务器重新安装'}
                confirm={'确认,重装服务器'}
                onClose={() => setModalVisible(false)}
                onConfirmed={reinstall}
            >
                在此过程中，您的服务器将停止运行，并且某些文件可能会被删除或修改，您确定要继续吗？
            </Dialog.Confirm>
            <p css={tw`text-sm`}>
                重新安装您的服务器将停止它，然后重新运行最初设置它的安装脚本.&nbsp;
                <strong css={tw`font-medium`}>
                    在此过程中可能会删除或修改某些文件，请在继续之前备份您的数据。
                </strong>
            </p>
            <div css={tw`mt-6 text-right`}>
                <Button.Danger variant={Button.Variants.Secondary} onClick={() => setModalVisible(true)}>
                    重新安装服务器
                </Button.Danger>
            </div>
        </TitledGreyBox>
    );
};
