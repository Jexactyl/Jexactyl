import React, { useEffect, useState } from 'react';
import { Button } from '@/components/elements/button';
import GreyRowBox from '@/components/elements/GreyRowBox';
import { getTickets, Ticket } from '@/api/account/tickets';
import PageContentBlock from '@/components/elements/PageContentBlock';

export default () => {
    const [tickets, setTickets] = useState<Ticket[]>();

    const doCreation = () => {
        // @ts-expect-error this is valid
        window.location = '/tickets/new';
    };

    useEffect(() => {
        getTickets().then((d) => setTickets(d));
    }, []);

    return (
        <PageContentBlock title={'Support Tickets'}>
            <h1 className={'j-left text-5xl'}>Support Tickets</h1>
            <h3 className={'j-left text-2xl text-neutral-500'}>Create or reply to a support ticket.</h3>
            {!tickets ? (
                <p className={'text-gray-400 text-center my-4'}>There are no tickets available.</p>
            ) : (
                <>
                    {tickets.map((ticket) => (
                        <GreyRowBox key={ticket.id}>
                            <pre>{JSON.stringify(ticket, null)}</pre>
                        </GreyRowBox>
                    ))}
                </>
            )}
            <div className={'w-full flex lg:justify-end lg:items-end'}>
                <Button onClick={doCreation}>Create New Ticket</Button>
            </div>
        </PageContentBlock>
    );
};
