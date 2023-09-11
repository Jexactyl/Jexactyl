import React from 'react';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
        isLight?: boolean;
    }
>;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, isLight, ...props }: Props) => (
    <div {...props}>
        {title && <h2 css={tw`text-neutral-300 mb-4 px-4 text-2xl`}>{title}</h2>}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <div
            css={[
                tw`p-4 rounded shadow-lg relative`,
                !!borderColor && tw`border-t-4`,
                isLight ? tw`bg-neutral-700` : tw`bg-neutral-800`,
            ]}
        >
            <SpinnerOverlay visible={showLoadingOverlay || false} />
            {children}
        </div>
    </div>
);

export default ContentBox;
