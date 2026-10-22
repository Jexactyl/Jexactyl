import { useEffect, useState } from 'react';
import { useStoreState } from 'easy-peasy';
import SearchContainer from '@account/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components';
import { SiteTheme } from '@/state/theme';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, EyeIcon, HeartIcon, HomeIcon, IdentificationIcon } from '@heroicons/react/outline';
import { useActivityLogs } from '@/api/routes/account/activity';
import { formatDistanceToNow } from 'date-fns';

const RightNavigation = styled.div<{ theme: SiteTheme }>`
    & > a,
    & > button,
    & > div,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-300 px-6 cursor-pointer transition-all duration-300 gap-x-2`};
        ${tw`text-gray-400 font-medium`};

        &:active,
        &:hover,
        &.active {
            box-shadow: inset 0 -1px ${({ theme }) => theme.colors.primary};
        }
    }
`;

const NavigationBar = () => {
    const [width, setWidth] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const location = useLocation();
    const theme = useStoreState(state => state.theme.data!);
    const user = useStoreState(state => state.user.data!);
    const activityEnabled = useStoreState(state => state.settings.data?.activity?.enabled?.account ?? false);
    const { data } = useActivityLogs({ page: 1 }, { revalidateOnMount: activityEnabled, revalidateOnFocus: false });

    const pathnames = location.pathname.split('/').filter(Boolean);

    const items = [];

    if (activityEnabled && data?.items && data.items.length > 0) {
        items.push(
            <span key="activity" className={'inline-flex items-center gap-x-2'}>
                <EyeIcon className={'w-4 h-4 flex-shrink-0'} />
                <span className="font-bold mb-1">{data.items[0]?.event}</span> -{' '}
                <span className="text-xs">
                    {formatDistanceToNow(data.items[0]?.timestamp ?? new Date(), {
                        includeSeconds: true,
                        addSuffix: true,
                    })}
                </span>
            </span>
        );
    }

    items.push(
        <span key="2fa" className={'inline-flex items-center gap-x-2'}>
            <HeartIcon
                className={`w-4 h-4 flex-shrink-0 ${user.useTotp ? 'text-green-400' : 'text-red-400'}`}
            />
            2FA is {user.useTotp ? 'Enabled' : 'Disabled'}
        </span>
    );

    items.push(
        <span key="user-id" className={'inline-flex items-center gap-x-2'}>
            <IdentificationIcon className={'w-4 h-4 flex-shrink-0'} />
            User ID: {user.uuid.slice(0, 8)}
        </span>
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setWidth(prev => {
                if (prev >= 80) {
                    setCurrentPage(p => (p + 1) % items.length);
                    return 0;
                }
                return prev + 1;
            });
        }, 75);
        return () => clearInterval(interval);
    }, [items.length]);

    const renderBreadcrumbs = () => (
        <ol className="w-1/3 text-gray-400 text-sm inline-flex space-x-2">
            <Link to={'/'}>
                <HomeIcon className="w-4 h-4 my-auto brightness-150" />
            </Link>
            {pathnames.map((segment, index) => {
                const href = `/${pathnames.slice(0, index + 1).join('/')}`;
                return (
                    <li key={index} className="inline-flex">
                        <ChevronRightIcon className="mr-2 w-4 h-4 my-auto" />
                        {index === pathnames.length - 1 ? (
                            <span className="capitalize">{segment}</span>
                        ) : (
                            <Link to={href} className="capitalize brightness-150">
                                {segment}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ol>
    );

    const renderPageContent = () => items[currentPage % items.length] || null;

    return (
        <div
            className="w-full overflow-x-auto shadow-md mb-8 backdrop-blur-md border-b border-white/5"
            style={{ backgroundColor: theme.colors.sidebar }}
        >
            <div className="px-8 flex h-[3.5rem] w-full items-center">
                {renderBreadcrumbs()}
                <RightNavigation className="flex h-full items-center justify-center ml-auto" theme={theme}>
                    <div className="relative">
                        <div
                            className="absolute top-0 h-px transition-all duration-[250ms] ease-in-out"
                            style={{
                                width: `${width}%`,
                                backgroundColor: theme.colors.primary,
                            }}
                        />
                        <div className={'hidden lg:block'}>{renderPageContent()}</div>
                    </div>
                    <SearchContainer />
                </RightNavigation>
            </div>
        </div>
    );
};

export default NavigationBar;
