import { useEffect } from 'react';
import { useFlashKey } from '@/plugins/useFlash';
import ContentBox from '@elements/ContentBox';
import { useTicketFromRoute } from '@/api/account/tickets';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@elements/PageContentBlock';
import AddTicketMessageForm from '@/components/dashboard/tickets/view/AddTicketMessageForm';
import Spinner from '@elements/Spinner';
import classNames from 'classnames';
import GreyRowBox from '@elements/GreyRowBox';
import { formatDistanceToNow } from 'date-fns';

export const statusToColor = (status: string): string => {
    switch (status) {
        case 'in-progress':
            return 'bg-yellow-200 text-yellow-800';
        case 'unresolved':
            return 'bg-red-200 text-red-800';
        case 'resolved':
            return 'bg-green-200 text-green-800';
        default:
            return 'bg-gray-400 text-gray-800';
    }
};

export default () => {
    const { data: ticket, error, isLoading } = useTicketFromRoute();
    const { clearAndAddHttpError } = useFlashKey('account:tickets');

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={`View Ticket`}>
            <FlashMessageRender byKey={'account:tickets'} />
            {isLoading || !ticket ? (
                <Spinner size={'large'} centered />
            ) : (
                <div className={'grid lg:grid-cols-3 gap-4'}>
                    <div className={'lg:col-span-2'}>
                        <h2 className={'text-neutral-300 mb-4 px-4 text-2xl'}>
                            {ticket.title}
                            <span
                                className={classNames(
                                    statusToColor(ticket.status),
                                    'px-2 py-1 ml-2 text-sm font-medium rounded-full hidden sm:inline',
                                )}
                            >
                                {ticket.status[0]?.toUpperCase() + ticket.status.slice(1)}
                            </span>
                        </h2>
                        <ContentBox>
                            {!ticket.relationships.messages ? (
                                'There are no messages assigned to this ticket.'
                            ) : (
                                <>
                                    {ticket.relationships.messages
                                        .map(message => (
                                            <>
                                                <GreyRowBox key={message.id} className={'mt-4'}>
                                                    <p className={'mr-2 font-semibold text-primary-400'}>
                                                        {message.author ? message.author.email : 'You'}:
                                                    </p>
                                                    {message.message.toString()}
                                                </GreyRowBox>
                                                <p className={'text-2xs text-gray-300 mt-1 text-right'}>
                                                    Sent&nbsp;
                                                    {formatDistanceToNow(message.createdAt, {
                                                        includeSeconds: true,
                                                        addSuffix: true,
                                                    })}
                                                </p>
                                            </>
                                        ))
                                        .toReversed()}
                                </>
                            )}
                        </ContentBox>
                        <p className={'text-xs text-gray-400 mt-2'}>Sorted by latest message</p>
                    </div>
                    <ContentBox title={'Add Message'}>
                        <AddTicketMessageForm ticketId={ticket.id} />
                    </ContentBox>
                </div>
            )}
        </PageContentBlock>
    );
};
