import React from 'react';
import { ServerContext } from '@/state/server';
import ScreenBlock from '@/components/elements/ScreenBlock';
import ServerInstallSvg from '@/assets/images/server_installing.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import ServerRestoreSvg from '@/assets/images/server_restore.svg';

export default () => {
    const status = ServerContext.useStoreState((state) => state.server.data?.status || null);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data?.isTransferring || false);

    return status === 'installing' || status === 'install_failed' ? (
        <ScreenBlock
            title={'正在运行安装程序'}
            image={ServerInstallSvg}
            message={'此服务器应该很快就准备好了，请几分钟后再试。'}
        />
    ) : status === 'suspended' ? (
        <ScreenBlock
            title={'服务器已冻结'}
            image={ServerErrorSvg}
            message={'此服务器已被冻结，您目前无法访问此服务器。'}
        />
    ) : (
        <ScreenBlock
            title={isTransferring ? '转移中' : '回档中'}
            image={ServerRestoreSvg}
            message={
                isTransferring
                    ? '您的服务器正在转移到新节点服务器，请稍后再回来查看。'
                    : '您的服务器当前正在从备份中恢复，请过几分钟再来查看。'
            }
        />
    );
};
