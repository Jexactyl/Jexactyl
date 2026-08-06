import type { ComponentType, ElementType } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import * as Icon from '@heroicons/react/outline';

import PageContentBlock from '@/elements/PageContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import MessageBox from '@/elements/MessageBox';
import { SubNavigation, SubNavigationLink } from '@/elements/SubNavigation';
import CredentialsContainer from '@account/security/CredentialsContainer';
import AccountApiContainer from '@account/AccountApiContainer';
import AccountSSHContainer from '@account/ssh/AccountSSHContainer';
import AccountPasskeyContainer from '@account/passkeys/AccountPasskeyContainer';

interface SecurityTab {
    path: string;
    name: string;
    title: string;
    description: string;
    icon: ElementType;
    component: ComponentType;
}

/**
 * Drives the sub-navigation, the nested routes, and the per-tab document title from one place.
 */
const tabs: SecurityTab[] = [
    {
        path: '',
        name: 'Credentials',
        title: 'Credentials',
        description: 'Update the email address, password, and two-step verification on your account.',
        icon: Icon.LockClosedIcon,
        component: CredentialsContainer,
    },
    {
        path: 'passkeys',
        name: 'Passkeys',
        title: 'Passkeys',
        description: 'Sign in with your fingerprint, face, or security key instead of a password.',
        icon: Icon.FingerPrintIcon,
        component: AccountPasskeyContainer,
    },
    {
        path: 'ssh',
        name: 'SSH Keys',
        title: 'SSH Keys',
        description: 'Create, use and delete SSH keys to access servers.',
        icon: Icon.TerminalIcon,
        component: AccountSSHContainer,
    },
    {
        path: 'api',
        name: 'API Credentials',
        title: 'API Credentials',
        description: 'Create, edit and delete API keys to access the Panel.',
        icon: Icon.CodeIcon,
        component: AccountApiContainer,
    },
];

const SecurityRouter = () => {
    const { pathname, state } = useLocation();

    // The base tab is the fallback, so an unrecognised sub-path still renders sensible chrome.
    const active =
        tabs.find(tab => tab.path !== '' && pathname.startsWith(`/account/security/${tab.path}`)) ?? tabs[0]!;

    return (
        <PageContentBlock title={active.title}>
            {state?.twoFactorRedirect && (
                <MessageBox title="2-Factor Required" type="error">
                    Your account must have two-factor authentication enabled in order to continue.
                </MessageBox>
            )}

            <div className={'text-3xl lg:text-5xl font-bold mt-8 mb-8'}>
                Security
                <p className={'text-gray-400 font-normal text-sm mt-1'}>{active.description}</p>
            </div>

            <SubNavigation>
                {tabs.map(({ path, name, icon: TabIcon }) => (
                    <SubNavigationLink
                        key={path}
                        to={`/account/security${path && `/${path}`}`}
                        name={name}
                        base={path === ''}
                    >
                        <TabIcon />
                    </SubNavigationLink>
                ))}
            </SubNavigation>

            <FlashMessageRender byKey={'account'} />

            <Routes>
                {tabs.map(({ path, component: Component }) => (
                    <Route key={path} path={`/${path}`} element={<Component />} />
                ))}
            </Routes>
        </PageContentBlock>
    );
};

export default SecurityRouter;
