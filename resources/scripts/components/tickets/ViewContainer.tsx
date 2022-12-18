import { format } from 'date-fns';
import useFlash from '@/plugins/useFlash';
import { useRouteMatch } from 'react-router';
import React, { useEffect, useState } from 'react';
import { Alert } from '@/components/elements/alert';
import Spinner from '@/components/elements/Spinner';
import { Button } from '@/components/elements/button';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import PageContentBlock from '@/components/elements/PageContentBlock';
import NewMessageDialog from '@/components/tickets/forms/NewMessageDialog';
import { getTicket, getMessages, Ticket, TicketMessage, updateTicketStatus, TicketStatus } from '@/api/account/tickets';

export default () => {
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();
    const match = useRouteMatch<{ id: string }>();
    const id = parseInt(match.params.id);

    const [visible, setVisible] = useState(false);
    const [ticket, setTicket] = useState<Ticket>();
    const [messages, setMessages] = useState<TicketMessage[]>();

    const doRedirect = () => {
        // @ts-expect-error this is valid
        window.location = '/tickets';
    };

    const doDeletion = () => {
        clearFlashes('tickets');

        //
    };

    const doStatusUpdate = (status: TicketStatus) => {
        clearFlashes('tickets');

        updateTicketStatus(id, status)
            .then(() =>
                addFlash({
                    key: 'tickets',
                    type: 'success',
                    message: 'Ticket has been set to ' + status,
                })
            )
            .catch((error) => clearAndAddHttpError(error));
    };

    useEffect(() => {
        getTicket(id).then((data) => setTicket(data));
        getMessages(id).then((data) => setMessages(data));
    }, []);

    if (!ticket) return <Spinner centered />;

    return (
        <PageContentBlock title={'View Ticket'} showFlashKey={'tickets'}>
            <NewMessageDialog open={visible} onClose={() => setVisible(false)} />
            <div className={'mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:w-1/2 gap-4'}>
                <Button.Text className={'w-full'} onClick={doRedirect}>
                    View All Tickets
                </Button.Text>
                <Button.Text className={'w-full'} onClick={() => doStatusUpdate('in-progress')}>
                    Mark as In Progress
                </Button.Text>
                <Button.Success className={'w-full'} onClick={() => doStatusUpdate('resolved')}>
                    Mark as Resolved
                </Button.Success>
                <Button.Danger className={'w-full'} onClick={doDeletion}>
                    Delete Ticket
                </Button.Danger>
            </div>
            <Alert type={'info'} className={'my-4 w-full'}>
                This ticket is marked as&nbsp;<p className={'font-bold'}>{ticket.status}</p>.
            </Alert>
            <TitledGreyBox title={ticket.title}>
                {ticket.content}
                {ticket.createdAt && (
                    <p className={'text-right p-2 text-sm text-gray-400'}>
                        {format(ticket.createdAt, "MMM do 'at' h:mma")}
                    </p>
                )}
            </TitledGreyBox>
            {!messages ? (
                <p className={'text-gray-400 text-center'}>No one has replied to this ticket yet.</p>
            ) : (
                <>
                    {messages.map((message) => (
                        <TitledGreyBox title={`Response from ${message.userEmail}`} key={message.id} className={'mt-4'}>
                            {message.content}
                            {message.createdAt && (
                                <p className={'text-right p-2 text-sm text-gray-400'}>
                                    {format(message.createdAt, "MMM do 'at' h:mma")}
                                </p>
                            )}
                        </TitledGreyBox>
                    ))}
                </>
            )}
            <div className={'flex justify-center items-center mt-6'}>
                <Button onClick={() => setVisible(true)}>Create Message</Button>
            </div>
        </PageContentBlock>
    );
};
