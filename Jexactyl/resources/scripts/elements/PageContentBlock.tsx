import type { ReactNode } from 'react';
import { useEffect } from 'react';
import tw from 'twin.macro';
import ContentContainer from '@/elements/ContentContainer';
import FlashMessageRender from '@/elements/FlashMessageRender';

export interface PageContentBlockProps {
    children?: ReactNode;

    title?: string;
    header?: boolean;
    description?: string;
    className?: string;
    showFlashKey?: string;
}

function PageContentBlock({ title, header, description, showFlashKey, className, children }: PageContentBlockProps) {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <>
            <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                {header && (
                    <div className={'text-3xl lg:text-5xl font-bold mt-8 mb-12'}>
                        {title}
                        {description && <p className={'text-gray-400 font-normal text-sm mt-1'}>{description}</p>}
                    </div>
                )}
                {children}
            </ContentContainer>

            <ContentContainer css={tw`mb-4`}>
                <p css={tw`text-center text-neutral-500 text-xs`}>
                    Powered by&nbsp;
                    <a
                        rel={'noopener nofollow noreferrer'}
                        href={'https://jexpanel.com'}
                        target={'_blank'}
                        css={tw`no-underline text-neutral-500 hover:text-neutral-300`}
                    >
                        Jexpanel.com
                    </a>
                </p>
            </ContentContainer>
        </>
    );
}

export default PageContentBlock;
