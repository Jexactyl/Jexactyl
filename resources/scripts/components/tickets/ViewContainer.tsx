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
import { Ticket, getTicket, getMessages, deleteTicket, TicketMessage } from '@/api/account/tickets';

export default () => {
    const { clearFlashes } = useFlash();
    const match = useRouteMatch<{ id: string }>();
    const id = parseInt(match.params.id);

    const [visible, setVisible] = useState(false);
    const [ticket, setTicket] = useState<Ticket>();
    const [messages, setMessages] = useState<TicketMessage[]>();

    const doRedirect = () => {
        clearFlashes('tickets');

        // @ts-expect-error this is valid
        window.location = '/tickets';
    };

    const doRefresh = () => {
        clearFlashes('tickets');

        getTicket(id).then((data) => setTicket(data));
        getMessages(id).then((data) => setMessages(data));
    };

    const doDeletion = () => {
        clearFlashes('tickets');

        deleteTicket(id).then(() => doRedirect());
    };

    useEffect(() => {
        clearFlashes('tickets');

        doRefresh();
    }, []);

    if (!ticket) return <Spinner centered />;

    return (
        <PageContentBlock title={'View Ticket'} showFlashKey={'tickets'}>
            <NewMessageDialog open={visible} onClose={() => setVisible(false)} />
            <div className={'mt-6 grid grid-cols-1 sm:grid-cols-2 lg:w-1/4 gap-4'}>
                <Button.Text className={'w-full'} onClick={doRedirect}>
                    View All Tickets
                </Button.Text>
                <Button.Danger className={'w-full'} onClick={doDeletion}>
                    Delete Ticket
                </Button.Danger>
            </div>
            <Alert
                type={
                    ticket.status === 'pending'
                        ? 'info'
                        : ticket.status === 'in-progress'
                        ? 'info'
                        : ticket.status === 'unresolved'
                        ? 'danger'
                        : ticket.status === 'resolved'
                        ? 'success'
                        : 'warning'
                }
                className={'my-4 w-full'}
            >
                This ticket is marked as&nbsp;<p className={'font-bold'}>{ticket.status ?? 'unknown'}</p>.
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
                        <>
                            {message.content === ticket.content ? undefined : (
                                <>
                                    {message.userEmail === 'system' ? (
                                        <div className={'my-4 p-2 bg-gray-900 opacity-75'}>
                                            <p className={'text-lg text-center text-gray-400'} key={message.id}>
                                                {message.content}
                                            </p>
                                        </div>
                                    ) : (
                                        <TitledGreyBox
                                            title={`Response from ${message.userEmail}`}
                                            key={message.id}
                                            className={'mt-4'}
                                        >
                                            {message.content}
                                            {message.createdAt && (
                                                <p className={'text-right p-2 text-sm text-gray-400'}>
                                                    {format(message.createdAt, "MMM do 'at' h:mma")}
                                                </p>
                                            )}
                                        </TitledGreyBox>
                                    )}
                                </>
                            )}
                        </>
                    ))}
                </>
            )}
            <div className={'flex justify-center items-center mt-6'}>
                <Button onClick={() => setVisible(true)}>Create Message</Button>
            </div>
        </PageContentBlock>
    );
};
