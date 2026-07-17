import { ElementType, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreState } from '@/state/hooks';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { withSubComponents } from '@/lib/helpers';

const MobileSidebar = ({ children }: { children: ReactNode[] }) => {
    return (
        <nav
            aria-label={'Mobile navigation'}
            className={
                'fixed inset-x-0 bottom-0 z-50 block border-t border-white/10 bg-black/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden'
            }
        >
            <div className={'flex h-16 items-stretch gap-1 overflow-x-auto overscroll-x-contain px-2'}>{children}</div>
        </nav>
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
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <NavLink
            to={linkTo}
            end={end}
            aria-label={text}
            className={({ isActive }) =>
                `flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 px-2 text-xs font-semibold transition-colors duration-200 ${
                    isActive ? 'bg-white/10' : 'text-neutral-300'
                }`
            }
            style={({ isActive }) => ({ color: isActive ? colors.primary : undefined })}
        >
            {Icon && <Icon aria-hidden={'true'} className={'h-5 w-5 shrink-0'} />}
            {text && <span className={'max-w-[5rem] truncate'}>{text}</span>}
        </NavLink>
    );
};

const Home = () => {
    const { colors } = useStoreState(s => s.theme.data!);
    return (
        <>
            <NavLink to={'/'} aria-label={'Dashboard'} className={'flex min-w-12 items-center justify-center px-3'}>
                <FontAwesomeIcon icon={faHome} style={{ color: colors.primary }} className={'h-5 w-5 brightness-150'} />
            </NavLink>
            <div aria-hidden={'true'} className={'my-4 w-px shrink-0 bg-white/20'} />
        </>
    );
};

export default withSubComponents(MobileSidebar, { Link, Home });
