import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from '@heroicons/react/outline';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-600/20 border-red-500/40`;
        case 'info':
            return tw`bg-blue-600/20 border-blue-500/40`;
        case 'success':
            return tw`bg-green-600/20 border-green-500/40`;
        case 'warning':
            return tw`bg-yellow-600/20 border-yellow-500/40`;
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
    ${tw`p-3 items-center leading-normal rounded-full flex w-full text-sm text-white mx-4 border backdrop-blur-md shadow-lg`};
    ${props => styling(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => {
    const [open, setOpen] = useState(true);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 24, scale: 0.95, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
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
                        <button
                            type={'button'}
                            aria-label={'Dismiss'}
                            onClick={() => setOpen(false)}
                            className={
                                'inline-flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-gray-200 duration-150 hover:rotate-90 transition-transform'
                            }
                        >
                            <XIcon className={'w-4 h-4'} />
                        </button>
                    </Container>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
MessageBox.displayName = 'MessageBox';

export default MessageBox;
