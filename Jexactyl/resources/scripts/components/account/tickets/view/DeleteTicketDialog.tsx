import type { Actions } from 'easy-peasy';
import { useStoreActions } from 'easy-peasy';
import { useNavigate } from 'react-router-dom';
import type { ApplicationStore } from '@/state';
import { Dialog } from '@/elements/dialog';
import { useState } from 'react';
import { Button } from '@/elements/button';
import FlashMessageRender from '@/elements/FlashMessageRender';
import { deleteTicket, useTicketFromRoute } from '@/api/routes/account/tickets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const navigate = useNavigate();
    const { data: ticket } = useTicketFromRoute();
    const [open, setOpen] = useState<boolean>(false);

    const { clearFlashes, clearAndAddHttpError } = useStoreActions(
        (actions: Actions<ApplicationStore>) => actions.flashes,
    );

    if (!ticket) return <></>;

    const submit = () => {
        clearFlashes('account:tickets:view');

        deleteTicket(ticket.id)
            .then(() => navigate(`/account/tickets`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'account:tickets:view', error });
            });
    };

    return (
        <>
            <Button.Danger onClick={() => setOpen(true)} className={'mr-3'} type={'button'}>
                <FontAwesomeIcon icon={faTrash} />
            </Button.Danger>
            <Dialog.Confirm
                open={open}
                onConfirmed={submit}
                onClose={() => setOpen(false)}
                title={'Confirm ticket deletion'}
            >
                <FlashMessageRender byKey={'account:tickets:view'} />
                Are you sure you want to delete this ticket and the associated messages?
            </Dialog.Confirm>
        </>
    );
};
