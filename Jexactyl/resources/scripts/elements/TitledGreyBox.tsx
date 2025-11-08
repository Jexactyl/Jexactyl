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
        <div css={tw`shadow-md`} style={{ backgroundColor: colors.secondary }} className={className}>
            <div css={tw`p-3 border-b border-black`} style={{ backgroundColor: colors.headers }}>
                {typeof title === 'string' ? (
                    <p css={tw`text-sm font-semibold`}>
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
