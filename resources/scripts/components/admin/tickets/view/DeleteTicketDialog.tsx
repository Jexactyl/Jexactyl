import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import { useNavigate } from 'react-router-dom';
import type { ApplicationStore } from '@/state';
import { Dialog } from '@/components/elements/dialog';
import { useTicketFromRoute } from '@/api/admin/tickets/getTicket';
import { useState } from 'react';
import { Button } from '@/components/elements/button';
import FlashMessageRender from '@/components/FlashMessageRender';
import deleteTicket from '@/api/admin/tickets/deleteTicket';

export default () => {
    const navigate = useNavigate();
    const { data: ticket } = useTicketFromRoute();
    const [open, setOpen] = useState<boolean>(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!ticket) return <></>;

    const submit = () => {
        console.log('submitting');
        clearFlashes('tickets:view');

        deleteTicket(ticket.id)
            .then(() => navigate(`/admin/tickets`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'tickets:view', error });
            });
    };

    return (
        <>
            <Button.Danger onClick={() => setOpen(true)} className={'mr-3'} type={'button'}>
                Delete Ticket
            </Button.Danger>
            <Dialog.Confirm
                open={open}
                onConfirmed={submit}
                onClose={() => setOpen(false)}
                title={'Confirm ticket deletion'}
            >
                <FlashMessageRender byKey={'tickets:view'} />
                Are you sure you want to delete this ticket and the associated messages?
            </Dialog.Confirm>
        </>
    );
};
