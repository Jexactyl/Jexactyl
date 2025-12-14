import useSWR from 'swr';
import tw from 'twin.macro';
import getServers from '@/api/getServers';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { PaginatedResult } from '@/api/http';
import { useLocation } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import Switch from '@/components/elements/Switch';
import React, { useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import ServerRow from '@/components/dashboard/ServerRow';
import Pagination from '@/components/elements/Pagination';
import { usePersistedState } from '@/plugins/usePersistedState';
import PageContentBlock from '@/components/elements/PageContentBlock';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const username = useStoreState((state) => state.user.data!.username);
    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    return (
        <PageContentBlock title={'Dashboard'} css={tw`mt-4 sm:mt-10`} showFlashKey={'dashboard'}>
            {/* Modern Header with Gradient */}
            <div
                css={tw`mb-8 p-8 rounded-2xl border border-neutral-700`}
                style={{
                    background:
                        'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                }}
            >
                <div css={tw`flex justify-between items-center`}>
                    {rootAdmin ? (
                        <>
                            <div>
                                <h1
                                    css={tw`text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}
                                >
                                    {showOnlyAdmin ? 'All Servers' : 'My Servers'}
                                </h1>
                                <p css={tw`text-lg mt-3 text-neutral-400`}>
                                    {showOnlyAdmin
                                        ? 'Managing all servers in the system'
                                        : 'Manage and monitor your server infrastructure'}
                                </p>
                            </div>
                            <div css={tw`flex items-center gap-3`}>
                                <span css={tw`text-sm text-neutral-400`}>Show All</span>
                                <Switch
                                    name={'show_all_servers'}
                                    defaultChecked={showOnlyAdmin}
                                    onChange={() => setShowOnlyAdmin((s) => !s)}
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <h1
                                css={tw`text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}
                            >
                                Welcome back, {username}! 👋
                            </h1>
                            <p css={tw`text-lg mt-3 text-neutral-400`}>
                                Select a server to manage, or create a new one to get started.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            <div css={tw`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6`}>
                                {items.map((server) => (
                                    <ServerRow
                                        key={server.uuid}
                                        server={server}
                                        className={'j-up'}
                                        css={tw`transform transition-all duration-300 hover:scale-105`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div css={tw`text-center py-16`}>
                                <div
                                    css={tw`inline-block p-6 rounded-full bg-neutral-800 border border-neutral-700 mb-4`}
                                >
                                    <svg
                                        css={tw`w-16 h-16 text-neutral-600`}
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={1.5}
                                            d='M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
                                        />
                                    </svg>
                                </div>
                                <h3 css={tw`text-2xl font-semibold text-neutral-300 mb-2`}>No servers found</h3>
                                <p css={tw`text-neutral-500 mb-6`}>
                                    You don&apos;t have any servers yet. Create one to get started!
                                </p>
                            </div>
                        )
                    }
                </Pagination>
            )}
        </PageContentBlock>
    );
};
