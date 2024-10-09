import { Button } from '@elements/button';
import { useStoreState } from '@/state/hooks';
import { updateSettings } from '@/api/admin/ai/settings';

export default () => {
    const enabled = useStoreState(state => state.everest.data!.ai.enabled);

    const submit = () => {
        updateSettings('enabled', !enabled).then(() => {
            // @ts-expect-error this is fine
            window.location = '/admin/ai';
        });
    };

    return (
        <div className={'mr-4'} onClick={submit}>
            {!enabled ? <Button>Enable Jexactyl AI</Button> : <Button.Danger>Disable Jexactyl AI</Button.Danger>}
        </div>
    );
};
