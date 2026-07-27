import { memo } from 'react';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import { useStoreState } from '@/state/hooks';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div
            css={tw`rounded-xl shadow-lg ring-1 ring-white/5 overflow-hidden transition-shadow duration-300 hover:shadow-xl`}
            style={{ backgroundColor: colors.secondary }}
            className={className}
        >
            <div css={tw`p-3 border-b border-black/40 backdrop-blur-sm`} style={{ backgroundColor: colors.headers }}>
                {typeof title === 'string' ? (
                    <p css={tw`text-sm font-semibold tracking-wide`}>
                        {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-neutral-300`} />}
                        {title}
                    </p>
                ) : (
                    title
                )}
            </div>
            <div css={tw`p-3`}>{children}</div>
        </div>
    );
};

export default memo(TitledGreyBox, isEqual);
