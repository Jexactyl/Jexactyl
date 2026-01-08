import { useStoreState } from '@/state/hooks';
import classNames from 'classnames';
import type { ComponentType, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import tw, { styled } from 'twin.macro';
import { SiteTheme } from '@/state/theme';

const StyledSubNavigation = styled.div<{ $theme: SiteTheme }>`
    ${tw`flex flex-row items-center flex-shrink-0 h-12 mb-4 border-b border-neutral-700 overflow-x-auto`};

    & > a {
        ${tw`flex flex-row items-center h-full px-4 border-b text-base whitespace-nowrap border-transparent`};

        & > svg {
            ${tw`w-6 h-6 mr-2`};
        }

        &:active,
        &.active {
            color: ${({ $theme }) => $theme.colors.primary};
            border-color: ${({ $theme }) => $theme.colors.primary};
        }
    }
`;

export const SubNavigation = ({ children }: { children: ReactNode }) => {
    const theme = useStoreState(state => state.theme.data!);
    return <StyledSubNavigation $theme={theme}>{children}</StyledSubNavigation>;
};

interface Props {
    to: string;
    name: string;
    base?: boolean;
    disabled?: boolean;
}

interface PropsWithIcon extends Props {
    icon: ComponentType;
    children?: never;
}

interface PropsWithoutIcon extends Props {
    icon?: never;
    children: ReactNode;
}

export const SubNavigationLink = ({
    base,
    to,
    name,
    icon: IconComponent,
    children,
    disabled,
}: PropsWithIcon | PropsWithoutIcon) => (
    <NavLink to={to} end={base} className={classNames(disabled ? 'text-gray-500' : 'text-neutral-300')}>
        {IconComponent ? <IconComponent /> : children}
        {name}
    </NavLink>
);
