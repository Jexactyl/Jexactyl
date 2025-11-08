import { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import tw from 'twin.macro';

import ServerManageContainer from '@admin/management/servers/manage/ServerManageContainer';
import ServerStartupContainer from '@admin/management/servers/ServerStartupContainer';
import AdminContentBlock from '@/elements/AdminContentBlock';
import Spinner from '@/elements/Spinner';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import ServerSettingsContainer from '@admin/management/servers/ServerSettingsContainer';
import useFlash from '@/plugins/useFlash';
import { useServerFromRoute } from '@/api/routes/admin/server';
import {
    AdjustmentsIcon,
    CogIcon,
    CurrencyDollarIcon,
    DatabaseIcon,
    ExternalLinkIcon,
    InformationCircleIcon,
    ServerIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/outline';
import { useStoreState } from '@/state/hooks';
import ServerDatabases from './ServerDatabases';
import ServerBillingContainer from './billing/ServerBillingContainer';
import Pill from '@/elements/Pill';

export default () => {
    const params = useParams<'id'>();

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const theme = useStoreState(state => state.theme.data!);
    const { billing } = useStoreState(state => state.everest.data!);
    const { data: server, error, isValidating, mutate } = useServerFromRoute();

    useEffect(() => {
        mutate();
    }, []);

    useEffect(() => {
        if (!error) clearFlashes('server');
        if (error) clearAndAddHttpError({ key: 'server', error });
    }, [error]);

    if (!server || (error && isValidating)) {
        return (
            <AdminContentBlock showFlashKey={'server'}>
                <Spinner size={'large'} centered />
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock title={'Server - ' + server.name}>
            <FlashMessageRender byKey={'backups'} css={tw`mb-4`} />
            <div css={tw`w-full flex flex-row items-center mb-4`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>{server.name}</h2>
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        {server.uuid}
                    </p>
                </div>
                <div className={'my-auto ml-2 flex space-x-2'}>
                    <Pill type={'warn'}>
                        <ServerIcon className={'w-3 mr-1'} /> {server.relationships.allocations[0]?.getDisplayText()}
                    </Pill>
                    {billing.enabled && server.billingProductId && (
                        <Pill type={'info'}>
                            <CurrencyDollarIcon className={'w-3 mr-1'} /> Billable
                        </Pill>
                    )}
                    <Pill type={'success'}>
                        <InformationCircleIcon className={'w-3 mr-1'} /> {server.status ?? 'Active'}
                    </Pill>
                </div>
            </div>

            <FlashMessageRender byKey={'server'} css={tw`mb-4`} />

            <SubNavigation theme={theme}>
                <SubNavigationLink to={`/admin/servers/${params.id}`} name={'Settings'} icon={CogIcon} base />
                <SubNavigationLink to={`/admin/servers/${params.id}/startup`} name={'Startup'} icon={AdjustmentsIcon} />
                <SubNavigationLink
                    to={`/admin/servers/${params.id}/databases`}
                    name={'Databases'}
                    icon={DatabaseIcon}
                />
                <SubNavigationLink
                    to={`/admin/servers/${params.id}/billing`}
                    name={'Billing'}
                    icon={CurrencyDollarIcon}
                    disabled={!billing.enabled || !server.billingProductId}
                />
                <SubNavigationLink
                    to={`/admin/servers/${params.id}/manage`}
                    name={'Manage'}
                    icon={ShieldExclamationIcon}
                />
                <SubNavigationLink
                    to={`/server/${server.uuid.split('-')[0]}`}
                    name={'View as user'}
                    icon={ExternalLinkIcon}
                />
            </SubNavigation>

            <Routes>
                <Route path={''} element={<ServerSettingsContainer />} />
                <Route path={'startup'} element={<ServerStartupContainer />} />
                <Route path={'databases'} element={<ServerDatabases />} />
                <Route path={'billing'} element={<ServerBillingContainer />} />
                <Route path={'manage'} element={<ServerManageContainer />} />
            </Routes>
        </AdminContentBlock>
    );
};
