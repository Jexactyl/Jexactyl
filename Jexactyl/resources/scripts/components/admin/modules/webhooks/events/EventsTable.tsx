import EventBox from './EventBox';
import Spinner from '@/elements/Spinner';
import { WebhookEvent } from '@/api/routes/admin/webhooks';
import usePagination from '@/plugins/usePagination';
import { PaginatedFooter } from '@/elements/Table';

export default ({ events }: { events?: WebhookEvent[] }) => {
    if (!events) return <Spinner size={'large'} centered />;

    const pagination = usePagination<WebhookEvent>(events, 12);

    return (
        <>
            <div className={'grid lg:grid-cols-3 gap-4'}>
                {pagination.paginatedItems.map(event => (
                    <EventBox event={event} key={event.id} />
                ))}
            </div>
            <div className={'mt-4'}>
                <PaginatedFooter pagination={pagination} />
            </div>
        </>
    );
};
