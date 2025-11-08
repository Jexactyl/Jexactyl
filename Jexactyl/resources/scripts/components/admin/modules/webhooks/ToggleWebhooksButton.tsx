import { useStoreState } from '@/state/hooks';
import { Button } from '@/elements/button';
import { update } from '@/api/routes/admin/webhooks';
import { useNavigate } from 'react-router-dom';

export default () => {
    const navigate = useNavigate();
    const enabled = useStoreState(state => state.everest.data!.webhooks.enabled);

    const submit = () => {
        update('enabled', !enabled).then(() => navigate(0));
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!enabled ? <Button>Enable Webhooks</Button> : <Button.Danger>Disable Webhooks</Button.Danger>}
        </div>
    );
};
