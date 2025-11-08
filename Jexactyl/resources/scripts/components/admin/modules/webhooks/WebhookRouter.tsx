import { useStoreState } from '@/state/hooks';
import { Route, Routes } from 'react-router-dom';
import { NotFound } from '@/elements/ScreenBlock';
import { CalendarIcon, CogIcon } from '@heroicons/react/outline';
import { SubNavigation, SubNavigationLink } from '@admin/SubNavigation';
import AdminContentBlock from '@/elements/AdminContentBlock';
import FlashMessageRender from '@/elements/FlashMessageRender';
import EnableWebhooks from './EnableWebhooks';
import WebhookSettings from './WebhookSettings';
import WebhookEventsContainer from './events/WebhookEventsContainer';

export default () => {
    const theme = useStoreState(state => state.theme.data!);
    const enabled = useStoreState(state => state.everest.data!.webhooks.enabled);

    if (!enabled) return <EnableWebhooks />;

    return (
        <AdminContentBlock title={'Webhooks'}>
            <FlashMessageRender byKey={'admin:webhooks'} className={'mb-4'} />
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Webhook Logging</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        Change settings for realtime webhook monitoring.
                    </p>
                </div>
            </div>
            <SubNavigation theme={theme}>
                <SubNavigationLink to={'/admin/webhooks'} name={'Settings'} base>
                    <CogIcon />
                </SubNavigationLink>
                <SubNavigationLink to={'/admin/webhooks/events'} name={'Events'}>
                    <CalendarIcon />
                </SubNavigationLink>
            </SubNavigation>
            <Routes>
                <Route path={'/'} element={<WebhookSettings />} />
                <Route path={'/events'} element={<WebhookEventsContainer />} />

                <Route path={'/*'} element={<NotFound />} />
            </Routes>
        </AdminContentBlock>
    );
};
