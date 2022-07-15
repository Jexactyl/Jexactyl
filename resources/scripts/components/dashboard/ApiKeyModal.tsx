import tw from 'twin.macro';
import asModal from '@/hoc/asModal';
import React, { useContext } from 'react';
import ModalContext from '@/context/ModalContext';
import { Button } from '@/components/elements/button/index';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface Props {
    apiKey: string;
}

const ApiKeyModal = ({ apiKey }: Props) => {
    const { dismiss } = useContext(ModalContext);

    return (
        <>
            <h3 css={tw`mb-6 text-2xl`}>你的 API 密钥</h3>
            <p css={tw`text-sm mb-6`}>
                您请求的 API 密钥如下所示。请将其存放在安全的地方，它不会再次显示。
            </p>
            <pre css={tw`text-sm bg-neutral-900 rounded py-2 px-4 font-mono`}>
                <CopyOnClick text={apiKey}>
                    <code css={tw`font-mono`}>{apiKey}</code>
                </CopyOnClick>
            </pre>
            <div css={tw`flex justify-end mt-6`}>
                <Button type={'button'} onClick={() => dismiss()}>
                    关闭
                </Button>
            </div>
        </>
    );
};

ApiKeyModal.displayName = 'ApiKeyModal';

export default asModal<Props>({
    closeOnEscape: false,
    closeOnBackground: false,
})(ApiKeyModal);
