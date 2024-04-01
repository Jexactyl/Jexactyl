import { useEffect } from 'react';
import { useFlashKey } from '@/plugins/useFlash';
import { useTicketFromRoute, useTickets } from '@/api/account/tickets';
import ContentBox from '@/components/elements/ContentBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { format, formatDistanceToNow } from 'date-fns';
import classNames from 'classnames';
import AddTicketMessageForm from './AddTicketMessageForm';

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
    const { data: ticket, error } = useTicketFromRoute();
    const { clearAndAddHttpError } = useFlashKey('account:tickets');

    if (!ticket) return <></>;

    useEffect(() => {
        clearAndAddHttpError(error);
    }, [error]);

    return (
        <PageContentBlock title={`Ticket ${ticket.id}`}>
            <FlashMessageRender byKey={'account:tickets'} />
            <div className={'grid lg:grid-cols-3 gap-4'}>
                <div className={'lg:col-span-2'}>
                    <ContentBox title={'Ticket Messages'}>Messages will eventually go in this box.</ContentBox>
                </div>
                <ContentBox title={'Add Message'}>
                    <AddTicketMessageForm />
                </ContentBox>
            </div>
        </PageContentBlock>
    );
};
