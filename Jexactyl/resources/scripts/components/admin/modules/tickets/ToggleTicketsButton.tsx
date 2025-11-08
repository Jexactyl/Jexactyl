import { updateTicketSettings } from '@/api/routes/admin/tickets';
import { useStoreState } from '@/state/hooks';
import { Button } from '@/elements/button';
import { useNavigate } from 'react-router-dom';

export default () => {
    const navigate = useNavigate();
    const enabled = useStoreState(state => state.everest.data!.tickets.enabled);

    const submit = () => {
        updateTicketSettings('enabled', !enabled).then(() => navigate(0));
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!enabled ? <Button>Enable Tickets</Button> : <Button.Danger>Disable Tickets</Button.Danger>}
        </div>
    );
};
