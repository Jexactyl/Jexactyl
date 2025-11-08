import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import { useNavigate } from 'react-router-dom';
import type { ApplicationStore } from '@/state';
import { Dialog } from '@/elements/dialog';
import { useState } from 'react';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { deleteTicket } from '@/api/routes/admin/tickets';

export default ({ ticketId }: { ticketId: number }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState<boolean>(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!ticketId) return <></>;

    const submit = () => {
        clearFlashes('tickets:view');

        deleteTicket(ticketId)
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
