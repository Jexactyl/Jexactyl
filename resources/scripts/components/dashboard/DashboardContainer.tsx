import { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import ContentBox from '@/components/elements/ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../elements/tooltip/Tooltip';
import FlashMessageRender from '../FlashMessageRender';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const name = useStoreState(state => state.user.data!.username);
    const uuid = useStoreState(state => state.user.data!.uuid);
    const rootAdmin = useStoreState(state => state.user.data!.rootAdmin);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined, per_page: 5 }),
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
        <PageContentBlock title={'Dashboard'}>
            <p className={'text-xl lg:text-5xl my-4 lg:my-10 font-semibold'}>Welcome, {name}</p>
            {rootAdmin && (
                <div css={tw`mb-2 flex justify-end items-center`}>
                    <p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
                        {showOnlyAdmin ? "Showing others' servers" : 'Showing your servers'}
                    </p>
                    <Switch
                        name={'show_all_servers'}
                        defaultChecked={showOnlyAdmin}
                        onChange={() => setShowOnlyAdmin(s => !s)}
                    />
                </div>
            )}
            <FlashMessageRender className={'my-4'} byKey={'dashboard'} />
            <div className={'grid lg:grid-cols-3 gap-4'}>
                <div className="relative overflow-x-auto rounded-lg lg:col-span-2">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-zinc-800 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Identifier
                                    <Tooltip placement={'top'} content={'This is the name of your server.'}>
                                        <FontAwesomeIcon icon={faInfoCircle} className={'ml-1 pt-1'} />
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    State
                                    <Tooltip placement={'top'} content={'This indicates what state your server is in.'}>
                                        <FontAwesomeIcon icon={faInfoCircle} className={'ml-1 pt-1'} />
                                    </Tooltip>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    CPU
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Memory
                                </th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!servers ? (
                                <Spinner centered size={'large'} />
                            ) : (
                                <Pagination data={servers} onPageSelect={setPage}>
                                    {({ items }) =>
                                        items.length > 0 ? (
                                            items.map((server, _index) => (
                                                <ServerRow key={server.uuid} server={server} />
                                            ))
                                        ) : (
                                            <p className={'text-center'}>
                                                {showOnlyAdmin
                                                    ? 'There are no other servers to display.'
                                                    : 'There are no servers associated with your account.'}
                                            </p>
                                        )
                                    }
                                </Pagination>
                            )}
                        </tbody>
                    </table>
                </div>
                <ContentBox>Hello</ContentBox>
            </div>
        </PageContentBlock>
    );
};
