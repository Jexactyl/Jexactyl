import { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@elements/Spinner';
import PageContentBlock from '@elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@elements/Pagination';
import { useLocation } from 'react-router-dom';
import ContentBox from '@elements/ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../elements/tooltip/Tooltip';
import FlashMessageRender from '../FlashMessageRender';
import NotFoundSvg from '@/assets/images/not_found.svg';
import DashboardAlert from '@/components/dashboard/DashboardAlert';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const colors = useStoreState(state => state.theme.data!.colors);
    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const name = useStoreState(state => state.settings.data!.name);
    const uuid = useStoreState(state => state.user.data!.uuid);
    const user = useStoreState(state => state.user.data!);
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && user.rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && user.rootAdmin ? 'admin' : undefined, per_page: 5 }),
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
            <DashboardAlert />
            <div className={'text-3xl lg:text-5xl font-bold mt-8 mb-12'}>
                Welcome to {name}
                <p className={'text-gray-400 font-normal text-sm mt-1'}>Signed in as {user.email}</p>
            </div>
            <FlashMessageRender className={'my-4'} byKey={'dashboard'} />
            <div className={'grid lg:grid-cols-3 gap-4'}>
                <div className="relative overflow-x-auto lg:col-span-2">
                    <h2 css={tw`text-neutral-300 mb-4 px-4 text-2xl inline-flex`}>
                        {user.rootAdmin && (
                            <div className={'mr-3 mt-1.5'}>
                                <Switch
                                    name={'show_all_servers'}
                                    defaultChecked={showOnlyAdmin}
                                    onChange={() => setShowOnlyAdmin(s => !s)}
                                />
                            </div>
                        )}
                        {showOnlyAdmin ? 'Other' : 'Your'} Servers
                    </h2>
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase" style={{ backgroundColor: colors.headers }}>
                            <tr>
                                {!servers || servers.items.length < 1 ? (
                                    <th scope="col" className="px-6 py-3">
                                        No results found
                                    </th>
                                ) : (
                                    <>
                                        <th scope="col" className="px-6 py-3">
                                            Identifier
                                            <Tooltip placement={'top'} content={'This is the name of your server.'}>
                                                <FontAwesomeIcon icon={faInfoCircle} className={'ml-1 pt-1'} />
                                            </Tooltip>
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            State
                                            <Tooltip
                                                placement={'top'}
                                                content={'This indicates what state your server is in.'}
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} className={'ml-1 pt-1'} />
                                            </Tooltip>
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            CPU
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Memory
                                        </th>
                                        <th scope="col" className="px-6 py-3" />
                                    </>
                                )}
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
                                            <tr className={'w-full'} style={{ backgroundColor: colors.secondary }}>
                                                <td className={'px-6 py-4 text-gray-300'}>
                                                    <div css={tw`flex justify-center`}>
                                                        <div
                                                            css={tw`w-full sm:w-3/4 md:w-1/2 rounded-lg text-center relative`}
                                                        >
                                                            <img
                                                                src={NotFoundSvg}
                                                                css={tw`w-2/3 h-auto select-none mx-auto`}
                                                            />
                                                            <h2 css={tw`mt-10 mb-6 text-white font-medium text-xl`}>
                                                                No servers could be found.
                                                            </h2>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }
                                </Pagination>
                            )}
                        </tbody>
                    </table>
                </div>
                <ContentBox title={'Test Box'}>Hello, I&apos;m a test box.</ContentBox>
            </div>
        </PageContentBlock>
    );
};
