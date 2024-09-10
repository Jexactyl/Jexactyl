import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import type { VersionData } from '@/api/admin/getVersion';
import getVersion from '@/api/admin/getVersion';
import AdminContentBlock from '@elements/AdminContentBlock';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import {
    faArrowRight,
    faDesktop,
    faLayerGroup,
    faQuestionCircle,
    faRecycle,
    faServer,
    faTicket,
    faUserPlus,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import AdminBox from '@elements/AdminBox';
import Spinner from '@elements/Spinner';
import CopyOnClick from '@elements/CopyOnClick';
import { useStoreState } from '@/state/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import getMetrics, { MetricData } from '@/api/admin/getMetrics';

interface SuggestionProps {
    icon: IconDefinition;
    title: string;
    description: string;
    link: string;
}

const Code = ({ children }: { children: ReactNode }) => {
    return (
        <code css={tw`text-sm font-mono bg-neutral-900 rounded`} style={{ padding: '2px 6px' }}>
            {children}
        </code>
    );
};

const SuggestionCard = ({ icon, title, description, link }: SuggestionProps) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div className={'bg-black/25 p-3 lg:p-6 rounded-lg'}>
            <h1 className={'text-xl font-semibold mb-2'}>
                <FontAwesomeIcon icon={icon} /> {title}
            </h1>
            <p className={'text-gray-300'}>{description}</p>
            <p className={'mt-2 text-right text-sm'} style={{ color: colors.primary }}>
                <Link to={link}>
                    Manage <FontAwesomeIcon icon={faArrowRight} />
                </Link>
            </p>
        </div>
    );
};

export default () => {
    const [loading, setLoading] = useState<boolean>(true);
    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const everest = useStoreState(state => state.everest.data!);
    const settings = useStoreState(state => state.settings.data!);

    const [metricData, setMetricData] = useState<MetricData | undefined>(undefined);
    const [versionData, setVersionData] = useState<VersionData | undefined>(undefined);

    useEffect(() => {
        clearFlashes('overview');

        getVersion()
            .then(versionData => setVersionData(versionData))
            .catch(error => {
                clearAndAddHttpError({ key: 'overview', error });
            })
            .then(() => setLoading(false));

        getMetrics()
            .then(metricData => setMetricData(metricData))
            .catch(error => {
                clearAndAddHttpError({ key: 'overview', error });
            });
    }, []);

    console.log(metricData);

    return (
        <AdminContentBlock title={'Overview'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Overview</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>
                        A quick glance at your system.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'overview'} css={tw`mb-4`} />

            <AdminBox title={'Version Information'} icon={faDesktop}>
                {loading ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <>
                        <div className={'text-gray-200 mb-2'}>
                            You are currently running version&nbsp;
                            <CopyOnClick text={versionData?.panel.current}>
                                <Code>{versionData?.panel.current}</Code>
                            </CopyOnClick>
                            , with the latest release being &nbsp;
                            <CopyOnClick text={versionData?.panel.latest}>
                                <Code>{versionData?.panel.latest}</Code>
                            </CopyOnClick>
                            .
                        </div>
                    </>
                )}
            </AdminBox>
            <AdminBox title={'Suggested Actions'} className={'mt-6'} icon={faQuestionCircle}>
                <div className={'grid lg:grid-cols-3 gap-4'}>
                    {!settings.auto_update && (
                        <SuggestionCard
                            icon={faRecycle}
                            link={'/admin/settings'}
                            title={'Enable automatic updates'}
                            description={
                                'By setting up automatic updates, you can keep Jexactyl stable and secure in the background.'
                            }
                        />
                    )}
                    {!everest.auth.registration.enabled && (
                        <SuggestionCard
                            icon={faUserPlus}
                            link={'/admin/auth'}
                            title={'Allow user registration'}
                            description={
                                'Enabling the Authentication module allows users to signup via the login page.'
                            }
                        />
                    )}
                    {metricData && (
                        <>
                            {metricData.nodes < 1 && (
                                <SuggestionCard
                                    icon={faLayerGroup}
                                    link={'/admin/nodes/new'}
                                    title={'Add your first node'}
                                    description={"Nodes are physical servers which Jexactyl's servers run on."}
                                />
                            )}
                            {metricData.servers < 1 && (
                                <SuggestionCard
                                    icon={faServer}
                                    link={'/admin/servers/new'}
                                    title={'Create your first server'}
                                    description={'Create a server to host your favourite game or program.'}
                                />
                            )}
                            {everest.tickets.enabled && metricData.tickets > 0 && (
                                <SuggestionCard
                                    icon={faTicket}
                                    link={'/admin/tickets'}
                                    title={'Answer customer tickets'}
                                    description={`You currently have ${metricData.tickets} pending tickets.`}
                                />
                            )}
                        </>
                    )}
                </div>
            </AdminBox>
        </AdminContentBlock>
    );
};
