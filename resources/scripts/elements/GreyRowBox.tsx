import tw from 'twin.macro';
import styled from 'styled-components';
import { SiteTheme } from '@/state/theme';
import { useStoreState } from '@/state/hooks';
import { ReactNode } from 'react';

interface Props {
    $hoverable?: boolean;
    children: ReactNode;
    className?: string;
}

const GreyRowBox = styled.div<{ $hoverable?: boolean; theme: SiteTheme }>`
    ${tw`flex rounded-xl no-underline text-neutral-200 items-center p-4 border border-white/5 shadow-sm transition-all duration-200 overflow-hidden`};

    background-color: ${({ theme }) => theme.colors.secondary};

    ${props =>
        props.$hoverable !== false &&
        tw`hover:border-neutral-500 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-white/10`};

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center bg-neutral-500 p-3 shadow-inner`};
    }
`;

export default (props: Props) => {
    const theme = useStoreState(state => state.theme.data!);

    return (
        <GreyRowBox $hoverable={props.$hoverable} theme={theme} className={props.className}>
            {props.children}
        </GreyRowBox>
    );
};
