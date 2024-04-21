import { useStoreState } from '@/state/hooks';
import { Button } from '@elements/button';
import updateTicketSettings from '@/api/admin/tickets/updateTicketSettings';
import { useNavigate } from 'react-router-dom';

export default () => {
    const navigate = useNavigate();
    const enabled = useStoreState(state => state.everest.data!.tickets.enabled);

    const submit = () => {
        updateTicketSettings('enabled', !enabled).then(() => navigate(0));
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!enabled ? <Button>Enable Ticket System</Button> : <Button.Danger>Disable Ticket System</Button.Danger>}
        </div>
    );
};
