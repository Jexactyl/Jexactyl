import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import { updateSettings } from '@/api/routes/admin/billing';

export default () => {
    const enabled = useStoreState(state => state.everest.data!.billing.enabled);

    const submit = () => {
        updateSettings('enabled', !enabled).then(() => {
            // @ts-expect-error this is fine
            window.location = '/admin/billing';
        });
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!enabled ? <Button>Enable Billing Module</Button> : <Button.Danger>Disable Billing Module</Button.Danger>}
        </div>
    );
};
