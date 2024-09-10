import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faLayerGroup, faScrewdriverWrench, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components';
import http from '@/api/http';
import SpinnerOverlay from '@elements/SpinnerOverlay';
import Avatar from '@/components/Avatar';
import { SiteTheme } from '@/state/theme';

const RightNavigation = styled.div<{ theme: SiteTheme }>`
    & > a,
    & > button,
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

export default () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const theme = useStoreState(state => state.theme.data!);
    const { mode } = useStoreState(state => state.settings.data!);
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const billing = useStoreState((state: ApplicationStore) => state.everest.data!.billing.enabled);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);

        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <div className="w-full overflow-x-auto shadow-md" style={{ backgroundColor: theme.colors.sidebar }}>
            <SpinnerOverlay visible={isLoggingOut} />
            <div className="mx-auto flex h-[3.5rem] w-full max-w-[1200px] items-center">
                <div id="logo" className="flex-1">
                    <Link
                        to="/"
                        className="px-4 font-header text-2xl text-neutral-200 no-underline transition-colors duration-150 hover:text-neutral-100"
                    >
                        {name}
                    </Link>
                </div>

                <RightNavigation className="flex h-full items-center justify-center" theme={theme}>
                    <SearchContainer />

                    <NavLink to="/" end>
                        <FontAwesomeIcon icon={faLayerGroup} />
                        Servers
                    </NavLink>

                    {billing && mode === 'standard' && (
                        <NavLink to={'/billing'}>
                            <FontAwesomeIcon icon={faCoins} />
                            Billing
                        </NavLink>
                    )}

                    <NavLink to="/account">
                        <span className="flex h-5 w-5 items-center">
                            <Avatar.User />
                        </span>
                        Account
                    </NavLink>

                    {rootAdmin && (
                        <a href="/admin" rel="noreferrer">
                            <FontAwesomeIcon icon={faScrewdriverWrench} />
                            Settings
                        </a>
                    )}

                    <button onClick={onTriggerLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Logout
                    </button>
                </RightNavigation>
            </div>
        </div>
    );
};
