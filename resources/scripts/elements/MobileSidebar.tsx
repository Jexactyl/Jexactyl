import { ElementType, ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import { HomeIcon } from '@heroicons/react/outline';
import { withSubComponents } from '@/lib/helpers';

const MobileSidebar = ({ children }: { children: ReactNode[] }) => {
    return (
        <div
            className={
                'block md:hidden w-full fixed bottom-0 h-16 z-50 rounded-t-2xl bg-black/70 backdrop-blur-lg border-t border-white/10 shadow-[0_-8px_24px_rgba(0,0,0,0.3)]'
            }
        >
            <div className={'flex h-full px-8 space-x-8 overflow-x-auto'}>{children}</div>
        </div>
    );
};

const Link = ({
    icon: Icon,
    text,
    linkTo,
    end,
}: {
    icon: ElementType;
    text?: string;
    linkTo: string;
    end?: boolean;
}) => {
    const [active, setActive] = useState<boolean>(false);
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <NavLink
            to={linkTo}
            end={end}
            className={({ isActive }) =>
                `h-full flex items-center justify-center font-semibold transition-all duration-300 active:scale-90 ${
                    isActive ? setActive(true) : setActive(false)
                } ${isActive ? 'scale-105' : ''}`
            }
            style={{ color: active ? colors.primary : '' }}
        >
            {Icon && <Icon className={'w-4 h-4 mr-2 transition-transform duration-300'} />}
            {text}
        </NavLink>
    );
};

const Home = () => {
    const { colors } = useStoreState(s => s.theme.data!);
    return (
        <>
            <NavLink to={'/'} className={'active:scale-90 transition-transform duration-200'}>
                <div className={'h-full flex items-center justify-center font-semibold my-auto'}>
                    <HomeIcon className={'w-5 h-5 brightness-150'} style={{ color: colors.primary }} />
                </div>
            </NavLink>
            <div className={'mx-3 my-auto'}>&bull;</div>
        </>
    );
};

export default withSubComponents(MobileSidebar, { Link, Home });
