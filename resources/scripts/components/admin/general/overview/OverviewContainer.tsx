import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import AdminContentBlock from '@/elements/AdminContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import {
    faArrowRight,
    faChartLine,
    faCoins,
    faDatabase,
    faDesktop,
    faHeart,
    faLayerGroup,
    faQuestionCircle,
    faRecycle,
    faSave,
    faServer,
    faTicket,
    faUserPlus,
    faUsers,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import AdminBox from '@/elements/AdminBox';
import Spinner from '@/elements/Spinner';
import CopyOnClick from '@/elements/CopyOnClick';
import { useStoreState } from '@/state/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Alert } from '@/elements/alert';
import getMetrics, { MetricData } from '@/api/routes/admin/getMetrics';
import getVersion, { VersionData } from '@/api/routes/admin/getVersion';

interface SuggestionProps {
    icon: IconDefinition;
    title: string;
    description: string;
    link: string;
    action?: string;
}

const Code = ({ children }: { children: ReactNode }) => {
    return (
        <code css={tw`text-sm font-mono bg-neutral-900 rounded`} style={{ padding: '2px 6px' }}>
            {children}
        </code>
    );
};

const SuggestionCard = ({ icon, title, description, link, action }: SuggestionProps) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div className={'bg-black/25 p-3 lg:p-6 rounded-lg'}>
            <h1 className={'text-xl font-semibold mb-2'}>
                <FontAwesomeIcon icon={icon} /> {title}
            </h1>
            <p className={'text-gray-300'}>{description}</p>
            <p className={'mt-2 text-right text-sm'} style={{ color: colors.primary }}>
                <Link to={link}>
                    {action ?? 'Manage'} <FontAwesomeIcon icon={faArrowRight} />
                </Link>
            </p>
        </div>
    );
};

interface StatProps {
    icon: IconDefinition;
    title: string;
    value: ReactNode;
    subtext?: string;
}

const StatCard = ({ icon, title, value, subtext }: StatProps) => {
    const { colors } = useStoreState(state => state.theme.data!);

    return (
        <div className={'bg-black/25 p-3 lg:p-4 rounded-lg'}>
            <p className={'text-sm text-gray-400'}>
                <FontAwesomeIcon icon={icon} style={{ color: colors.primary }} /> {title}
            </p>
            <p className={'text-2xl font-semibold mt-1'}>{value}</p>
            {subtext && <p className={'text-xs text-gray-400 mt-1'}>{subtext}</p>}
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

    return (
        <AdminContentBlock title={'Overview'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>Overview</h2>
                    <p
                        css={tw`hidden md:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}
                    >
                        A quick glance at your system.
                    </p>
                </div>
            </div>

            <FlashMessageRender byKey={'overview'} css={tw`mb-4`} />

            <AdminBox title={'Version Information'} icon={faDesktop}>
                {settings.debug && (
                    <Alert type={'warning'} className={'mb-3'}>
                        Jexactyl is running in debug mode. Do not use in production.
                    </Alert>
                )}
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
                        {versionData?.panel.current.startsWith('v4.0.0-') && (
                            <Alert type={'danger'} className={'mt-4'}>
                                You are running a beta release of Jexactyl v4, which may include several bugs or weird
                                glitches. Do NOT use this software in production unless you don&apos;t care about losing
                                data.
                            </Alert>
                        )}
                    </>
                )}
            </AdminBox>
            <AdminBox title={'Statistics'} className={'mt-6'} icon={faChartLine}>
                {loading || !metricData ? (
                    <Spinner size={'large'} centered />
                ) : (
                    <div className={'grid grid-cols-2 lg:grid-cols-4 gap-4'}>
                        <StatCard icon={faLayerGroup} title={'Nodes'} value={metricData.nodes} />
                        <StatCard
                            icon={faServer}
                            title={'Servers'}
                            value={metricData.servers.total}
                            subtext={
                                metricData.servers.suspended > 0 || metricData.servers.installing > 0
                                    ? [
                                          metricData.servers.suspended > 0
                                              ? `${metricData.servers.suspended} suspended`
                                              : null,
                                          metricData.servers.installing > 0
                                              ? `${metricData.servers.installing} installing`
                                              : null,
                                      ]
                                          .filter(Boolean)
                                          .join(', ')
                                    : undefined
                            }
                        />
                        <StatCard
                            icon={faUsers}
                            title={'Users'}
                            value={metricData.users.total}
                            subtext={`${metricData.users.admins} administrators`}
                        />
                        <StatCard icon={faTicket} title={'Pending Tickets'} value={metricData.tickets} />
                        <StatCard icon={faDatabase} title={'Databases'} value={metricData.databases} />
                        <StatCard icon={faSave} title={'Backups'} value={metricData.backups} />
                        {metricData.billing && (
                            <>
                                <StatCard
                                    icon={faCoins}
                                    title={'Revenue'}
                                    value={`${everest.billing.currency.symbol}${metricData.billing.revenue.toFixed(2)}`}
                                    subtext={`${metricData.billing.orders_this_month} orders this month`}
                                />
                                <StatCard
                                    icon={faQuestionCircle}
                                    title={'Pending Orders'}
                                    value={metricData.billing.orders_pending}
                                    subtext={`${metricData.billing.products} products available`}
                                />
                            </>
                        )}
                    </div>
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
                            {metricData.servers.total < 1 && (
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
                            {metricData.billing && metricData.billing.orders_pending > 0 && (
                                <SuggestionCard
                                    icon={faCoins}
                                    link={'/admin/billing/orders'}
                                    title={'Review pending orders'}
                                    description={`You currently have ${metricData.billing.orders_pending} pending billing orders.`}
                                />
                            )}
                        </>
                    )}
                    <SuggestionCard
                        icon={faHeart}
                        link={'https://donate.stripe.com/6oE02Zftd9cC34IbIS'}
                        title={'Donate to Jexactyl'}
                        action={'Donate'}
                        description={
                            'Support the project by leaving a donation to help us pay for testing servers and domains.'
                        }
                    />
                </div>
            </AdminBox>
        </AdminContentBlock>
    );
};
