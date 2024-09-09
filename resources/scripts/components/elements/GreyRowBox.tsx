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
    ${tw`flex rounded no-underline text-neutral-200 items-center p-4 border border-transparent transition-colors duration-150 overflow-hidden`};

    background-color: ${({ theme }) => theme.colors.secondary};

    ${props => props.$hoverable !== false && tw`hover:border-neutral-500`};

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center bg-neutral-500 p-3`};
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
