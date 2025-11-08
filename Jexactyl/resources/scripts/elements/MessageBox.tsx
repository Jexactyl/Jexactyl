import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-600/25`;
        case 'info':
            return tw`bg-blue-600/25`;
        case 'success':
            return tw`bg-green-600/25`;
        case 'warning':
            return tw`bg-yellow-600/25`;
        default:
            return '';
    }
};

const getBackground = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-500`;
        case 'info':
            return tw`bg-primary-500`;
        case 'success':
            return tw`bg-green-500`;
        case 'warning':
            return tw`bg-yellow-500`;
        default:
            return '';
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-3 items-center leading-normal rounded-full flex w-full text-sm text-white mx-4`};
    ${props => styling(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => {
    const [open, setOpen] = useState(true);

    return (
        <>
            {open && (
                <Container className={'lg:inline-flex'} $type={type} role={'alert'}>
                    {title && (
                        <span
                            className={'title'}
                            css={[
                                tw`flex rounded-full uppercase px-2 py-1 text-xs font-bold mr-3 leading-none`,
                                getBackground(type),
                            ]}
                        >
                            {title}
                        </span>
                    )}
                    <span css={tw`mr-2 text-left flex-auto`}>{children}</span>
                    <span
                        className={
                            'text-right text-gray-400 font-medium cursor-pointer hover:text-gray-300 duration-300'
                        }
                    >
                        <FontAwesomeIcon icon={faXmark} onClick={() => setOpen(false)} />
                    </span>
                </Container>
            )}
        </>
    );
};
MessageBox.displayName = 'MessageBox';

export default MessageBox;
